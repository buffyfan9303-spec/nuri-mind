-- ════════════════════════════════════════════════════════════════
--  커뮤니티 글·댓글 소유권 수정 (2026-09) — ⚠️ 아직 라이브 미적용. 코디네이터가 적용.
--  대상 구멍: advisor-fixes-2026-09.sql 섹션 D — "아무나 남의 글·댓글을 지울 수 있다".
--   · posts/comments.device_id를 anon이 select로 읽는다
--   · delete_my_post(pid, did)/delete_my_comment(cid, did)가 "device_id = did"만 본다
--   → 목록에서 읽은 device_id를 그대로 넘기면 남의 글이 지워졌다.
--
--  설계 — 비밀은 서버에 해시만, 원문은 기기에만:
--   1) owner_hash 컬럼 = sha256(비밀) hex. 새 클라는 기기에서 만든 32바이트 난수 토큰의 해시를 insert 때 보낸다.
--   2) 트리거가 device_id 칸을 owner_hash로 덮어쓴다 → device_id 칸에 원문 비밀이 더는 저장되지 않는다.
--      (옛 클라가 device_id 원문만 보내면 owner_hash = sha256(device_id)로 채운 뒤 덮어쓴다)
--   3) delete_my_post/delete_my_comment는 "owner_hash = sha256(넘긴 비밀)"로만 지운다. 함수 이름·인자는 그대로라
--      옛 클라도 계속 동작한다(옛 클라는 비밀 = 자기 deviceId).
--   4) 기존 행(backfill): owner_hash = sha256(기존 device_id), device_id도 해시로 덮는다.
--
--  기존 행(owner_hash 없던 글)의 소유권 결정:
--   기존 글은 "비밀 = 옛 device_id"로 계속 본인이 지울 수 있게 둔다(새 클라는 sha256(deviceId)가 맞으면 deviceId를 보낸다).
--   단, 이 값은 적용 전까지 공개 컬럼이었으므로 **적용 전에 목록을 긁어 둔 사람**은 기존 글을 여전히 지울 수 있다.
--   적용 시점 라이브 행 수는 posts 3·comments 0(2026-09-24 조회)이라 수용한다. 더 엄격히 하려면 아래 (선택) 블록으로
--   기존 행의 owner_hash를 null로 두면 "운영자만 삭제 가능"이 된다.
--
--  클라 호환(src/lib/community.ts):
--   · 새 클라: select 컬럼 명시(device_id 제외, owner_hash 포함). owner_hash 컬럼이 없으면(=이 SQL 미적용)
--     42703/PGRST204를 감지해 옛 경로(device_id 비교)로 자동 폴백한다 → 배포 순서 무관.
--   · 옛 클라(select('*')): 계속 동작. device_id가 해시라 '내 글' 표시만 사라진다(삭제 버튼 안 보임) — 보안상 수용.
--
--  멱등: 몇 번 돌려도 같은 결과. pgcrypto는 extensions 스키마(2026-09-24 확인).
-- ════════════════════════════════════════════════════════════════

begin;

-- ── 1) 컬럼 ───────────────────────────────────────────────────────
alter table public.posts    add column if not exists owner_hash text;
alter table public.comments add column if not exists owner_hash text;

-- ── 2) 기존 행 backfill — device_id(원문)의 해시를 소유 해시로, device_id 칸은 해시로 덮는다 ──
--  이미 해시로 덮인 행(owner_hash가 있는 행)은 건드리지 않는다(멱등).
update public.posts
   set owner_hash = encode(extensions.digest(device_id, 'sha256'), 'hex')
 where owner_hash is null and device_id is not null;
update public.posts    set device_id = owner_hash where owner_hash is not null and device_id is distinct from owner_hash;

update public.comments
   set owner_hash = encode(extensions.digest(device_id, 'sha256'), 'hex')
 where owner_hash is null and device_id is not null;
update public.comments set device_id = owner_hash where owner_hash is not null and device_id is distinct from owner_hash;

