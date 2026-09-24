-- ════════════════════════════════════════════════════════════════
--  Supabase 어드바이저 후속 수정 (2026-09) — ⚠️ 아직 라이브 미적용. 검토 후 적용할 것.
--  전제: audit-fixes-2026-09.sql(라이브 마이그레이션 audit_fixes_2026_09) 적용 완료.
--  근거: get_advisors(security/performance) 2026-09-24 04:55Z 결과 + 라이브 proacl·pg_policies 조회.
--  멱등: 몇 번 돌려도 같은 결과. 섹션 A·B는 현재 프로덕션 클라(main)와 PR 클라 모두 영향 없음을 확인했다.
--
--  배경 — 왜 audit-fixes 후에도 경고가 남는가:
--   함수의 기본 EXECUTE는 PUBLIC(=모든 롤)에 있다. anon에서만 revoke해도 PUBLIC 경유로 계속 실행된다.
--   그래서 "revoke ... from public, anon" 후 "grant ... to authenticated"로 명시해야 실제로 닫힌다.
-- ════════════════════════════════════════════════════════════════

-- ── A) 🟠 WARN 0028/0029 — 로그인 전용 RPC를 anon(비로그인)에서 닫는다 ───────────────
--  전부 auth.uid()로 본인만 다루거나(null이면 0/예외) is_admin을 검사하므로 지금도 데이터가 새지는 않는다.
--  하지만 비로그인 호출 표면·운영자 함수의 노출 자체를 없앤다. 클라 확인:
--   · my_points/claim_my_diamond_grants/ensure_my_referral_code/redeem_referral — 오류면 null/0/'unavailable' 폴백
--   · my_mail — Mailbox 화면이 로그인(u)일 때만 호출(main·PR 동일)
--   · grant_points/mirror_spend — 세션 있을 때만 의미(오류 시 false/fail 폴백)
--   · grant_diamonds_nick/send_mail_nick — 운영자 화면(로그인 필수)
--   · grant_diamonds/send_mail_admin/request_redeem/cancel_purchase — 로그인 흐름에서만 호출(또는 미사용)
--  Supabase 익명 로그인 사용자도 롤은 authenticated라 영향 없다(현재 anonymous_users=false).
do $$
declare f text;
begin
  foreach f in array array[
    'public.cancel_purchase(bigint)',
    'public.claim_all_mail()',
    'public.claim_mail(bigint)',
    'public.claim_my_diamond_grants()',
    'public.ensure_my_referral_code()',
    'public.grant_points(integer, text, text, boolean)',
    'public.my_mail()',
    'public.my_points()',
    'public.redeem_referral(text)',
    'public.request_redeem(text, integer)',
    'public.grant_diamonds(uuid, integer, text)',
    'public.grant_diamonds_nick(text, integer)',
    'public.send_mail_admin(uuid, text, text, integer)',
    'public.send_mail_nick(text, text, text, integer)'
  ] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated, service_role', f);
  end loop;
end $$;

-- ── B) 🟠 WARN 0028/0029 — 아무도 RPC로 부를 이유가 없는 함수 ──────────────────────
--  handle_new_user: auth.users 트리거 함수(on_auth_user_created). 트리거 실행엔 EXECUTE 권한이 필요 없다.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

--  report_and_maybe_hide: 클라(main·PR)는 쓰지 않는다(신고는 reports 테이블 insert). 그런데 anon이 직접 부르면
--  기기 ID 3개를 지어내 아무 글이나 즉시 숨길 수 있다(서로 다른 device_id 3건 → hidden=true).
revoke execute on function public.report_and_maybe_hide(uuid, text, text, text) from public, anon, authenticated;

-- ── C) 의도적으로 남기는 anon 실행 (어드바이저 경고는 계속 뜬다 — 수용) ────────────────
--  커뮤니티는 가입 없이 device_id로 동작하는 설계라 아래는 anon이 불러야 한다:
--   bump_like(±1로 제한됨) · delete_my_post · delete_my_comment · referral_count · save_push_subscription
--  단, delete_my_post/delete_my_comment는 아래 D의 구멍이 있다.

