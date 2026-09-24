-- ════════════════════════════════════════════════════════════════
--  커뮤니티 옛 글 잠금 + device_id 읽기 권한 회수 (2026-09-25) — 라이브 마이그레이션 community_legacy_lock_2026_09
--  전제: community-owner-fix-2026-09.sql 적용 완료(2026-09-24 05:41:48 UTC). 멱등.
--
--  1) 옛 글: owner-fix 이전 글은 owner_hash = sha256(옛 deviceId)다. deviceId가 짧아(약 31비트)
--     공개된 해시에서 오프라인으로 역산해 delete_my_post로 지울 수 있었다.
--     → owner_hash를 비워 '운영자만 삭제'로 잠근다(delete_my_post는 owner_hash가 null이면 지우지 않는다).
--     device_id 칸도 같은 해시 사본이라 자리표시로 덮는다(NOT NULL).
--     2026-09-25 기준 해당 행: posts 3(2026-06-15 초기 글)·comments 0.
--  2) device_id 칸 SELECT 회수 — owner_hash와 같은 값의 사본이라 앱에 필요 없다.
--     새 클라는 컬럼을 명시해 읽고(POST_COLS·COMMENT_COLS, device_id 없음) insert 뒤엔 select('id')만 한다.
--     select('*')로 읽던 옛 클라(PR #2 이전)는 막힌다 — 서비스워커가 네비게이션을 네트워크 우선으로 받아
--     새로고침하면 새 클라가 된다(2026-09-25 배포). owner_hash는 '내 글' 판정에 쓰므로 계속 공개한다
--     (새 글은 256비트 난수 토큰의 해시라 역산 불가).
-- ════════════════════════════════════════════════════════════════

update public.posts
   set owner_hash = null, device_id = 'locked:' || id::text
 where created_at < '2026-09-24 05:41:48+00' and (owner_hash is not null or device_id not like 'locked:%');
update public.comments
   set owner_hash = null, device_id = 'locked:' || id::text
 where created_at < '2026-09-24 05:41:48+00' and (owner_hash is not null or device_id not like 'locked:%');

revoke select on public.posts from anon, authenticated;
grant select (id, nick, avatar, badge, body, likes, created_at, hidden, owner_hash) on public.posts to anon, authenticated;
revoke select on public.comments from anon, authenticated;
grant select (id, post_id, nick, avatar, badge, body, created_at, owner_hash) on public.comments to anon, authenticated;
