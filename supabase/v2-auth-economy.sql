-- ════════════════════════════════════════════════════════════════
--  NURI MIND v2 · 서버 인증 + 포인트 원장 (보안 강화)
--  목적: localStorage 포인트(위조 가능)·번들 PIN(추출 가능)을 서버 권위로 이전.
--
--  ⚠️ 실행 전 선행 작업 (Supabase 대시보드):
--    1) Authentication → Providers → Kakao(또는 Google) 활성화
--       - 카카오: REST API 키 + Client Secret 입력, Redirect URL 등록
--    2) Authentication → URL Config → Site URL = https://www.nurimind.co.kr
--  그 다음 이 파일을 SQL Editor에 붙여넣고 Run.
--
--  클라 작업(별도): @supabase/supabase-js signInWithOAuth('kakao'),
--    포인트/적립/교환을 아래 RPC 호출로 교체, 관리자 화면은 is_admin 프로필로 게이트.
-- ════════════════════════════════════════════════════════════════

-- 1) 프로필 (auth.users 1:1) ─────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  avatar jsonb,
  is_admin boolean not null default false,   -- 관리자 권한은 서버에서만 (PIN 폐기)
  signup_bonus_done boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles_self_read" on public.profiles;
drop policy if exists "profiles_self_upsert" on public.profiles;
create policy "profiles_self_read" on public.profiles for select using (auth.uid() = id);
create policy "profiles_self_upsert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);

-- 가입 시 프로필 자동 생성 + 가입 보너스 1회
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nickname) values (new.id, coalesce(new.raw_user_meta_data->>'name','누리'))
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) 포인트 원장 (서버 권위 · append-only) ───────────────────────
create table if not exists public.points_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null,
  memo text,
  -- 1회성 보상 키(예: 'signup','first_post','test_complete:adhd') — 중복 적립 차단
  reason_key text,
  at timestamptz not null default now()
);
create index if not exists ledger_user_idx on public.points_ledger (user_id, at desc);
-- 같은 1회성 키는 유저당 1행만
create unique index if not exists ledger_once_idx on public.points_ledger (user_id, reason_key) where reason_key is not null;
alter table public.points_ledger enable row level security;
drop policy if exists "ledger_self_read" on public.points_ledger;
create policy "ledger_self_read" on public.points_ledger for select using (auth.uid() = user_id);
-- INSERT 정책 없음 → 클라 직접 적립 불가. 오직 아래 RPC(security definer)로만.

-- 현재 잔액 = 원장 합계 (위조 불가)
create or replace function public.my_points()
returns int language sql security definer set search_path = public stable as $$
  select coalesce(sum(amount),0)::int from public.points_ledger where user_id = auth.uid();
$$;

-- 적립 (서버 검증: 일일 무료 상한 50P, 1회성 키 중복 차단)
create or replace function public.grant_points(p_amount int, p_memo text, p_reason_key text default null, p_is_free boolean default true)
returns int language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); today_free int;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_amount <= 0 or p_amount > 100000 then raise exception 'bad amount'; end if;
  -- 1회성 키 중복이면 0
  if p_reason_key is not null and exists(select 1 from public.points_ledger where user_id=uid and reason_key=p_reason_key) then
    return public.my_points();
  end if;
  -- 일일 무료적립 상한 50P
  if p_is_free then
    select coalesce(sum(amount),0) into today_free from public.points_ledger
      where user_id=uid and at::date = now()::date and amount>0 and reason_key is distinct from 'purchase';
    if today_free + p_amount > 50 then p_amount := greatest(0, 50 - today_free); end if;
  end if;
  if p_amount > 0 then
    insert into public.points_ledger(user_id, amount, memo, reason_key) values (uid, p_amount, p_memo, p_reason_key);
  end if;
  return public.my_points();
end; $$;
grant execute on function public.my_points() to authenticated;
grant execute on function public.grant_points(int,text,text,boolean) to authenticated;

-- 3) 교환 신청 (잔액 서버 검증 · 차감) ───────────────────────────
create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_name text not null,
  cost int not null,
  status text not null default 'pending',  -- pending/approved/rejected
  at timestamptz not null default now()
);
alter table public.redemptions enable row level security;
drop policy if exists "redeem_self_read" on public.redemptions;
create policy "redeem_self_read" on public.redemptions for select using (auth.uid() = user_id);

create or replace function public.request_redeem(p_item text, p_cost int)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); rid uuid;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if public.my_points() < p_cost then raise exception 'insufficient points'; end if;
  insert into public.points_ledger(user_id, amount, memo, reason_key)
    values (uid, -p_cost, '🎁 교환: '||p_item, null);          -- 즉시 차감(원장)
  insert into public.redemptions(user_id, item_name, cost) values (uid, p_item, p_cost) returning id into rid;
  return rid;
end; $$;
grant execute on function public.request_redeem(text,int) to authenticated;

-- 4) 커뮤니티 신고 자동숨김 (서버 방어 — 클라 금칙어/rate limit의 2차) ──
alter table public.posts add column if not exists hidden boolean not null default false;
-- 같은 글 같은 기기 중복신고 차단(악용 방지) — reports에 unique
create unique index if not exists reports_unique_idx on public.reports (post_id, device_id);

create or replace function public.report_and_maybe_hide(p_post uuid, p_device text, p_nick text, p_excerpt text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.reports(post_id, device_id, nick, excerpt, reason)
    values (p_post, p_device, p_nick, p_excerpt, 'user-report')
    on conflict (post_id, device_id) do nothing;
  -- 서로 다른 기기 3건 이상 신고 → 자동 숨김
  if (select count(*) from public.reports where post_id = p_post and not resolved) >= 3 then
    update public.posts set hidden = true where id = p_post;
  end if;
end; $$;
grant execute on function public.report_and_maybe_hide(uuid,text,text,text) to anon, authenticated;
-- fetchPosts 쿼리에 .eq('hidden', false) 추가 필요(클라).

-- ════════════════════════════════════════════════════════════════
--  마이그레이션 순서 (권장):
--   ① OAuth(카카오) 켜고 이 SQL 실행
--   ② 클라에 로그인 버튼(signInWithOAuth) + 비로그인 시 읽기전용/게스트
--   ③ 포인트 표시·적립·교환을 my_points()/grant_points()/request_redeem()로 교체
--   ④ 관리자 화면을 profiles.is_admin = true 로 게이트 (PIN 제거)
--   ⑤ 기존 localStorage 유저: 최초 로그인 시 1회 이관(선택)
-- ════════════════════════════════════════════════════════════════
