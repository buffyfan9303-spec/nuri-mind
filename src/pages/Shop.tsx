import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import AdSlot from '../components/AdSlot'
import { Card, Chip, Modal, Section, TopBar } from '../components/ui'
import { SHOP_ITEMS } from '../data/seed'
import type { ShopItem } from '../data/types'
import { FREEZE_MAX, useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { burst } from '../lib/confetti'
import { sfx } from '../lib/sound'

export default function Shop() {
  const t = useT()
  const l = useL()
  const points = useStore((s) => s.points)
  const redemptions = useStore((s) => s.redemptions)
  const redeem = useStore((s) => s.redeem)
  const buyFreeze = useStore((s) => s.buyFreeze)
  const freezes = useStore((s) => s.streakFreezes)
  const [confirm, setConfirm] = useState<ShopItem | null>(null)
  const [requested, setRequested] = useState(false)

  const doRedeem = () => {
    if (!confirm) return
    // 스트릭 프리즈: 운영자 승인 없이 즉시 지급되는 디지털 아이템
    const ok = confirm.id === 'item_freeze' ? buyFreeze() : redeem(confirm, l(confirm.name))
    if (ok) {
      sfx.coin()
      burst()
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
                transition={{ delay: 0.04 * i, type: 'spring', stiffness: 240, damping: 24 }}
              >
                <Card className="flex items-center gap-3 !p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mind-50 text-[26px]">
                    {item.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="break-keep text-[15px] font-extrabold leading-tight tracking-tight">{l(item.name)}</h3>
                    <p className="mt-0.5 whitespace-nowrap text-[13px] font-extrabold text-mind-700">
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
                      className="!px-2"
                    >
                      {maxed ? '보유중' : afford ? '교환' : '부족'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* 가로 한 줄 광고 — 콘텐츠 중앙 */}
        <div className="mt-4">
          <AdSlot variant="banner" />
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

        {/* 정사각형 광고 — 페이지 맨 아래 */}
        <div className="mt-5">
          <AdSlot variant="rect" />
        </div>
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
