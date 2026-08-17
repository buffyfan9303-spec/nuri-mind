-- ════════════════════════════════════════════════════════════════
--  서버 경제 동기화 — 차감 미러 RPC (2026-08-18 · v2 멱등 키 포함)
--  전제: v2-auth-economy.sql 실행 완료(points_ledger·my_points 존재).
--  적용: 이 파일 내용을 Supabase SQL Editor에 붙여넣고 Run (1회).
--  ⚠️ 배포 필수 — 이 RPC가 없으면 로컬 소비(교환·복구권)가 서버 원장에
--     반영되지 못해 잔액이 서버에서 부풀려집니다(클라는 아웃박스에 대기시킴).
-- ════════════════════════════════════════════════════════════════

-- 포인트 차감 기록 — 로컬 지갑의 소비를 서버 원장에 미러링.
--   p_reason_key: 클라 아웃박스가 발급하는 고유 키 — 재시도/중복탭을 서버가 멱등 처리.
--   잔액 검사 없음: 오프라인 소비 후 동기화 시 일시적 음수 허용(원장 사실 기록 우선).
create or replace function public.mirror_spend(p_amount int, p_memo text, p_reason_key text default null)
returns int language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_amount <= 0 or p_amount > 100000 then raise exception 'bad amount'; end if;
  if p_reason_key is not null and exists(
       select 1 from public.points_ledger where user_id = uid and reason_key = p_reason_key) then
    return public.my_points();  -- 같은 이벤트 재전송 → no-op
  end if;
  insert into public.points_ledger(user_id, amount, memo, reason_key)
    values (uid, -p_amount, p_memo, p_reason_key);
  return public.my_points();
end; $$;

-- ⚠️ 신규 함수는 PUBLIC 실행권이 기본 — anon 명시 revoke + authenticated만 grant
--    (홀덤 감사에서 배운 create-or-replace ACL gotcha)
revoke all on function public.mirror_spend(int, text, text) from public, anon;
grant execute on function public.mirror_spend(int, text, text) to authenticated;

-- 확인 — mirror_spend가 1행 보이면 성공
select proname, pg_get_function_identity_arguments(oid) as args from pg_proc where proname = 'mirror_spend';
