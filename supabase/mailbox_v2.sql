-- ⚠️ 적용 순서: mailbox.sql 이후 적용. 이 파일이 my_mail/claim_mail를 만료(expires_at) 포함 버전으로 재정의(supersede).
-- ─────────────────────────────────────────────────────────────
-- 우편함 v2 — 만료기간(기본 30일) + 운영자 닉네임 기반 지급/개인우편
--   전제: mailbox.sql 선행. 운영자 지급/우편 RPC는 호출자 is_admin 필요(WTA를 is_admin으로 설정해야 동작).
-- ─────────────────────────────────────────────────────────────

alter table public.diamond_grants add column if not exists expires_at timestamptz;
alter table public.diamond_grants alter column expires_at set default (now() + interval '30 days');
update public.diamond_grants set expires_at = at + interval '30 days' where expires_at is null;

-- 내 우편(만료된 미수령은 숨김) + 만료일 반환
drop function if exists public.my_mail();
create or replace function public.my_mail()
returns table(id bigint, kind text, title text, body text, sender text, amount int, points int, claimed boolean, refundable boolean, at timestamptz, expires_at timestamptz)
language sql security definer set search_path = public stable as $$
  select id, kind,
         coalesce(title, case when amount > 0 then '💎 다이아 ' || amount || '개 도착' else '📬 새 우편' end) as title,
         body, coalesce(sender, '운영자') as sender, amount, points, claimed, refundable, at, expires_at
    from public.diamond_grants
   where user_id = auth.uid()
     and (claimed or expires_at is null or expires_at > now())
   order by claimed asc, id desc
   limit 100;
$$;
grant execute on function public.my_mail() to authenticated;

-- 받기 — 만료 우편은 수령 불가
create or replace function public.claim_mail(p_id bigint)
returns int language plpgsql security definer set search_path = public as $$
declare amt int;
begin
  update public.diamond_grants set claimed = true, claimed_at = now()
    where id = p_id and user_id = auth.uid() and not claimed
      and (expires_at is null or expires_at > now())
    returning amount into amt;
  return coalesce(amt, 0);
end; $$;
grant execute on function public.claim_mail(bigint) to authenticated;

-- 운영자: 닉네임으로 다이아 지급(우편 적재). 호출자 is_admin 필요. 반환 'ok'·'no_user'
create or replace function public.grant_diamonds_nick(p_nick text, p_amount int)
returns text language plpgsql security definer set search_path = public as $$
declare caller uuid := auth.uid(); tgt uuid;
begin
  if caller is null or not exists (select 1 from public.profiles where id = caller and is_admin) then raise exception 'admin only'; end if;
  if p_amount <= 0 or p_amount > 1000000 then raise exception 'bad amount'; end if;
  select id into tgt from public.profiles where nickname = p_nick limit 1;
  if tgt is null then return 'no_user'; end if;
  insert into public.diamond_grants(user_id, amount, kind, title, sender)
    values (tgt, p_amount, 'grant', '💎 다이아 ' || p_amount || '개 도착', '운영자');
  return 'ok';
end; $$;
grant execute on function public.grant_diamonds_nick(text, int) to authenticated;

-- 운영자: 닉네임으로 개인 우편 발송. 호출자 is_admin 필요.
create or replace function public.send_mail_nick(p_nick text, p_title text, p_body text, p_dia int default 0)
returns text language plpgsql security definer set search_path = public as $$
declare caller uuid := auth.uid(); tgt uuid;
begin
  if caller is null or not exists (select 1 from public.profiles where id = caller and is_admin) then raise exception 'admin only'; end if;
  select id into tgt from public.profiles where nickname = p_nick limit 1;
  if tgt is null then return 'no_user'; end if;
  insert into public.diamond_grants(user_id, amount, kind, title, body, sender)
    values (tgt, greatest(0, coalesce(p_dia, 0)), 'personal', p_title, p_body, '운영자');
  return 'ok';
end; $$;
grant execute on function public.send_mail_nick(text, text, text, int) to authenticated;
