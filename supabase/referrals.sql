-- ─────────────────────────────────────────────────────────────
-- 초대(레퍼럴) 서버 검증 — 계정(auth uid)당 1회만 초대 보상
--   목적: localStorage 초기화로 +100P 무한 파밍하는 어뷰징을 서버에서 차단.
--   전제: 카카오 OAuth(Supabase Auth) 활성화(완료). 실행: Supabase SQL Editor에 붙여넣기.
--   ⚠️ 인바이터(코드 보유자) 포인트 실지급은 서버 원장(v2-auth-economy.sql) 배포 후
--      아래 RPC의 TODO 위치에서 grant_points로 연결. 그 전까지는 '초대 관계 기록 + 1회 검증'만 수행.
-- ─────────────────────────────────────────────────────────────

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

-- 피초대자가 초대 코드를 1회 등록.
--   반환: 'ok'(최초 등록) · 'used'(이미 초대받은 계정) · 'no_auth'(비로그인) · 'invalid'(코드형식)
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

  insert into public.referrals(referred_uid, referrer_code) values (v_uid, v_code);

  -- TODO(v2-auth-economy 배포 후): 서버 원장에 직접 지급
  --   perform public.grant_points(100, '🤝 친구 초대 코드 입력 보상');                      -- 피초대자
  --   perform public.grant_points_to_code(v_code, 100, '🎉 내 코드로 친구가 가입');         -- 인바이터(코드→uid 매핑 필요)
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