-- ── 3) insert 트리거 — 원문 비밀이 테이블에 남지 않게 ─────────────────────
--  owner_hash는 64자 소문자 hex만 받는다(아무 문자열이나 넣어 목록을 오염시키지 않게).
create or replace function public.community_owner_hash()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.owner_hash is not null then
    new.owner_hash := lower(new.owner_hash);
    if new.owner_hash !~ '^[0-9a-f]{64}$' then
      raise exception 'invalid owner_hash' using errcode = '22023';
    end if;
  elsif new.device_id is not null then
    -- 옛 클라: device_id 원문 → 해시
    new.owner_hash := encode(extensions.digest(new.device_id, 'sha256'), 'hex');
  end if;
  -- device_id 칸(NOT NULL일 수 있음)에는 해시만 남긴다
  new.device_id := coalesce(new.owner_hash, 'none');
  return new;
end $$;

drop trigger if exists posts_owner_hash on public.posts;
create trigger posts_owner_hash before insert on public.posts
  for each row execute function public.community_owner_hash();
drop trigger if exists comments_owner_hash on public.comments;
create trigger comments_owner_hash before insert on public.comments
  for each row execute function public.community_owner_hash();

-- 트리거 함수는 RPC로 부를 이유가 없다
revoke execute on function public.community_owner_hash() from public, anon, authenticated;

-- ── 4) 삭제 RPC — 넘긴 비밀의 해시가 owner_hash와 같을 때만 ──────────────────
--  이름·인자(pid uuid, did text)는 그대로: 옛 클라(did=deviceId)와 새 클라(did=토큰 또는 기존 글이면 deviceId) 모두 호환.
--  빈 문자열·null 비밀은 거부(해시가 우연히 null 비교로 통과하지 않게 owner_hash is not null도 명시).
create or replace function public.delete_my_post(pid uuid, did text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.posts
   where id = pid
     and coalesce(did, '') <> ''
     and owner_hash is not null
     and owner_hash = encode(extensions.digest(did, 'sha256'), 'hex');
$$;

create or replace function public.delete_my_comment(cid uuid, did text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.comments
   where id = cid
     and coalesce(did, '') <> ''
     and owner_hash is not null
     and owner_hash = encode(extensions.digest(did, 'sha256'), 'hex');
$$;

revoke execute on function public.delete_my_post(uuid, text)    from public;
revoke execute on function public.delete_my_comment(uuid, text) from public;
grant  execute on function public.delete_my_post(uuid, text)    to anon, authenticated, service_role;
grant  execute on function public.delete_my_comment(uuid, text) to anon, authenticated, service_role;

commit;

-- ── (선택) 더 엄격: 기존 행은 운영자만 삭제 — 적용 전 목록을 긁어 둔 사람의 삭제까지 막는다 ──
--  update public.posts    set owner_hash = null where created_at < '<적용 시각>';
--  update public.comments set owner_hash = null where created_at < '<적용 시각>';

-- ── (2단계, 선택) 옛 클라(select('*'))가 캐시에서 사라진 뒤 — device_id 칸 자체를 숨긴다 ──
--  지금은 device_id가 해시라 노출돼도 삭제에 못 쓰므로 급하지 않다. 옛 클라는 select('*')라 이걸 먼저 하면 커뮤니티가 깨진다.
--  revoke select on public.posts from anon, authenticated;
--  grant select (id, nick, avatar, badge, body, likes, created_at, hidden, owner_hash) on public.posts to anon, authenticated;
--  revoke select on public.comments from anon, authenticated;
--  grant select (id, post_id, nick, avatar, badge, body, created_at, owner_hash) on public.comments to anon, authenticated;

-- ── 확인 ─────────────────────────────────────────────────────────
--  0이어야 한다(원문 device_id가 남은 행 없음)
select (select count(*) from public.posts    where device_id is distinct from owner_hash) as posts_raw_left,
       (select count(*) from public.comments where device_id is distinct from owner_hash) as comments_raw_left;
--  delete_my_post 정의에 owner_hash 비교가 들어갔는지
select pg_get_functiondef('public.delete_my_post(uuid, text)'::regprocedure) ~ 'owner_hash' as delete_post_fixed,
       pg_get_functiondef('public.delete_my_comment(uuid, text)'::regprocedure) ~ 'owner_hash' as delete_comment_fixed;
