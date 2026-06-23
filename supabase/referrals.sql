-- ⚠️ 적용 순서: v2-auth-economy.sql 이후 적용. 이 파일이 handle_new_user를 referral_code 포함 버전으로 재정의(supersede).
-- ─────────────────────────────────────────────────────────────
-- 초대(레퍼럴) 서버 검증 + 양방향 포인트 실지급 (완성본)
--   목적: localStorage 초기화로 +100P 무한 파밍하는 어뷰징을 서버에서 차단 + 초대자/피초대자 둘 다 서버 원장으로 실지급.
--   전제: ① 카카오 OAuth(Supabase Auth) 활성화(완료)  ② v2-auth-economy.sql 먼저 실행(profiles·points_ledger·grant_points 필요).
--   실행 순서: v2-auth-economy.sql → (이 파일) referrals.sql 을 Supabase SQL Editor에 붙여넣고 Run.
--   클라 1줄 정렬: 사용자에게 보여주는 초대코드를 ensure_my_referral_code() 반환값으로 사용(아래 RPC).
-- ─────────────────────────────────────────────────────────────

-- 0) 각 유저의 고유 초대코드(profiles.referral_code) — 코드→uid 역매핑 위해 서버가 부여 -----------------
alter table public.profiles add column if not exists referral_code text unique;

-- uid 기반 결정적 코드(NURI-XXXXXX, 6 hex) 백필 — 기존 유저 포함
update public.profiles
   set referral_code = 'NURI-' || upper(substr(replace(id::text, '-', ''), 1, 6))
 where referral_code is null;

-- 신규 가입 시에도 자동 부여 (handle_new_user가 코드까지 세팅하도록 보강)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nickname, referral_code)
    values (new.id,
            coalesce(new.raw_user_meta_data->>'name','누리'),
            'NURI-' || upper(substr(replace(new.id::text, '-', ''), 1, 6)))
  on conflict (id) do nothing;
  return new;
end; $$;

-- 내 초대코드 조회(없으면 생성) — 클라가 공유 코드로 그대로 표시
create or replace function public.ensure_my_referral_code()
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); code text;
begin
  if uid is null then return null; end if;
  select referral_code into code from public.profiles where id = uid;
  if code is null then
    code := 'NURI-' || upper(substr(replace(uid::text, '-', ''), 1, 6));
    update public.profiles set referral_code = code where id = uid;
  end if;
  return code;
end; $$;
grant execute on function public.ensure_my_referral_code() to authenticated;

-- 코드 주인(인바이터)에게 직접 지급 — grant_points는 auth.uid()만 대상이라 별도 함수로 역지급
--   p_once_key로 같은 피초대자에 대한 중복 지급 차단.
create or replace function public.grant_points_to_code(p_code text, p_amount int, p_memo text, p_once_key text default null)
returns void language plpgsql security definer set search_path = public as $$
declare owner uuid;
begin
  select id into owner from public.profiles where referral_code = upper(btrim(p_code));
  if owner is null then return; end if;  -- 코드 주인 없음(구버전/미가입) → 조용히 패스
  if p_once_key is not null and exists(
       select 1 from public.points_ledger where user_id = owner and reason_key = p_once_key) then
    return;
  end if;
  insert into public.points_ledger(user_id, amount, memo, reason_key)
    values (owner, p_amount, p_memo, p_once_key);
end; $$;
-- 직접 호출 불가(내부용). redeem_referral(security definer)에서만 호출.
revoke all on function public.grant_points_to_code(text,int,text,text) from anon, authenticated;

create table if not exists public.referrals (
  referred_uid uuid primary key references auth.users(id) on delete cascade,
  referrer_code text not null,
  created_at timestamptz not null default now()
);
create index if not exists referrals_by_code on public.referrals (referrer_code);

alter table public.referrals enable row level security;

drop policy if exists "referral self read" on public.referrals;
create policy "referral self read" on public.referrals
  for select using (auth.uid() = referred_uid);
-- INSERT는 아래 SECURITY DEFINER RPC로만 (직접 insert 정책 없음 = 위조 차단)

-- 피초대자가 초대 코드를 1회 등록 + 양쪽 +100P 서버 지급.
--   반환: 'ok'(최초 등록·지급) · 'used'(이미 초대받은 계정) · 'self'(자기 코드) · 'no_auth'(비로그인) · 'invalid'(코드형식)
create or replace function public.redeem_referral(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_code text := upper(btrim(p_code));
begin
  if v_uid is null then return 'no_auth'; end if;
  if v_code !~ '^NURI-[A-Z0-9]{4,6}$' then return 'invalid'; end if;
  if exists (select 1 from public.referrals where referred_uid = v_uid) then return 'used'; end if;
  -- 자기 코드 입력 차단(자가 파밍)
  if exists (select 1 from public.profiles where id = v_uid and referral_code = v_code) then return 'self'; end if;

  insert into public.referrals(referred_uid, referrer_code) values (v_uid, v_code);

  -- 양방향 실지급 (초대 마일스톤 보상 → 일일 무료상한 미적용: p_is_free=false)
  perform public.grant_points(100, '🤝 친구 초대 코드 입력 보상', 'referral_redeem', false);            -- 피초대자(나)
  perform public.grant_points_to_code(v_code, 100, '🎉 내 코드로 친구가 가입', 'ref_in:' || v_uid::text); -- 인바이터(코드 주인)
  return 'ok';
end;
$$;
grant execute on function public.redeem_referral(text) to authenticated;

-- 인바이터: 내 코드로 가입한(=초대 성공) 사람 수 — 마일스톤 정산/표시용
create or replace function public.referral_count(p_code text)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from public.referrals where referrer_code = upper(btrim(p_code));
$$;
grant execute on function public.referral_count(text) to anon, authenticated;
