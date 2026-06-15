import { useEffect } from 'react'
import { ADSENSE_CLIENT, ADSENSE_SLOT_BANNER, ADSENSE_SLOT_RECT, adsEnabled, pushAd } from '../lib/ads'
import { useT } from '../i18n/useT'

/**
 * 수익화 광고 슬롯.
 * - AdSense 미설정 시: 레이아웃을 동일하게 차지하는 플레이스홀더 (출시 전 UX 검증용)
 * - 설정 시: 반응형 디스플레이 광고 렌더링
 */
export default function AdSlot({ variant = 'banner' }: { variant?: 'banner' | 'rect' }) {
  const t = useT()
  const h = variant === 'banner' ? 'h-20' : 'h-56'

  useEffect(() => {
    pushAd()
  }, [])

  if (adsEnabled()) {
    return (
      <ins
        className={`adsbygoogle block w-full overflow-hidden rounded-2xl ${h}`}
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={variant === 'banner' ? ADSENSE_SLOT_BANNER : ADSENSE_SLOT_RECT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    )
  }

  return (
    <div
      className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#DCE5DE] bg-white/70 ${h}`}
    >
      <span className="rounded-md bg-[#EEF3EF] px-2 py-1 text-[11px] font-extrabold tracking-widest text-ink-faint">
        {t('ad.label')}
      </span>
      <span className="text-[13px] font-bold text-ink-faint">{t('ad.placeholder')}</span>
    </div>
  )
}
