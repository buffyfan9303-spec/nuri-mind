import { useEffect } from 'react'
import { ADSENSE_CLIENT, ADSENSE_SLOT_BANNER, ADSENSE_SLOT_RECT, adsEnabled, pushAd } from '../lib/ads'
import { useStore, isPremium } from '../store/useStore'
import { useT } from '../i18n/useT'

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
  const premiumUntil = useStore((s) => s.premiumUntil)
  const isRect = variant === 'rect'

  useEffect(() => {
    if (!isPremium(premiumUntil)) pushAd()
  }, [premiumUntil])

  if (isPremium(premiumUntil)) return null // 프리미엄 = 광고 제거

  if (adsEnabled()) {
    return (
      <ins
        key={variant}
        className="adsbygoogle mx-auto block w-full overflow-hidden rounded-2xl"
        style={{ display: 'block', minHeight: isRect ? 250 : 60, maxHeight: isRect ? 280 : 110 }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={isRect ? ADSENSE_SLOT_RECT : ADSENSE_SLOT_BANNER}
        data-ad-format={isRect ? 'rectangle' : 'horizontal'}
        data-full-width-responsive="true"
      />
    )
  }

  return (
    <div
      className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-surface2 ${
        isRect ? 'h-[250px]' : 'h-[64px]'
      }`}
    >
      <span className="rounded-md bg-surface2 px-2 py-1 text-[11px] font-extrabold tracking-widest text-ink-faint">
        {t('ad.label')}
      </span>
      <span className="text-[13px] font-bold text-ink-faint">{t('ad.placeholder')}</span>
    </div>
  )
}
