-- ════════════════════════════════════════════════════════════════
--  서버 감사 확정 수정 (2026-09) — 기존 마이그레이션 파일은 그대로 두고 이 파일로만 덮어쓴다
--  전제: schema.sql → v2-auth-economy.sql → referrals.sql → diamonds.sql → mailbox.sql
--        → mailbox_v2.sql(또는 mailbox-fix-encoding.sql) → economy-sync.sql 적용 완료.
--  적용: 내용을 Supabase SQL Editor에 붙여넣고 Run (1회). 재실행해도 안전(멱등).
--  ⚠️ 이 파일 적용 후 위 옛 파일(특히 mailbox*.sql·schema.sql)을 재실행하면 여기 수정이 되돌아간다.
--     옛 파일을 다시 돌렸다면 이 파일도 다시 돌릴 것.
-- ════════════════════════════════════════════════════════════════

-- ── 1) 🔴 grant_points_to_code: 누구나(anon 포함) 호출 가능했다 ──────────────
--  referrals.sql은 anon·authenticated에서만 revoke했는데, 새 함수의 기본 실행권은 PUBLIC에 있다.
--  → 비로그인 상태로 rpc('grant_points_to_code', {p_code, p_amount: 임의값})를 부르면
--    아무 코드 주인에게나 상한 없이(음수 포함) 포인트를 적립/차감할 수 있었다.
--  redeem_referral은 SECURITY DEFINER(소유자 권한)로 이 함수를 부르므로 revoke해도 동작한다.
revoke all on function public.grant_points_to_code(text, int, text, text) from public, anon, authenticated;

-- ── 2) 🔴 profiles: 본인 행 update 정책이 모든 컬럼을 열어 뒀다 → is_admin 자가 승격 ──
--  profiles_self_update(using auth.uid()=id)만 있고 컬럼 제한이 없어서
--  update profiles set is_admin=true where id=auth.uid() 한 줄로 운영자가 됐다
--  → grant_diamonds_nick/send_mail_nick로 본인에게 다이아(유료 재화) 무한 지급.
--  insert 정책도 같은 구멍(프로필 행이 없는 계정은 is_admin=true로 직접 생성 가능).
--  클라는 profiles를 직접 쓰지 않는다(모두 SECURITY DEFINER RPC) — 표시용 컬럼만 열어 둔다.
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, nickname, avatar) on public.profiles to authenticated;
grant update (nickname, avatar) on public.profiles to authenticated;
-- 확인 — 여기 나오는 운영자가 전부 의도한 계정인지 반드시 눈으로 볼 것(자가 승격 흔적 점검)
select id, nickname, created_at from public.profiles where is_admin order by created_at;

-- ── 3) 🔴 request_redeem: 음수 비용 = 포인트 발행 + 동시 요청 이중 차감 ─────────
--  p_cost 검증이 없어 p_cost=-100000이면 잔액 검사를 통과하고 원장에 +100000이 들어갔다.
--  또 잔액 확인과 차감 사이에 잠금이 없어 동시 요청 N건이 같은 잔액으로 모두 통과했다.
create or replace function public.request_redeem(p_item text, p_cost int)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); rid uuid;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_cost is null or p_cost <= 0 or p_cost > 100000 then raise exception 'bad cost'; end if;
  -- 같은 유저의 교환 요청을 한 줄로 세운다(트랜잭션 끝에 자동 해제)
  perform pg_advisory_xact_lock(hashtext('redeem:' || uid::text));
  if public.my_points() < p_cost then raise exception 'insufficient points'; end if;
  insert into public.points_ledger(user_id, amount, memo, reason_key)
    values (uid, -p_cost, '🎁 교환: ' || left(coalesce(p_item, ''), 60), null);
  insert into public.redemptions(user_id, item_name, cost) values (uid, left(coalesce(p_item, ''), 60), p_cost) returning id into rid;
  return rid;
end; $$;
grant execute on function public.request_redeem(text, int) to authenticated;

-- ── 4) 🔴 cancel_purchase: 받기와 동시에 누르면 다이아 수령 + 환불 둘 다 ───────
--  예전: select(미수령 확인) → delete. 그 사이 claim_mail이 끼어들면 수령된 행을 지우고 'refunded'.
--  수정: 조건을 delete 한 문장에 넣어 원자적으로. 행 잠금 순서상 둘 중 하나만 성공한다.
create or replace function public.cancel_purchase(p_id bigint)
returns text language plpgsql security definer set search_path = public as $$
declare r record;
begin
  delete from public.diamond_grants
   where id = p_id and user_id = auth.uid()
     and not claimed and kind = 'purchase' and refundable;
  if found then return 'refunded'; end if;  -- 미수령분 환불(실 PG 환불은 별도 처리)
  select claimed into r from public.diamond_grants where id = p_id and user_id = auth.uid();
  if not found then return 'not_found'; end if;
  if r.claimed then return 'already_claimed'; end if;
  return 'not_refundable';
end; $$;
grant execute on function public.cancel_purchase(bigint) to authenticated;

