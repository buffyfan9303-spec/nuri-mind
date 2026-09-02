import { useState } from 'react'
import { SPRING } from '../lib/motion'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import IconBadge from '../components/IconBadge'
import { Card, Chip, Modal, Section, TopBar } from '../components/ui'
import { SHOP_ITEMS } from '../data/seed'
import type { ShopItem } from '../data/types'
import { FREEZE_MAX, isPremium, PREMIUM_KRW, useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { useRewardAnimation } from '../hooks/useRewardAnimation'
import { sfx } from '../lib/sound'

export default function Shop() {
  const t = useT()
  const l = useL()
  const points = useStore((s) => s.points)
  const redemptions = useStore((s) => s.redemptions)
  const redeem = useStore((s) => s.redeem)
  const buyFreeze = useStore((s) => s.buyFreeze)
  const freezes = useStore((s) => s.streakFreezes)
  const { fire } = useRewardAnimation()
  const nav = useNavigate()
  const premiumUntil = useStore((s) => s.premiumUntil)
  const premium = isPremium(premiumUntil)
  const [confirm, setConfirm] = useState<ShopItem | null>(null)
  const [requested, setRequested] = useState(false)

  const doRedeem = () => {
    if (!confirm) return
    // 스트릭 프리즈: 운영자 승인 없이 즉시 지급되는 디지털 아이템
    const ok = confirm.id === 'item_freeze' ? buyFreeze() : redeem(confirm, l(confirm.name))
    if (ok) {
      fire('coin')
      setRequested(true)
      setTimeout(() => setRequested(false), 2200)
    } else {
      sfx.err()
    }
    setConfirm(null)
  }

  return (
    <div className="min-h-dvh pb-36">
      <TopBar title={t('shop.title')} />
      <main className="mx-auto max-w-md px-5">
        <p className="px-1 text-[15px] font-medium leading-relaxed tracking-wide text-ink-sub">{t('shop.sub')}</p>

        {/* 프리미엄 구독 CTA */}
        <button
          onClick={() => nav('/premium')}
          className="mt-3 flex w-full items-center gap-3 rounded-3xl p-4 text-left shadow-pop"
          style={{ background: premium ? 'linear-gradient(135deg,#F2B01E,#FF7E5F)' : 'linear-gradient(135deg,#6E7BF2,#A88BF2)' }}
        >
          <IconBadge emoji="✨" tone="frost" size={42} radius={13} wiggle />
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-extrabold tracking-tight text-white">
              {premium
                ? l({ ko: '프리미엄 이용 중', en: 'Premium active', ja: 'プレミアム利用中' })
                : l({ ko: '광고 제거 · 프리미엄', en: 'Remove ads · Premium', ja: '広告除去・プレミアム' })}
            </h3>
            <p className="mt-0.5 truncate text-[12px] font-bold text-white/85">
              {premium
                ? l({ ko: '혜택 이용 중 · 눌러서 관리', en: 'Active · tap to manage', ja: '利用中・管理する' })
                : l({
                    ko: `운세·검사 무제한 · 월 ₩${PREMIUM_KRW.toLocaleString()}`,
                    en: `Unlimited · ₩${PREMIUM_KRW.toLocaleString()}/mo`,
                    ja: `無制限・月₩${PREMIUM_KRW.toLocaleString()}`,
                  })}
            </p>
          </div>
          <span className="text-xl text-white/80">›</span>
        </button>

        {requested && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-2xl bg-mind-100 px-4 py-3 text-center text-sm font-extrabold text-mind-700"
          >
            ✅ {t('shop.requested')}
          </motion.p>
        )}

        <div className="mt-4 space-y-2.5">
          {SHOP_ITEMS.map((item, i) => {
            const afford = points >= item.cost
            const isFreeze = item.id === 'item_freeze'
            const maxed = isFreeze && freezes >= FREEZE_MAX
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING.ui, delay: 0.04 * i }}
              >
                <Card className="flex items-center gap-3 !p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mind-50 text-[26px]">
                    {item.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="break-keep text-[15px] font-extrabold leading-tight tracking-tight">{l(item.name)}</h3>
                    <p className="mt-0.5 whitespace-nowrap text-[13px] font-extrabold text-mind-700 dark:text-mind-300">
                      🪙 {item.cost.toLocaleString()}P
                      {isFreeze && freezes > 0 && <span className="ml-1.5 text-[12px] text-sky2-600">❄️×{freezes}</span>}
                    </p>
                  </div>
                  <div className="w-[64px] shrink-0">
                    <Button
                      color={afford && !maxed ? 'mind' : 'white'}
                      size="sm"
                      disabled={!afford || maxed}
                      onClick={() => setConfirm(item)}
                      className="!px-2 whitespace-nowrap"
                    >
                      {maxed
                        ? l({ ko: '보유중', en: 'Owned', ja: '保有中' })
                        : afford
                          ? l({ ko: '교환', en: 'Redeem', ja: '交換' })
                          : l({ ko: '부족', en: 'Short', ja: '不足' })}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {redemptions.length > 0 && (
          <Section title={`📦 ${t('shop.history')}`}>
            <Card className="!p-2">
              {redemptions.map((rd) => (
                <div key={rd.id} className="flex items-center justify-between border-b border-line px-3 py-3 last:border-0">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="text-xl">{rd.emoji}</span>
                    <div className="min-w-0">
                      <p className="truncate text-[14.5px] font-bold">{rd.itemName}</p>
                      <p className="mt-0.5 text-[12px] font-medium text-ink-faint">
                        {new Date(rd.at).toLocaleDateString()} · {rd.cost.toLocaleString()}P
                      </p>
                    </div>
                  </div>
                  {rd.status === 'pending' && <Chip tone="amber">⏳ {t('shop.st.pending')}</Chip>}
                  {rd.status === 'approved' && <Chip tone="mind">✅ {t('shop.st.approved')}</Chip>}
                  {rd.status === 'rejected' && <Chip tone="red">↩️ {t('shop.st.rejected')}</Chip>}
                </div>
              ))}
            </Card>
          </Section>
        )}

      </main>

      <Modal open={Boolean(confirm)} onClose={() => setConfirm(null)}>
        {confirm && (
          <div className="text-center">
            <div className="text-5xl">{confirm.emoji}</div>
            <h3 className="mt-3 text-lg font-extrabold">{t('shop.confirmTitle', { name: l(confirm.name) })}</h3>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-ink-sub">
              {t('shop.confirmDesc', { cost: confirm.cost.toLocaleString() })}
            </p>
            <div className="mt-5 space-y-2.5">
              <Button color="mind" onClick={doRedeem}>
                {t('common.confirm')}
              </Button>
              <Button color="white" onClick={() => setConfirm(null)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
