-- ─────────────────────────────────────────────────────────────
-- 우편함(Mailbox) — 국내 게임 방식. diamond_grants를 일반 우편으로 확장.
--   · 운영자 지급/시스템/개인 우편/유료결제가 우편함에 적재 → 사용자가 '받기'(수령)로 첨부 재화를 잔액에 가산.
--   · 청약철회(환불): 유료결제(purchase)는 '미수령(unclaimed)'일 때만 가능. '받기'(수령)하면 콘텐츠 사용 개시로 간주 → 청약철회 불가(전자상거래법·디지털콘텐츠 지침).
--   전제: diamonds.sql(diamond_grants) 선행. 실행: Management API / SQL Editor.
-- ─────────────────────────────────────────────────────────────

alter table public.diamond_grants add column if not exists kind text not null default 'grant';  -- grant|purchase|system|personal
alter table public.diamond_grants add column if not exists title text;
alter table public.diamond_grants add column if not exists body text;
alter table public.diamond_grants add column if not exists sender text;        -- 발신자 표시명(운영자/시스템/닉네임)
alter table public.diamond_grants add column if not exists points int not null default 0;  -- 첨부 포인트(선택)
alter table public.diamond_grants add column if not exists refundable boolean not null default false;  -- 유료결제 미수령 시 환불 가능
alter table public.diamond_grants add column if not exists claimed_at timestamptz;

-- 내 우편 목록(미수령 먼저, 최신순)
create or replace function public.my_mail()
returns table(id bigint, kind text, title text, body text, sender text, amount int, points int, claimed boolean, refundable boolean, at timestamptz)
language sql security definer set search_path = public stable as $$
  select id, kind,
         coalesce(title, case when amount > 0 then '💎 다이아 ' || amount || '개 도착' else '📬 새 우편' end) as title,
         body, coalesce(sender, '운영자') as sender, amount, points, claimed, refundable, at
    from public.diamond_grants
   where user_id = auth.uid()
   order by claimed asc, id desc
   limit 100;
$$;
grant execute on function public.my_mail() to authenticated;

-- 우편 1건 '받기'(수령) → 첨부 다이아 반환(클라가 로컬 잔액에 가산), claimed 처리.
--   유료결제건은 이 시점에 청약철회 불가 확정.
create or replace function public.claim_mail(p_id bigint)
returns int language plpgsql security definer set search_path = public as $$
declare amt int;
begin
  update public.diamond_grants set claimed = true, claimed_at = now()
    where id = p_id and user_id = auth.uid() and not claimed
    returning amount into amt;
  return coalesce(amt, 0);
end; $$;
grant execute on function public.claim_mail(bigint) to authenticated;

-- 미수령 우편 일괄 받기 → 받은 다이아 합계
create or replace function public.claim_all_mail()
returns int language plpgsql security definer set search_path = public as $$
declare total int;
begin
  with upd as (
    update public.diamond_grants set claimed = true, claimed_at = now()
      where user_id = auth.uid() and not claimed
      returning amount
  )
  select coalesce(sum(amount), 0) into total from upd;
  return coalesce(total, 0);
end; $$;
grant execute on function public.claim_all_mail() to authenticated;

-- 청약철회(환불 요청) — 미수령 유료결제(purchase·refundable)만. 수령(claimed)되면 불가.
--   반환: 'refunded' · 'already_claimed'(수령후 불가) · 'not_refundable' · 'not_found'
create or replace function public.cancel_purchase(p_id bigint)
returns text language plpgsql security definer set search_path = public as $$
declare r record;
begin
  select * into r from public.diamond_grants where id = p_id and user_id = auth.uid();
  if r is null then return 'not_found'; end if;
  if r.claimed then return 'already_claimed'; end if;
  if r.kind <> 'purchase' or not r.refundable then return 'not_refundable'; end if;
  delete from public.diamond_grants where id = p_id;  -- 미수령분 환불(실 PG 환불은 별도 처리)
  return 'refunded';
end; $$;
grant execute on function public.cancel_purchase(bigint) to authenticated;

-- 운영자 개인 우편 발송 — is_admin만. 대상 uid에 텍스트(+선택 다이아) 우편 적재.
create or replace function public.send_mail_admin(p_target uuid, p_title text, p_body text, p_dia int default 0)
returns bigint language plpgsql security definer set search_path = public as $$
declare caller uuid := auth.uid(); gid bigint;
begin
  if caller is null or not exists (select 1 from public.profiles where id = caller and is_admin) then
    raise exception 'admin only';
  end if;
  insert into public.diamond_grants(user_id, amount, kind, title, body, sender)
    values (p_target, greatest(0, coalesce(p_dia, 0)), 'personal', p_title, p_body, '운영자')
    returning id into gid;
  return gid;
end; $$;
grant execute on function public.send_mail_admin(uuid, text, text, int) to authenticated;
