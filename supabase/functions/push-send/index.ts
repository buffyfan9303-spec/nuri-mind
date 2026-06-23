// 웹 푸시 발송 — 운영자/크론이 호출해 전체 구독자에게 알림 발송.
//
// ⚠️ 배포: supabase functions deploy push-send --project-ref xdcglyavndiwbbaryocx
// ⚠️ 시크릿(supabase secrets set ...): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT(mailto:...),
//    PUSH_ADMIN_TOKEN(임의 비밀). SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY는 기본 주입됨.
// 호출: POST /functions/v1/push-send  헤더 x-admin-token: <PUSH_ADMIN_TOKEN>
//       바디 { "title": "...", "body": "...", "url": "/" }
import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method', { status: 405 })
  if (req.headers.get('x-admin-token') !== Deno.env.get('PUSH_ADMIN_TOKEN')) {
    return new Response('forbidden', { status: 403 })
  }

  const { title, body, url } = await req.json().catch(() => ({}))
  const payload = JSON.stringify({ title: title || '누리 마인드', body: body || '', url: url || '/' })

  webpush.setVapidDetails(
    Deno.env.get('VAPID_SUBJECT') || 'mailto:buffyfan9303@gmail.com',
    Deno.env.get('VAPID_PUBLIC_KEY') || '',
    Deno.env.get('VAPID_PRIVATE_KEY') || '',
  )

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: subs } = await supabase.from('push_subscriptions').select('endpoint,p256dh,auth')

  let sent = 0
  let gone = 0
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload)
      sent++
    } catch (err) {
      const code = (err as { statusCode?: number })?.statusCode
      if (code === 404 || code === 410) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
        gone++
      }
    }
  }
  return new Response(JSON.stringify({ sent, gone }), { headers: { 'content-type': 'application/json' } })
})
