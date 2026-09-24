import { useNavigate } from 'react-router-dom'
import Button from './Button'
import { TopBar } from './ui'
import { useL } from '../i18n/useT'
import type { L } from '../data/types'

/**
 * '준비 중' 화면 — 꺼 둔 기능(지금은 리워드 설문)의 주소로 들어왔을 때.
 * ⚠️ 광고 금지: 애드센스는 '아직 미완성 상태인 화면'에 광고 게재를 금지한다(게시자 정책 11112688).
 *    AdSlot을 절대 넣지 않는다.
 */
export default function ComingSoon({
  title,
  body,
  back = '/rewards',
}: {
  title: L
  body?: L
  back?: string
}) {
  const l = useL()
  const nav = useNavigate()
  return (
    <div className="min-h-dvh pb-36">
      <TopBar back={back} title={l(title)} />
      <main className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl" aria-hidden="true">
          🛠️
        </div>
        <h1 className="mt-4 break-keep text-[20px] font-extrabold tracking-tight">
          {l({ ko: '준비 중이에요', en: 'Coming soon', ja: '準備中です' })}
        </h1>
        <p className="mt-2 break-keep text-[14px] font-bold leading-relaxed text-ink-sub">
          {l(
            body ?? {
              ko: '지금은 이용할 수 없는 기능이에요. 준비가 끝나면 다시 열어 둘게요.',
              en: "This feature isn't available right now. We'll open it again when it's ready.",
              ja: '現在ご利用いただけない機能です。準備ができ次第再開します。',
            },
          )}
        </p>
        <div className="mt-6 w-full max-w-xs">
          <Button color="mind" onClick={() => nav(back)}>
            {l({ ko: '돌아가기', en: 'Go back', ja: '戻る' })}
          </Button>
        </div>
      </main>
    </div>
  )
}
