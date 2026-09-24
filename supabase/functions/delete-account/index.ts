// 계정 삭제 — 로그인한 본인이 자기 계정을 지운다(Google Play 계정 삭제 정책 · Apple 5.1.1(v)).
//
// ⚠️ 배포: npx supabase functions deploy delete-account --project-ref xdcglyavndiwbbaryocx
//    SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY는 기본 주입. verify_jwt 켠 채로 둔다(로그인 사용자만).
// 호출: POST /functions/v1/delete-account  헤더 Authorization: Bearer <사용자 access_token>
//
// 지우는 것: auth.users 행 → FK ON DELETE CASCADE로 profiles·points_ledger·diamond_grants·redemptions·
//   push_subscriptions·referrals가 함께 사라진다(2026-09-24 스키마 확인). ai_usage(일별 호출 수)도 본인 것 삭제.
// 지우지 않는 것: 커뮤니티 글·댓글 — 계정이 아니라 기기에 묶인 익명 글이라 계정으로 찾을 수 없다(화면에서 안내).
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
}
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'content-type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json(405, { error: 'method' })

  const jwt = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!jwt) return json(401, { error: 'no_token' })

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  // 토큰의 주인만 지운다 — 바디로 받은 id는 절대 쓰지 않는다
  const { data, error } = await admin.auth.getUser(jwt)
  const uid = data?.user?.id
  if (error || !uid) return json(401, { error: 'invalid_token' })

  // ai_usage.subject는 'u:<uid>' / 'ip:<해시>' 형식(_shared/llm.ts withinQuota)
  await admin.from('ai_usage').delete().eq('subject', `u:${uid}`)
  const del = await admin.auth.admin.deleteUser(uid)
  if (del.error) return json(500, { error: 'delete_failed' }) // 내부 오류 문구는 밖으로 내지 않는다
  return json(200, { ok: true })
})
