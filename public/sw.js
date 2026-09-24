/*
 * 누리 마인드 서비스워커 — 안전 우선(라이브 사이트 stale-shell 브릭 방지).
 *  · 네비게이션(HTML): 네트워크 우선 → 오프라인일 때만 캐시된 셸(항상 최신 index 보장)
 *  · /assets/*(Vite 해시 파일명=불변): 캐시 우선
 *  · 그 밖의 같은 오리진 정적 파일(icon·manifest·og 등, 이름이 안 바뀐다): 네트워크 우선 → 오프라인이면 캐시
 *    /fonts/*(나눔스퀘어라운드 woff2)도 여기 속한다 — 네트워크 우선이지만 vercel.json이 1년 immutable 캐시를 주므로
 *    실제로는 HTTP 캐시에서 바로 나온다. ⚠️ 글꼴 파일을 교체할 땐 파일 이름을 바꿀 것(immutable이라 같은 이름은 갱신되지 않는다).
 *    /emoji/v1/*(Fluent 아이콘 SVG)도 같다 — 1년 immutable이라 그림을 바꿀 땐 폴더를 v2로 올린다(scripts/emoji-sync.mjs).
 *  · 외부 오리진(광고·분석·Supabase)·/api/*·GET 아닌 요청: 그대로 통과(가로채지 않음)
 */
// v3: v2 시절 캐시에는 ① 재배포 때마다 쌓인 옛 해시 청크 ② 해시 없는 파일(icon·manifest)을 영구 캐시 우선으로
//     잡아 둔 사본 ③ (옛 rewrite 탓에) /assets/ 경로로 저장된 index.html이 섞여 있을 수 있다 — 이름을 올려 한 번 비운다.
const CACHE = 'nurimind-v3'

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
  if (req.headers.has('range')) return // 부분 응답(206)은 Cache API에 못 넣는다 — 미디어는 브라우저에 맡긴다
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // 외부는 패스
  // /api/*는 서버 함수(동적 OG·리다이렉트)다 — 캐시하면 옛 응답이 굳는다
  if (url.pathname.startsWith('/api/')) return

  // 네비게이션: 네트워크 우선(최신 index) → 실패 시 캐시 셸
  if (req.mode === 'navigate') {
    e.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req)
          // 5xx/404 HTML이 정상 셸('/')을 덮어쓰지 않게 — 성공 응답만 캐시.
          // 리다이렉트를 거친 응답은 셸로 저장하지 않는다 — 캐시에서 꺼내 네비게이션에 돌려주면 브라우저가 거부한다.
          if (fresh.ok && !fresh.redirected) {
            const cache = await caches.open(CACHE)
            cache.put('/', fresh.clone()).catch(() => {})
          }
          return fresh
        } catch {
          const cache = await caches.open(CACHE)
          return (await cache.match('/')) || (await cache.match(req)) || Response.error()
        }
      })(),
    )
    return
  }

  // 해시 청크: 캐시 우선 + 미스 시 네트워크 후 저장
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      (async () => {
        const cache = await caches.open(CACHE)
        const cached = await cache.match(req)
        if (cached) return cached
        const fresh = await fetch(req)
        // HTML이 JS/CSS 자리에 오면(없는 청크를 SPA 폴백이 index.html로 대신 준 경우) 절대 저장하지 않는다 —
        // 저장하면 그 청크는 새로고침해도 영원히 'text/html' MIME 오류로 죽는다(청크 실패 자동복구도 못 살린다).
        const type = fresh.headers.get('content-type') || ''
        if (fresh.ok && fresh.type === 'basic' && !type.includes('text/html')) cache.put(req, fresh.clone()).catch(() => {})
        return fresh
      })(),
    )
    return
  }

  // 해시 없는 정적 파일: 네트워크 우선 — 캐시 우선이면 아이콘·매니페스트를 바꿔도 설치된 사용자에겐 영영 안 간다
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      try {
        const fresh = await fetch(req)
        if (fresh.ok && fresh.type === 'basic') cache.put(req, fresh.clone()).catch(() => {})
        return fresh
      } catch {
        return (await cache.match(req)) || Response.error()
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
