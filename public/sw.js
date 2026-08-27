/*
 * 누리 마인드 서비스워커 — 안전 우선(라이브 사이트 stale-shell 브릭 방지).
 *  · 네비게이션(HTML): 네트워크 우선 → 오프라인일 때만 캐시된 셸(항상 최신 index 보장)
 *  · 정적 자산(해시 파일명=불변): 캐시 우선
 *  · 외부 오리진(광고·분석·Supabase): 그대로 통과(가로채지 않음)
 */
const CACHE = 'nurimind-v2'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // 외부는 패스

  // 네비게이션: 네트워크 우선(최신 index) → 실패 시 캐시 셸
  if (req.mode === 'navigate') {
    e.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req)
          // 5xx/404 HTML이 정상 셸('/')을 덮어쓰지 않게 — 성공 응답만 캐시.
          // ⚠️ /api/* 는 SPA 셸이 아니므로 절대 '/'로 저장하면 안 된다(오프라인 셸 오염·리다이렉트 루프).
          if (fresh.ok && !url.pathname.startsWith('/api/')) {
            const cache = await caches.open(CACHE)
            cache.put('/', fresh.clone()).catch(() => {})
          }
          return fresh
        } catch {
          if (url.pathname.startsWith('/api/')) return Response.error()
          const cache = await caches.open(CACHE)
          return (await cache.match('/')) || (await cache.match(req)) || Response.error()
        }
      })(),
    )
    return
  }

  // 정적 자산: 캐시 우선 + 미스 시 네트워크 후 저장
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      const cached = await cache.match(req)
      if (cached) return cached
      try {
        const fresh = await fetch(req)
        if (fresh.ok && fresh.type === 'basic') cache.put(req, fresh.clone()).catch(() => {})
        return fresh
      } catch {
        return cached || Response.error()
      }
    })(),
  )
})

/* 웹 푸시 — 서버(Supabase 엣지 push-send)가 보낸 메시지 표시 */
self.addEventListener('push', (e) => {
  let data = {}
  try {
    data = e.data ? e.data.json() : {}
  } catch {
    data = {}
  }
  const title = data.title || '누리 마인드'
  e.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '',
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url: data.url || '/' },
    }),
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const target = (e.notification.data && e.notification.data.url) || '/'
  e.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const c of all) {
        if ('focus' in c) {
          c.navigate(target).catch(() => {})
          return c.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target)
    })(),
  )
})