-- ── 5) 🟠 만료 우편이 '모두 받기'로는 수령됐다 ─────────────────────────────
--  mailbox_v2.sql은 claim_mail에만 expires_at 조건을 넣었다. claim_all_mail·claim_my_diamond_grants는
--  mailbox.sql/diamonds.sql 버전 그대로라 목록에서 숨겨진 만료 우편까지 전부 수령됐다.
create or replace function public.claim_all_mail()
returns int language plpgsql security definer set search_path = public as $$
declare total int;
begin
  with upd as (
    update public.diamond_grants set claimed = true, claimed_at = now()
      where user_id = auth.uid() and not claimed
        and (expires_at is null or expires_at > now())
      returning amount
  )
  select coalesce(sum(amount), 0) into total from upd;
  return coalesce(total, 0);
end; $$;
grant execute on function public.claim_all_mail() to authenticated;

create or replace function public.claim_my_diamond_grants()
returns int language plpgsql security definer set search_path = public as $$
declare total int;
begin
  if auth.uid() is null then return 0; end if;
  with upd as (
    update public.diamond_grants set claimed = true, claimed_at = now()
      where user_id = auth.uid() and not claimed
        and (expires_at is null or expires_at > now())
      returning amount
  )
  select coalesce(sum(amount), 0) into total from upd;
  return coalesce(total, 0);
end; $$;
grant execute on function public.claim_my_diamond_grants() to authenticated;

-- ── 6) 🟠 커뮤니티: 좋아요 임의 증감 · 좋아요 수를 정해서 글 작성 · 숨김 글 노출 ──
--  bump_like(delta)가 delta를 그대로 더해 한 번 호출로 +1000000도 됐다 → ±1로 제한.
create or replace function public.bump_like(pid uuid, delta int)
returns void language sql security definer set search_path = public as $$
  update public.posts set likes = greatest(0, likes + greatest(-1, least(1, coalesce(delta, 0)))) where id = pid;
$$;
grant execute on function public.bump_like(uuid, int) to anon, authenticated;

--  insert 정책이 body 길이만 봐서 likes=99999·hidden 값을 직접 넣을 수 있었다.
drop policy if exists "posts_insert" on public.posts;
create policy "posts_insert" on public.posts for insert
  with check (char_length(body) between 1 and 280 and likes = 0 and hidden = false);

--  hidden=true(운영자/자동 숨김) 글이 select using(true)라 그대로 내려갔다(클라는 hidden 필터 없음).
drop policy if exists "posts_select" on public.posts;
create policy "posts_select" on public.posts for select using (not hidden);

-- ── 7) 🟠 AI 엣지 함수 일일 한도 — bump_ai_usage RPC가 리포 어디에도 없다 ─────────
--  _shared/llm.ts의 withinQuota()는 RPC가 없으면(404) '통과'로 처리한다(fail-open).
--  즉 이 RPC가 DB에 없으면 유료 LLM 엔드포인트 3개에 호출 한도가 전혀 없다.
--  ⚠️ 먼저 확인: 아래 쿼리가 행을 돌려주면 이미 수동으로 만든 버전이 있는 것 — 그 정의를 보고
--     반환형이 boolean이 아니면 이 섹션은 건너뛸 것(create or replace가 반환형 변경을 거부한다).
--     select pg_get_functiondef('public.bump_ai_usage'::regproc);
create table if not exists public.ai_usage (
  subject text not null,          -- u:<uid> 또는 ip:<해시 앞 12바이트> — 원문 IP는 저장하지 않는다
  fn text not null,
  day date not null default ((now() at time zone 'Asia/Seoul')::date),
  count int not null default 0,
  primary key (subject, fn, day)
);
alter table public.ai_usage enable row level security;
-- 정책 없음 → anon/authenticated는 읽기·쓰기 불가. 엣지 함수가 service_role로만 호출.

-- 한도 안이면 true(카운터 +1). 원자적 upsert라 동시 호출에도 카운트가 새지 않는다.
create or replace function public.bump_ai_usage(p_subject text, p_fn text, p_limit int)
returns boolean language plpgsql set search_path = public as $$
declare n int;
begin
  insert into public.ai_usage(subject, fn, day, count)
    values (left(p_subject, 80), left(p_fn, 40), (now() at time zone 'Asia/Seoul')::date, 1)
  on conflict (subject, fn, day) do update set count = public.ai_usage.count + 1
  returning ai_usage.count into n;
  return n <= p_limit;
end; $$;
revoke all on function public.bump_ai_usage(text, text, int) from public, anon, authenticated;
grant execute on function public.bump_ai_usage(text, text, int) to service_role;

-- 오래된 카운터 정리(선택) — 필요하면 pg_cron에 걸 것:
--   delete from public.ai_usage where day < (now() at time zone 'Asia/Seoul')::date - 7;

-- ── 확인 ─────────────────────────────────────────────────────────
--  ① anon이 grant_points_to_code를 못 부르면 false
select has_function_privilege('anon', 'public.grant_points_to_code(text,int,text,text)', 'execute') as anon_can_grant_to_code;
--  ② authenticated가 is_admin을 못 바꾸면 false
select has_column_privilege('authenticated', 'public.profiles', 'is_admin', 'update') as auth_can_set_admin;
