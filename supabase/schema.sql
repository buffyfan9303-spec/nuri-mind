-- ════════════════════════════════════════════════════════════════
--  NURI MIND · Supabase 스키마 (project ref: xdcglyavndiwbbaryocx)
--  Supabase 대시보드 > SQL Editor 에 "전체 복사 → 붙여넣기 → Run".
--  로그인(Auth) 없이 기기 ID 기반으로 동작하도록 설계(MVP).
--  실행 후 앱의 커뮤니티가 자동으로 "공유 모드"로 전환됩니다.
-- ════════════════════════════════════════════════════════════════

-- ── 1) 커뮤니티 글 (지금 앱이 사용) ──────────────────────────────
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,                 -- 기기별 익명 식별자(클라가 생성)
  nick text not null,
  avatar jsonb,
  badge text,
  body text not null check (char_length(body) between 1 and 280),
  likes int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.posts enable row level security;

-- 누구나 읽기/쓰기 (MVP). 운영 안정화 후 Auth로 강화 권장.
drop policy if exists "posts_select" on public.posts;
drop policy if exists "posts_insert" on public.posts;
create policy "posts_select" on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (char_length(body) between 1 and 280);

-- 좋아요 증감 (RLS UPDATE 직접 노출 대신 함수로) ───────────────────
create or replace function public.bump_like(pid uuid, delta int)
returns void language sql security definer set search_path = public as $$
  update public.posts set likes = greatest(0, likes + delta) where id = pid;
$$;

-- 본인(기기) 글 삭제 ──────────────────────────────────────────────
create or replace function public.delete_my_post(pid uuid, did text)
returns void language sql security definer set search_path = public as $$
  delete from public.posts where id = pid and device_id = did;
$$;

grant execute on function public.bump_like(uuid, int) to anon, authenticated;
grant execute on function public.delete_my_post(uuid, text) to anon, authenticated;

-- 시드 글 (선택) ──────────────────────────────────────────────────
insert into public.posts (device_id, nick, avatar, badge, body) values
  ('seed', '집중하는 수달', '{"kind":"animal","persona":"meerkat"}', '🐿️', 'ADHD 검사 미어캣 나왔는데 "이따 하자"의 이따는 영원히 안 온대요 😭 다들 마감 어떻게 지키세요?'),
  ('seed', '명상 고슴도치', '{"kind":"animal","persona":"hedgehog"}', '🦔', '애착 검사 혼란형(고슴도치) 떴어요… 다가오면 가시 멀어지면 눈물 ㅋㅋ 너무 맞아서 소름.'),
  ('seed', '풀충전 돌고래', '{"kind":"animal","persona":"dolphin"}', '🐬', '오늘 설문 3개 + 출석 + 퀴즈로 95P 모음! 이번 달 치킨 기프티콘 목표 🍗')
on conflict do nothing;

-- ── 2) (향후) 프로필·설문 등은 Auth 도입 후 추가 ─────────────────
-- create table public.profiles (...);  -- auth.users 연동 시
-- create table public.surveys (...);
