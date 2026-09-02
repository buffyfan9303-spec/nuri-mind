import { useEffect, useState } from 'react'

/**
 * 스켈레톤 깜빡임 방지 게이트 — 홀덤 캘린더에서 이식.
 *
 * 로딩이 200ms 안에 끝나면(캐시·빠른 응답) 스켈레톤을 아예 그리지 않는다. '스켈레톤이 번쩍 나타났다
 * 즉시 콘텐츠로 바뀌는' 쪽이 빈 화면 200ms보다 더 산만하다 — 사용자는 깜빡임을 '뭔가 잘못됐다'로 읽는다.
 * Mailbox·Community는 Supabase 응답이 보통 150ms 안이라 매 방문마다 이 깜빡임이 났다.
 *
 * ⚠️ App.tsx의 라우트 Suspense 폴백에는 쓰지 않는다 — 청크 로드는 충분히 길고, 거기서 200ms 빈 화면은
 *    '멈춤'으로 읽힌다.
 */
export function useSkeletonGate(loading: boolean, delay = 200): boolean {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!loading) {
      setShow(false)
      return
    }
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [loading, delay])
  return loading && show
}
