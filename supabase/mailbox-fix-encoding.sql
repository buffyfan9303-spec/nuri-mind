-- ════════════════════════════════════════════════════════════════
--  우편함 한글 깨짐(모지바케) 원클릭 복구 — 2026-08-12
--
--  ⚠️ 실행 방법(중요):
--   1) 이 파일을 "업로드"하지 말고, 내용을 복사해 Supabase SQL Editor에 "붙여넣기" 하세요.
--   2) 붙여넣은 뒤 에디터 화면에서 아래 한글('다이아', '운영자' 등)이 깨져 보이지 않는지
--      눈으로 확인한 다음 Run 하세요. (에디터에서 이미 깨져 보이면 실행해도 다시 깨집니다)
--   3) mailbox.sql / mailbox_v2.sql 를 다시 실행할 필요는 없습니다 — 이 파일 하나로
--      한글 리터럴이 들어간 함수 재정의 + 이미 깨져 저장된 데이터 수리를 모두 합니다.
-- ════════════════════════════════════════════════════════════════

-- 1) 이미 깨져 저장된 행 수리 — 한글이 하나도 없는 제목/발신자를 재구성
update public.diamond_grants
   set title = '💎 다이아 ' || amount || '개 도착'
 where amount > 0
   and (title is null or title !~ '[가-힣]');

update public.diamond_grants
   set title = '📬 새 우편'
 where (amount is null or amount = 0)
   and (title is null or title !~ '[가-힣]');

update public.diamond_grants
   set sender = '운영자'
 where sender is null or sender !~ '[가-힣]';

-- body가 깨진 경우(한글 없음 + 라틴 확장 잡음) 비움 — 깨진 문장 노출 방지
update public.diamond_grants
   set body = null
 where body is not null
   and body !~ '[가-힣a-zA-Z0-9]';

-- 2) 한글 리터럴이 들어간 함수 재정의(mailbox_v2 정의와 동일 — 만료 포함 버전)
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

-- 3) 확인 — 아래 결과의 title/sender 한글이 정상으로 보이면 성공
select id, title, sender, amount, claimed from public.diamond_grants order by id desc limit 10;
