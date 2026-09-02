import { useLocation, useNavigate } from 'react-router-dom'
import Button from './Button'
import { useL } from '../i18n/useT'

/**
 * 라우트 단위 에러 폴백 — 홀덤의 2단 폴백(전역/인라인) 중 '인라인' 쪽을 이식.
 *
 * 루트의 SentryErrorBoundary(main.tsx)는 앱 전체를 '앗, 문제가 생겼어요'로 바꿔 하단 내비까지 사라진다.
 * 이 폴백은 App.tsx의 라우트 컨테이너 안에서 그려지므로 내비가 살아 있고, 다른 탭을 눌러 빠져나갈 수 있다.
 *
 * '다시 시도'가 새로고침인 이유: React.lazy는 한 번 거부된 import를 영구 캐시한다 — 경계만 리셋하면
 * 같은 에러를 즉시 다시 던진다. 청크 404(재배포 뒤 옛 index.html)가 이 경계의 주 고객이라 새로고침이 정답이다.
 * '홈으로'는 이동 — 경로가 바뀌면 App의 motion.div key가 바뀌어 경계가 새로 마운트되므로 리셋이 필요 없다.
 * 리셋을 같이 하면 AnimatePresence(mode=wait)가 아직 붙잡고 있는 옛 트리가 다시 렌더돼 같은 에러를 한 번 더 던진다
 * (Sentry 이벤트 중복). 홈('/')에서 죽은 경우만 key가 안 바뀌니 그때만 리셋한다. 홈은 정적 import라 청크 없이 그려진다.
 */
export default function RouteFallback({ onReset }: { onReset: () => void }) {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const l = useL()
  return (
    <main role="alert" className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl" aria-hidden="true">
        😵
      </div>
      <h1 className="mt-4 break-keep text-[20px] font-extrabold tracking-tight">
        {l({ ko: '이 화면을 불러오지 못했어요', en: "This screen couldn't load", ja: 'この画面を読み込めませんでした' })}
      </h1>
      <p className="mt-2 break-keep text-[14px] font-medium leading-relaxed text-ink-sub">
        {l({
          ko: '네트워크가 잠깐 끊겼거나 앱이 새 버전으로 바뀌었을 수 있어요. 다시 시도하면 대부분 해결돼요.',
          en: 'The network may have dropped, or the app was just updated. Trying again usually fixes it.',
          ja: 'ネットワークが一時的に切れたか、アプリが更新された可能性があります。再試行でほぼ直ります。',
        })}
      </p>
      <div className="mt-6 flex w-full flex-col gap-2.5">
        <Button onClick={() => window.location.reload()}>{l({ ko: '다시 시도', en: 'Try again', ja: '再試行' })}</Button>
        <Button
          color="white"
          onClick={() => {
            if (pathname === '/') onReset()
            else nav('/', { replace: true })
          }}
        >
          {l({ ko: '홈으로', en: 'Go home', ja: 'ホームへ' })}
        </Button>
      </div>
    </main>
  )
}
