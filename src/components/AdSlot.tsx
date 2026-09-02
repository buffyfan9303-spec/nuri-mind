import { useEffect, useRef } from 'react'
import { ADSENSE_CLIENT, ADSENSE_SLOT_BANNER, ADSENSE_SLOT_RECT, adsEnabled, loadAdSenseScript, pushAd } from '../lib/ads'
import { useStore, isPremium } from '../store/useStore'
import { useNavigate } from 'react-router-dom'
import { useT, useL } from '../i18n/useT'

/**
 * 수익화 광고 슬롯.
 * - AdSense 미설정 시: 레이아웃을 동일하게 차지하는 플레이스홀더 (출시 전 UX 검증용)
 * - 설정 시: 반응형 디스플레이 광고 렌더링
 */
/**
 * - banner: 가로 한 줄(horizontal) — 콘텐츠 중앙 삽입용. 높이가 낮아 메뉴/콘텐츠를 가리지 않음.
 * - rect:   정사각형(rectangle, 300x250류) — 페이지 맨 아래 전용.
 */
export default function AdSlot({ variant = 'banner' }: { variant?: 'banner' | 'rect' }) {
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const premiumUntil = useStore((s) => s.premiumUntil)
  const isRect = variant === 'rect'
  const insRef = useRef<HTMLModElement>(null)

  useEffect(() => {
    if (isPremium(premiumUntil)) return
    // ⚠️ 애드센스 정책 방어: 로더는 광고 슬롯이 실제로 있는 화면(결과지·매거진)에서만 주입.
    //    전역(main.tsx) 주입 시 대시보드 Auto Ads가 켜져 있으면 홈·이동 화면에도 광고가
    //    자동 삽입돼 "게시자 콘텐츠 없는 화면 광고" 위반이 된다 — 코드 레벨에서 원천 차단.
    loadAdSenseScript()
    // 같은 <ins>에 중복 push 방지 — AdSense가 채운 요소엔 data-adsbygoogle-status가 붙는다.
    // (StrictMode 이중 실행·리렌더 시 "already have ads in them" TagError 발생 원인)
    const el = insRef.current
    if (el && el.getAttribute('data-adsbygoogle-status')) return
    pushAd()
  }, [premiumUntil])

  if (isPremium(premiumUntil)) return null // 프리미엄 = 광고 제거

  const adEl = adsEnabled() ? (
    <ins
      key={variant}
      ref={insRef}
      className="adsbygoogle mx-auto block w-full overflow-hidden rounded-2xl"
      style={{ display: 'block', minHeight: isRect ? 250 : 60, maxHeight: isRect ? 280 : 110 }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={isRect ? ADSENSE_SLOT_RECT : ADSENSE_SLOT_BANNER}
      data-ad-format={isRect ? 'rectangle' : 'horizontal'}
      data-full-width-responsive="true"
    />
  ) : (
    <div
      className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-surface2 ${
        isRect ? 'h-[250px]' : 'h-[64px]'
      }`}
    >
      <span className="rounded-md bg-surface2 px-2 py-1 text-[11px] font-semibold tracking-widest text-ink-faint">
        {t('ad.label')}
      </span>
      <span className="text-[13px] font-medium text-ink-faint">{t('ad.placeholder')}</span>
    </div>
  )

  // rect(페이지 하단) 광고 아래에만 광고제거 업셀 — 인라인 배너엔 미표시(과노출 방지)
  if (isRect) {
    return (
      <div>
        {adEl}
        <button onClick={() => nav('/premium')} className="mx-auto mt-1.5 block text-[11px] font-semibold text-mind-500">
          ✨ {l({ ko: '광고 없이 이용하기 · 프리미엄', en: 'Remove ads · Premium', ja: '広告なしで利用・プレミアム' })}
        </button>
      </div>
    )
  }
  return adEl
}
