-- ⚠️ 적용 순서: 독립 파일(언제 실행해도 무방). 웹 푸시 구독 저장.
-- ════════════════════════════════════════════════════════════════
--  NURI MIND · 웹 푸시 구독 테이블 + 저장 RPC
--   엣지 함수 push-send 가 이 테이블을 읽어 VAPID로 발송.
--   선행: 없음. 후행(유저): VAPID 키 생성 + 엣지 시크릿 + functions deploy push-send.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;

-- 본인 구독만 조회(발송은 엣지가 service_role로 전체 조회 → RLS 우회)
drop policy if exists "push_self_read" on public.push_subscriptions;
create policy "push_self_read" on public.push_subscriptions for select using (auth.uid() = user_id);

-- 구독 저장(업서트) — 비로그인(anon)도 기기 단위 저장 허용. 로그인 시 user_id 연결.
create or replace function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.push_subscriptions(endpoint, p256dh, auth, user_id)
    values (p_endpoint, p_p256dh, p_auth, auth.uid())
  on conflict (endpoint) do update
    set p256dh = excluded.p256dh, auth = excluded.auth, user_id = coalesce(excluded.user_id, public.push_subscriptions.user_id);
end; $$;
grant execute on function public.save_push_subscription(text, text, text) to anon, authenticated;
