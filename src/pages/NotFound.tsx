import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { useL } from '../i18n/useT'
import { track } from '../lib/analytics'

/**
 * 404 — 예전엔 `path="*"`가 홈으로 조용히 리다이렉트했다. 잘못 친 주소·바뀐 링크·오래된 공유 링크가
 * 아무 설명 없이 홈에 떨어지면 사용자는 '앱이 고장났나'로 읽는다. 무엇이 일어났는지 말하고 두 출구를 준다.
 * 정적 import — 404 페이지가 청크 실패로 또 404 나는 일은 없어야 한다(작아서 번들 부담도 없다).
 */
export default function NotFound() {
  const nav = useNavigate()
  const loc = useLocation()
  const l = useL()

  // 어떤 주소가 죽었는지 — 오래된 공유 링크·오타 패턴을 GA에서 본다
  useEffect(() => {
    track('not_found', { path: loc.pathname.slice(0, 120) })
  }, [loc.pathname])

  const shown = loc.pathname.length > 48 ? `${loc.pathname.slice(0, 45)}…` : loc.pathname

  return (
    <div className="bg-dots min-h-dvh pb-36">
      <main className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl" aria-hidden="true">
          🧭
        </div>
        <h1 className="mt-4 break-keep text-[20px] font-extrabold tracking-tight">
          {l({ ko: '이 주소엔 아무것도 없어요', en: 'Nothing lives at this address', ja: 'このアドレスには何もありません' })}
        </h1>
        <p className="mt-2 break-keep text-[14px] font-medium leading-relaxed text-ink-sub">
          {l({
            ko: '주소가 바뀌었거나 잘못 입력됐을 수 있어요.',
            en: 'The link may have moved or been typed wrong.',
            ja: 'リンクが移動したか、入力ミスの可能性があります。',
          })}
        </p>
        <code className="mt-3 max-w-full truncate rounded-xl bg-surface2 px-3 py-1.5 text-[12px] font-medium text-ink-faint">{shown}</code>
        <div className="mt-6 flex w-full flex-col gap-2.5">
          <Button onClick={() => nav('/', { replace: true })}>{l({ ko: '홈으로', en: 'Go home', ja: 'ホームへ' })}</Button>
          <Button color="white" onClick={() => nav(-1)}>
            {l({ ko: '뒤로 가기', en: 'Go back', ja: '戻る' })}
          </Button>
        </div>
      </main>
    </div>
  )
}
