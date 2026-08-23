-- ════════════════════════════════════════════════════════════════
--  매일 아침 운세 푸시 크론 (2026-08-24)
--  선행: ① push.sql 실행 ② 엣지 함수 push-send 배포 + 시크릿 등록
--        (키·명령은 리포 루트 PUSH-KEYS.local.txt — gitignore된 로컬 파일)
--  적용: 아래 <PUSH_ADMIN_TOKEN> 을 PUSH-KEYS.local.txt 의 값으로 바꾼 뒤
--        SQL Editor에 붙여넣고 Run (1회).
--  시각: 매일 08:00 KST (= 23:00 UTC 전날) — 출근·등교 직전 골든타임.
-- ════════════════════════════════════════════════════════════════

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 기존 스케줄 있으면 교체
select cron.unschedule('morning-fortune-push')
 where exists (select 1 from cron.job where jobname = 'morning-fortune-push');

select cron.schedule(
  'morning-fortune-push',
  '0 23 * * *',  -- UTC 23:00 = KST 08:00
  $$
  select net.http_post(
    url := 'https://xdcglyavndiwbbaryocx.functions.supabase.co/push-send',
    headers := jsonb_build_object(
      'content-type', 'application/json',
      -- 게이트웨이 verify_jwt 대비(엣지 자체 인증은 x-admin-token) — anon 키는 공개키라 SQL에 둬도 안전
      'Authorization', 'Bearer <SUPABASE_ANON_KEY>',
      'x-admin-token', '<PUSH_ADMIN_TOKEN>'
    ),
    timeout_milliseconds := 60000,
    body := jsonb_build_object(
      'title', '🔮 오늘의 운세가 도착했어요',
      'body', '총운·행운의 색·숫자까지 — 3초면 확인!',
      'url', '/fortune'
    )
  );
  $$
);

-- 확인 — 1행(morning-fortune-push, 0 23 * * *) 나오면 성공
select jobname, schedule, active from cron.job where jobname = 'morning-fortune-push';
