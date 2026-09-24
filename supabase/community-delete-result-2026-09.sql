-- ════════════════════════════════════════════════════════════════
--  커뮤니티 삭제 RPC가 '실제로 지웠는지'를 돌려준다 (2026-09-25)
--  배경: delete_my_post/delete_my_comment가 void라 비밀이 틀려 0행을 지워도 클라는 성공으로 보고
--        '지워진 것처럼' 보였다(독립 보안 검토 낮음 항목).
--  반환형 변경은 create or replace로 안 돼서 drop → create. 이름·인자는 같다.
--  호환: 옛 클라(main)는 반환값을 쓰지 않으므로 그대로 동작. 새 클라는 false면 실패 안내.
--  권한은 drop으로 사라지므로 다시 준다(community-owner-fix와 같은 범위).
-- ════════════════════════════════════════════════════════════════
begin;

drop function if exists public.delete_my_post(uuid, text);
drop function if exists public.delete_my_comment(uuid, text);

create function public.delete_my_post(pid uuid, did text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with d as (
    delete from public.posts
     where id = pid
       and coalesce(did, '') <> ''
       and owner_hash is not null
       and owner_hash = encode(extensions.digest(did, 'sha256'), 'hex')
    returning 1
  )
  select exists (select 1 from d);
$$;

create function public.delete_my_comment(cid uuid, did text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with d as (
    delete from public.comments
     where id = cid
       and coalesce(did, '') <> ''
       and owner_hash is not null
       and owner_hash = encode(extensions.digest(did, 'sha256'), 'hex')
    returning 1
  )
  select exists (select 1 from d);
$$;

revoke execute on function public.delete_my_post(uuid, text)    from public;
revoke execute on function public.delete_my_comment(uuid, text) from public;
grant  execute on function public.delete_my_post(uuid, text)    to anon, authenticated, service_role;
grant  execute on function public.delete_my_comment(uuid, text) to anon, authenticated, service_role;

commit;

-- 확인: 반환형 boolean, anon 실행 가능, 정의에 owner_hash 비교 유지
select pg_get_function_result('public.delete_my_post(uuid, text)'::regprocedure)    as post_ret,
       pg_get_function_result('public.delete_my_comment(uuid, text)'::regprocedure) as comment_ret,
       has_function_privilege('anon', 'public.delete_my_post(uuid, text)', 'execute') as anon_exec,
       pg_get_functiondef('public.delete_my_post(uuid, text)'::regprocedure) ~ 'owner_hash' as owner_check;
