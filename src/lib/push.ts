/**
 * 웹 푸시 — 알림 권한 + 구독(PushManager) + 서버 저장.
 *  · VITE_VAPID_PUBLIC_KEY 미설정이면 비활성(no-op) — 그래서 키 없이도 앱은 정상.
 *  · 구독은 save_push_subscription RPC로 Supabase에 저장 → 엣지 push-send가 발송.
 *  · 라이브(https)에서만 동작(localhost는 SW 미등록).
 */
import { supabase } from './supabase'

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/** VAPID 키 + Supabase가 모두 준비됐는지 (둘 중 하나라도 없으면 토글 숨김) */
export function pushConfigured(): boolean {
  return !!VAPID_PUBLIC && !/X{4,}/.test(VAPID_PUBLIC) && !!supabase
}

export function pushPermission(): NotificationPermission | 'unsupported' {
  if (!pushSupported()) return 'unsupported'
  return Notification.permission
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

/** 알림 켜기 — 권한 요청 + 구독 + 서버 저장. 성공 시 true. */
export async function enablePush(): Promise<boolean> {
  if (!pushSupported() || !pushConfigured() || !supabase) return false
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return false
  const reg = await navigator.serviceWorker.ready
  const existing = await reg.pushManager.getSubscription()
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC!) as BufferSource,
    }))
  const json = sub.toJSON()
  const { error } = await supabase.rpc('save_push_subscription', {
    p_endpoint: json.endpoint,
    p_p256dh: json.keys?.p256dh ?? '',
    p_auth: json.keys?.auth ?? '',
  })
  return !error
}

/** 알림 끄기 — 로컬 구독 해제(서버 만료분은 엣지가 410으로 자동 정리). */
export async function disablePush(): Promise<void> {
  if (!pushSupported()) return
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (sub) await sub.unsubscribe().catch(() => {})
}
