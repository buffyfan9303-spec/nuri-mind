-- ════════════════════════════════════════════════════════════════
--  grant_points 남용 상한 (2026-09-25) — 라이브 마이그레이션 grant_points_cap_2026_09
--  전제: audit-fixes-2026-09.sql · advisor-fixes-2026-09.sql 적용 완료.
--  멱등: 몇 번 돌려도 같은 결과.
--
--  문제 — 로그인한 누구나 rpc('grant_points')를 직접 부를 수 있는데
--   · 금액을 호출자가 정한다(건당 최대 100000).
--   · p_is_free=false면 일일 상한이 없다(클라가 항상 false를 보낸다 — 제품 정책상 무료 상한 제거).
--   · p_reason_key=null이면 중복 차단도 없다 → 무한 반복 발행.
--
--  왜 '보상표(reward_catalog)로 금액을 서버가 정한다'로 바로 가지 않았나:
--   포인트는 로컬 우선 구조다(economy.ts). 서버 원장은 기기 간 복원용 미러이고,
--   local_migration은 로컬 잔액 전체를, refund:*는 교환가를 보낸다. 서버가 여기서 예외를 던지면
--   클라 아웃박스가 그 항목에서 멈춰(flushOutbox=false) 이후 적립·새 기기 복원까지 막힌다.
--   그래서 이번 수정은 '거절'이 아니라 '조용히 깎기(clamp)'로, 정상 사용에는 닿지 않는 상한만 건다.
--   서버 권위 원장으로의 전환은 결제 도입 조건(docs/BILLING.md)과 함께 한다.
--
--  바뀌는 것
--   1) reason_key가 없으면 지급하지 않는다(현재 클라는 항상 키를 보낸다 — 의미 키 또는 evt:).
--   2) local_migration 외 적립은 건당 10000P 상한(설문 최대 8000·교환 환불 최대 5000 수용).
--   3) local_migration 외 적립은 사용자별 하루 합계 10000P 상한(실측 최대 행 411P).
--      local_migration은 기존대로 계정당 1회(키 중복 차단)·최대 100000P.
--   4) request_redeem — 앱이 호출하지 않는다(교환은 로컬 지갑 + mirror_spend). 실행권을 회수해
--      서버 원장 포인트를 서버 교환 신청으로 바꾸는 경로를 닫는다. redemptions 0행(2026-09-25).
-- ════════════════════════════════════════════════════════════════

create or replace function public.grant_points(p_amount int, p_memo text, p_reason_key text default null, p_is_free boolean default true)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  today_sum int;
  per_call_max constant int := 10000;
  daily_max constant int := 10000;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_amount <= 0 or p_amount > 100000 then raise exception 'bad amount'; end if;
  -- 1) 키 없는 지급 금지 — 중복 차단을 우회하는 유일한 길이었다
  if p_reason_key is null or length(p_reason_key) = 0 then
    return public.my_points();
  end if;
  -- 같은 사용자의 동시 호출이 상한·중복 확인을 함께 통과하지 않도록 직렬화
  perform pg_advisory_xact_lock(hashtext('grant_points:' || uid::text));
  -- 1회성 키 중복이면 0
  if exists(select 1 from public.points_ledger where user_id = uid and reason_key = p_reason_key) then
    return public.my_points();
  end if;
  if p_reason_key <> 'local_migration' then
    -- 2) 건당 상한
    p_amount := least(p_amount, per_call_max);
    -- 3) 하루 합계 상한(이관분 제외)
    select coalesce(sum(amount), 0) into today_sum from public.points_ledger
      where user_id = uid and at::date = now()::date and amount > 0
        and reason_key is distinct from 'local_migration';
    p_amount := least(p_amount, greatest(0, daily_max - today_sum));
  end if;
  -- 기존 무료 적립 상한(25P) — 클라는 현재 보내지 않지만 계약 유지
  if p_is_free then
    select coalesce(sum(amount), 0) into today_sum from public.points_ledger
      where user_id = uid and at::date = now()::date and amount > 0 and reason_key is distinct from 'purchase';
    if today_sum + p_amount > 25 then p_amount := greatest(0, 25 - today_sum); end if;
  end if;
  if p_amount > 0 then
    insert into public.points_ledger(user_id, amount, memo, reason_key) values (uid, p_amount, p_memo, p_reason_key);
  end if;
  return public.my_points();
end;
$$;

revoke execute on function public.grant_points(int, text, text, boolean) from public, anon;
grant execute on function public.grant_points(int, text, text, boolean) to authenticated;

-- 4) 앱 미사용 RPC 닫기
revoke execute on function public.request_redeem(text, int) from public, anon, authenticated;

-- 확인
--  select has_function_privilege('authenticated', 'public.request_redeem(text,int)', 'execute');  -- false
--  select has_function_privilege('authenticated', 'public.grant_points(int,text,text,boolean)', 'execute');  -- true
