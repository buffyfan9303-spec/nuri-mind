-- ─────────────────────────────────────────────────────────────
-- 다이아(유료 재화) 운영자 지급 — '지급 인박스' 모델
--   다이아 잔액은 기기 localStorage(클라)에 있고, 운영자 지급분만 서버에 적재 →
--   사용자가 로그인하면 1회 '수령'(claim)해 로컬 잔액에 가산. 서버에서 claimed 처리해 중복지급 차단.
--   전제: v2-auth-economy.sql(profiles·is_admin) 선행. 실행: Supabase SQL Editor / Management API.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.diamond_grants (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null,
  memo text,
  claimed boolean not null default false,  -- 수령 완료(중복지급 차단)
  at timestamptz not null default now()
);
create index if not exists diamond_grants_unclaimed_idx on public.diamond_grants (user_id) where not claimed;
alter table public.diamond_grants enable row level security;
drop policy if exists "diamond_grants self read" on public.diamond_grants;
create policy "diamond_grants self read" on public.diamond_grants for select using (auth.uid() = user_id);
-- INSERT/UPDATE 정책 없음 → 아래 SECURITY DEFINER RPC로만(위조 차단)

-- 내게 온 미수령 지급을 '원자적으로' 수령(claimed=true) 후 합계 반환 → 클라가 로컬 다이아에 1회 가산.
--   재호출/재로딩해도 이미 claimed라 0 반환 = 중복지급 불가.
create or replace function public.claim_my_diamond_grants()
returns int language plpgsql security definer set search_path = public as $$
declare total int;
begin
  if auth.uid() is null then return 0; end if;
  with upd as (
    update public.diamond_grants set claimed = true
      where user_id = auth.uid() and not claimed
      returning amount
  )
  select coalesce(sum(amount), 0) into total from upd;
  return coalesce(total, 0);
end; $$;
grant execute on function public.claim_my_diamond_grants() to authenticated;

-- 운영자 지급(앱 내 콘솔용) — 호출자 profiles.is_admin 일 때만 대상 uid에 적재.
create or replace function public.grant_diamonds(p_target uuid, p_amount int, p_memo text default '운영자 지급')
returns bigint language plpgsql security definer set search_path = public as $$
declare caller uuid := auth.uid(); gid bigint;
begin
  if caller is null or not exists (select 1 from public.profiles where id = caller and is_admin) then
    raise exception 'admin only';
  end if;
  if p_amount <= 0 or p_amount > 1000000 then raise exception 'bad amount'; end if;
  insert into public.diamond_grants(user_id, amount, memo) values (p_target, p_amount, p_memo) returning id into gid;
  return gid;
end; $$;
grant execute on function public.grant_diamonds(uuid, int, text) to authenticated;
