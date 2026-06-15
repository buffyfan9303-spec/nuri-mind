-- ════════════════════════════════════════════════════════════════
--  NURI MIND · Supabase 시작 스키마 (project ref: xdcglyavndiwbbaryocx)
--  Supabase 대시보드 > SQL Editor 에 붙여넣어 실행하세요.
--  현재 앱은 익명(localStorage) 동작이라, 서버가 필요한 "공유 데이터"
--  (커뮤니티/설문/리그)부터 단계적으로 옮기는 것을 권장합니다.
-- ════════════════════════════════════════════════════════════════

-- 1) 프로필 (auth.users 1:1) ──────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default '누리',
  avatar jsonb,                 -- { kind: 'animal'|'photo', ... }
  points int not null default 100,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "프로필 누구나 읽기" on public.profiles for select using (true);
create policy "본인 프로필만 수정" on public.profiles for update using (auth.uid() = id);
create policy "본인 프로필 생성" on public.profiles for insert with check (auth.uid() = id);

-- 2) 커뮤니티 글 ──────────────────────────────────────────────────
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author uuid references auth.users(id) on delete set null,
  nick text not null,
  avatar jsonb,
  badge text,
  body text not null check (char_length(body) <= 280),
  likes int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.posts enable row level security;
create policy "글 누구나 읽기" on public.posts for select using (true);
create policy "로그인 유저만 작성" on public.posts for insert with check (auth.uid() = author);
create policy "본인 글만 삭제" on public.posts for delete using (auth.uid() = author);

-- 좋아요 (유저별 1회) ─────────────────────────────────────────────
create table if not exists public.post_likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  primary key (post_id, user_id)
);
alter table public.post_likes enable row level security;
create policy "좋아요 누구나 읽기" on public.post_likes for select using (true);
create policy "본인 좋아요만" on public.post_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3) 설문 (운영자 승인제) ─────────────────────────────────────────
create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users(id) on delete set null,
  emoji text, title text not null, descr text,
  questions jsonb not null,
  reward int not null default 50,
  target int not null default 100,
  responses int not null default 0,
  status text not null default 'pending',   -- pending | approved | rejected
  reject_reason text,
  created_at timestamptz not null default now()
);
alter table public.surveys enable row level security;
create policy "승인 설문 공개 + 본인 설문" on public.surveys for select
  using (status = 'approved' or auth.uid() = owner);
create policy "로그인 유저 설문 등록" on public.surveys for insert with check (auth.uid() = owner);

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references public.surveys(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  answers jsonb not null,
  created_at timestamptz not null default now(),
  unique (survey_id, user_id)            -- 1인 1응답
);
alter table public.survey_responses enable row level security;
create policy "본인 응답만 읽기" on public.survey_responses for select using (auth.uid() = user_id);
create policy "본인 응답만 작성" on public.survey_responses for insert with check (auth.uid() = user_id);

-- 4) 포인트 원장 (적립/사용 이력) ─────────────────────────────────
create table if not exists public.ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  amount int not null,
  memo text,
  created_at timestamptz not null default now()
);
alter table public.ledger enable row level security;
create policy "본인 원장만" on public.ledger for select using (auth.uid() = user_id);

-- 신규 가입 시 프로필 자동 생성 트리거 ────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nickname) values (new.id, '누리')
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- TODO: redemptions, applications(체험단), weekly_league 등은 운영 정책 확정 후 추가