-- ── D) 🔴 (어드바이저 밖) 아무나 남의 글·댓글을 지울 수 있다 — 클라 수정이 같이 필요 ──────
--  posts/comments의 device_id 컬럼을 anon이 select로 그대로 읽는다(select using(not hidden)/true, 컬럼 제한 없음).
--  delete_my_post(pid, did)는 "where device_id = did"만 보므로, 목록에서 device_id를 읽어 그대로 넘기면 삭제된다.
--  클라(src/lib/community.ts)가 row.device_id === deviceId로 '내 글' 표시를 하므로 컬럼을 바로 막으면
--  select('*')가 권한 오류로 커뮤니티 전체가 깨진다 → 아래는 클라 변경과 **같이** 배포할 설계안(주석).
--   1) alter table public.posts add column if not exists device_hash text;   -- comments도 동일
--      update public.posts set device_hash = encode(extensions.digest(device_id, 'sha256'), 'hex') where device_hash is null;
--   2) insert 트리거로 device_hash 채우기, delete_my_post는 그대로 device_id(원문=비밀) 비교
--   3) revoke select on public.posts from anon, authenticated;
--      grant select (id, nick, avatar, badge, body, likes, created_at, hidden, device_hash) on public.posts to anon, authenticated;
--   4) 클라: mine = row.device_hash === sha256(deviceId) 로 교체, select 컬럼 명시
--  (pgcrypto는 extensions 스키마에 있음을 적용 전 확인: select extname, extnamespace::regnamespace from pg_extension;)

-- ── E) 🟠 WARN 0014 — pg_net이 public 스키마에 설치됨 ──────────────────────────────
--  pg_net의 함수는 원래 net 스키마에 있고(크론 morning-fortune-push가 net.http_post 사용) public에는 확장 메타만 있다.
--  옮기려면 drop/create가 필요해 크론 호출이 잠시 끊긴다. 급하지 않음 — 트래픽 적은 시간에 아래로:
--   drop extension if exists pg_net; create extension pg_net with schema extensions;
--   (적용 후 select * from cron.job_run_details order by start_time desc limit 3; 로 다음 발송 확인)

-- ── F) 🟠 WARN — Leaked Password Protection 꺼짐 (SQL 아님, 대시보드) ─────────────────
--  Authentication → Sign In / Providers(또는 Attack Protection) → "Prevent use of leaked passwords" ON.
--  email provider가 켜져 있으므로 의미 있음. (Pro 플랜 이상 기능 — 플랜에 따라 토글이 비활성일 수 있음)
--  INFO 0008 ai_usage "RLS 켜짐·정책 없음"은 의도(service_role 전용) — 조치 불필요.

-- ── G) (성능, 선택) WARN 0003 auth_rls_initplan — auth.uid()를 행마다 재평가 ─────────────
alter policy "profiles_self_read"        on public.profiles           using ((select auth.uid()) = id);
alter policy "profiles_self_update"      on public.profiles           using ((select auth.uid()) = id);
alter policy "profiles_self_upsert"      on public.profiles           with check ((select auth.uid()) = id);
alter policy "ledger_self_read"          on public.points_ledger      using ((select auth.uid()) = user_id);
alter policy "redeem_self_read"          on public.redemptions        using ((select auth.uid()) = user_id);
alter policy "referral self read"        on public.referrals          using ((select auth.uid()) = referred_uid);
alter policy "diamond_grants self read"  on public.diamond_grants     using ((select auth.uid()) = user_id);
alter policy "push_self_read"            on public.push_subscriptions using ((select auth.uid()) = user_id);

--  INFO 0001 FK 인덱스 없음
create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);
create index if not exists redemptions_user_id_idx on public.redemptions (user_id);

-- ── 확인 ─────────────────────────────────────────────────────────
--  모두 false여야 한다
select p.proname, has_function_privilege('anon', p.oid, 'execute') as anon_can_exec
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in ('cancel_purchase','claim_all_mail','claim_mail','claim_my_diamond_grants','ensure_my_referral_code',
                     'grant_points','my_mail','my_points','redeem_referral','request_redeem','grant_diamonds',
                     'grant_diamonds_nick','send_mail_admin','send_mail_nick','handle_new_user','report_and_maybe_hide');
--  로그인 사용자는 계속 부를 수 있어야 한다(true)
select has_function_privilege('authenticated', 'public.my_points()', 'execute') as auth_can_my_points;
