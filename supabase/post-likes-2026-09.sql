-- ════════════════════════════════════════════════════════════════
--  좋아요 1인 1회 (2026-09-25) — 라이브 마이그레이션 post_likes_2026_09
--  전제: community-owner-fix-2026-09.sql 적용 완료. 멱등.
--
--  문제: bump_like(pid, ±1)는 anon도 부를 수 있고 누가 눌렀는지 기록이 없어,
--        스크립트로 +1을 반복하면 좋아요 수를 마음대로 올릴 수 있었다(인기글 기준 10).
--
--  바뀌는 것
--   1) post_likes(post_id, liker) — 누른 사람을 해시로만 기록(원문 비밀·IP는 저장 안 함). API로는 못 읽는다.
--   2) set_like(pid, did, want) — 새 클라. did = 기기 소유 토큰(community.ts ownerToken, 로컬에만 있는 난수).
--      liker = sha256('like:' || did). 같은 기기는 글마다 1번. 켜고 끄기는 멱등.
--   3) IP 상한 — 비밀은 새로 만들면 그만이라, 한 IP가 한 글에 최대 3번(가족·학교 공용 IP 여유),
--      전체 1시간 60번까지만. IP는 게이트웨이가 넣는 헤더(cf-connecting-ip → x-forwarded-for 첫 값,
--      Supabase 문서 'Securing your API')를 쓰고 sha256 해시만 남긴다. 2026-09-25 실측: 클라가 보낸 XFF는 덮어써졌다.
--   4) bump_like — 이미 배포된 옛 클라가 계속 부르므로 없애지 않고 'IP당 글마다 1번'으로 바꾼다.
--      liker = 'ip:' || ip해시. 새 클라가 배포되면 호출이 사라진다.
--   기존 likes 숫자는 그대로 두고 증감만 기록과 맞춘다(옛 좋아요는 누가 눌렀는지 모르므로 되살릴 수 없다).
-- ════════════════════════════════════════════════════════════════

create table if not exists public.post_likes (
  post_id  uuid not null references public.posts(id) on delete cascade,
  liker    text not null,
  ip_hash  text,
  at       timestamptz not null default now(),
  primary key (post_id, liker)
);
create index if not exists post_likes_ip_idx on public.post_likes (ip_hash, at desc);
alter table public.post_likes enable row level security;
revoke all on table public.post_likes from public, anon, authenticated;

-- 요청 IP 해시 — API(PostgREST) 요청이 아니면 null
create or replace function public._req_ip_hash()
returns text
language sql
stable
set search_path = public
as $$
  select case when ip = '' then null
              else encode(sha256(convert_to('nuri-like:' || ip, 'UTF8')), 'hex') end
  from (
    select coalesce(
             nullif(nullif(current_setting('request.headers', true), '')::json->>'cf-connecting-ip', ''),
             nullif(trim(split_part(nullif(current_setting('request.headers', true), '')::json->>'x-forwarded-for', ',', 1)), ''),
             '') as ip
  ) h;
$$;
revoke execute on function public._req_ip_hash() from public, anon, authenticated;

-- 공통: liker로 좋아요를 켜거나 끄고 새 숫자를 돌려준다
create or replace function public._apply_like(p_pid uuid, p_liker text, p_on boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text := public._req_ip_hash();
  v_n int;
  v_liked boolean;
begin
  if p_pid is null or p_liker is null then
    return null;
  end if;
  perform pg_advisory_xact_lock(hashtext('like:' || p_pid::text));
  if p_on then
    if not exists (select 1 from public.post_likes where post_id = p_pid and liker = p_liker) then
      if v_ip is not null and (
           (select count(*) from public.post_likes where post_id = p_pid and ip_hash = v_ip) >= 3
        or (select count(*) from public.post_likes where ip_hash = v_ip and at > now() - interval '1 hour') >= 60
      ) then
        -- 상한 초과: 조용히 무시하고 현재 상태를 돌려준다
        null;
      else
        insert into public.post_likes (post_id, liker, ip_hash) values (p_pid, p_liker, v_ip)
          on conflict do nothing;
        if found then
          update public.posts set likes = likes + 1 where id = p_pid;
        end if;
      end if;
    end if;
  else
    delete from public.post_likes where post_id = p_pid and liker = p_liker;
    if found then
      update public.posts set likes = greatest(0, likes - 1) where id = p_pid;
    end if;
  end if;
  select likes into v_n from public.posts where id = p_pid;
  v_liked := exists (select 1 from public.post_likes where post_id = p_pid and liker = p_liker);
  return jsonb_build_object('liked', v_liked, 'likes', coalesce(v_n, 0));
end;
$$;
revoke execute on function public._apply_like(uuid, text, boolean) from public, anon, authenticated;

-- 새 클라용
create or replace function public.set_like(pid uuid, did text, want boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if did is null or length(did) < 16 or length(did) > 200 then
    return null;
  end if;
  return public._apply_like(pid, encode(sha256(convert_to('like:' || did, 'UTF8')), 'hex'), coalesce(want, true));
end;
$$;
revoke execute on function public.set_like(uuid, text, boolean) from public;
grant execute on function public.set_like(uuid, text, boolean) to anon, authenticated;

-- 옛 클라 호환: IP당 글마다 1번
create or replace function public.bump_like(pid uuid, delta int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text := public._req_ip_hash();
begin
  if v_ip is null or coalesce(delta, 0) = 0 then
    return;
  end if;
  perform public._apply_like(pid, 'ip:' || v_ip, delta > 0);
end;
$$;
revoke execute on function public.bump_like(uuid, int) from public;
grant execute on function public.bump_like(uuid, int) to anon, authenticated;
