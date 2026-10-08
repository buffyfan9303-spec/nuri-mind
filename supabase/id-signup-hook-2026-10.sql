-- ─────────────────────────────────────────────────────────────
-- 아이디 가입(이메일 provider) 제한 — Auth Hook 'before-user-created'
--   왜: 아이디 가입을 위해 'Confirm email'을 끄면, 남의 실제 메일(예: victim@gmail.com)로 비밀번호 계정을
--       미리 만들어 두고, 나중에 그 사람이 Google로 로그인할 때 자동 연결(identity linking)로 계정을 가로챌 수 있다.
--   그래서: 이메일 provider 가입은 메일을 받을 수 없는 내부 주소(@id.nurimind.co.kr)만 허용한다.
--           카카오·구글 등 OAuth 가입은 그대로 통과. 같은 IP의 아이디 가입은 1시간 5건까지(대량 가입 마찰).
--   적용: ① 이 SQL 실행 ② 대시보드 Authentication > Hooks > Before User Created → Postgres
--           → public.hook_id_signup_only 선택·저장 ③ 그 다음에 Email의 'Confirm email' 끄기 (순서 중요)
--   ⚠️ id.nurimind.co.kr 하위 도메인에는 MX/메일 수신을 절대 만들지 않는다 — 만들면 비밀번호 재설정으로 아이디 계정 탈취.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.id_signup_log (
  ip text not null,
  at timestamptz not null default now()
);
create index if not exists id_signup_log_ip_at on public.id_signup_log (ip, at);
alter table public.id_signup_log enable row level security; -- 정책 없음 = anon/authenticated 접근 불가
revoke all on table public.id_signup_log from public, anon, authenticated;
grant select, insert, delete on table public.id_signup_log to supabase_auth_admin;

create or replace function public.hook_id_signup_only(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  provider text := event->'user'->'app_metadata'->>'provider';
  email text := lower(coalesce(event->'user'->>'email', ''));
  v_ip text := coalesce(event->'metadata'->>'ip_address', '');
begin
  -- OAuth(카카오·구글 등)는 손대지 않는다
  if provider is distinct from 'email' then
    return '{}'::jsonb;
  end if;

  if email !~ '^[a-z0-9_]{4,20}@id\.nurimind\.co\.kr$' then
    return jsonb_build_object('error', jsonb_build_object('http_code', 403, 'message', 'signup_not_allowed'));
  end if;

  delete from public.id_signup_log where at < now() - interval '1 day';
  if (select count(*) from public.id_signup_log where id_signup_log.ip = v_ip and at > now() - interval '1 hour') >= 5 then
    return jsonb_build_object('error', jsonb_build_object('http_code', 429, 'message', 'too_many_signups'));
  end if;
  insert into public.id_signup_log (ip) values (v_ip);
  return '{}'::jsonb;
end;
$$;

grant execute on function public.hook_id_signup_only(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_id_signup_only(jsonb) from public, anon, authenticated;
