import { Card } from './Card'
import Button from '../Button'
import { useL } from '../../i18n/useT'

/**
 * '불러오지 못했어요' 카드 — 빈 상태(아직 없음)와 **다른** 화면.
 *
 * 왜 따로 두는가: 커뮤니티는 서버 요청이 실패하면 조용히 이 기기에 저장된 글로 넘어간다.
 * 목록이 비어 있으면 "아직 글이 없어요 🌱"가 뜨고, 비어 있지 않으면 **그 기기의 글이
 * 커뮤니티 전체인 것처럼 보인다**. 둘 다 거짓이다. 실패와 없음은 사용자가 할 일이 다르다 —
 * 실패는 '다시 시도', 없음은 '내가 첫 글을 쓴다'.
 *
 * 그래서 이 카드는 목록을 대체하지 않고 **목록 위에 얹을 수도** 있어야 한다(hint로 상황을 바꿔 쓴다).
 * role="alert" — 목록이 조용히 바뀌면 눈으로 볼 수 없는 사용자는 영영 모른다.
 */
export default function LoadErrorCard({
  what,
  hint,
  reason,
  onRetry,
  compact = false,
}: {
  /** 무엇을 못 불러왔는지 — '커뮤니티 글', '우편' 처럼 목적어로 */
  what: string
  /** 기본 안내 대신 상황에 맞는 문장(예: '아래는 이 기기에 저장된 글이에요') */
  hint?: string
  /** 서버가 준 사유(humanizeError를 거친 사람 말) */
  reason?: string
  onRetry: () => void
  /** 목록 위에 얹는 얇은 형태 — 목록을 대체할 땐 false */
  compact?: boolean
}) {
  const l = useL()
  return (
    <Card className={compact ? '!p-3.5' : 'py-8 text-center'}>
      <div role="alert" className={compact ? 'flex items-start gap-2.5' : undefined}>
        <div className={compact ? 'shrink-0 text-[17px] leading-none' : 'text-4xl'} aria-hidden="true">
          ⚠️
        </div>
        <div className={compact ? 'min-w-0 flex-1' : undefined}>
          <h3 className={`break-keep font-semibold ${compact ? 'text-[13px]' : 'mt-3 text-[15px]'}`}>
            {l({ ko: `${what}을 불러오지 못했어요`, en: `Couldn't load ${what}`, ja: `${what}を読み込めませんでした` })}
          </h3>
          <p
            className={`break-keep font-medium leading-relaxed text-ink-faint ${
              compact ? 'mt-0.5 text-[12px]' : 'mx-auto mt-1.5 max-w-[260px] text-[12px]'
            }`}
          >
            {hint ??
              l({
                ko: '등록된 내용이 없는 것과는 달라요. 연결을 확인하고 다시 시도해 주세요.',
                en: 'This is not the same as having nothing yet. Check your connection and retry.',
                ja: '内容がないのとは違います。接続を確認して再試行してください。',
              })}
          </p>
          {reason && (
            <p className={`break-keep text-[11px] font-medium text-ink-faint/80 ${compact ? 'mt-0.5' : 'mt-1'}`}>{reason}</p>
          )}
        </div>
      </div>
      <div className={compact ? 'mt-2.5' : 'mx-auto mt-4 max-w-[200px]'}>
        <Button color="white" size="sm" onClick={onRetry}>
          {l({ ko: '다시 시도', en: 'Try again', ja: '再試行' })}
        </Button>
      </div>
    </Card>
  )
}
