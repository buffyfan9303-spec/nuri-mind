import { useState } from 'react'
import { SPRING } from '../lib/motion'
import { motion } from 'framer-motion'
import { TopBar, Card, Modal } from '../components/ui'
import Button from '../components/Button'
import {
  useStore,
  DIA_BUNDLES,
  FORTUNE_DIA_COST,
  IQ_DIA_COST,
  type DiaBundle,
} from '../store/useStore'
import { useL } from '../i18n/useT'
import { burst } from '../lib/confetti'
import { sfx } from '../lib/sound'

/**
 * 💎 다이아 충전 — 유료 디지털 재화(1다이아=100원).
 * ⚠️ PG(카카오페이/카드/토스) 연동 전 "베타": 충전 버튼 시 즉시 지급.
 *    정식 결제 연동 시 onPay()의 즉시 지급을 결제성공 콜백으로 교체.
 */
export default function Charge() {
  const l = useL()
  const diamonds = useStore((s) => s.diamonds)
  const addDiamonds = useStore((s) => s.addDiamonds)

  const [sel, setSel] = useState<DiaBundle | null>(null)
  const [done, setDone] = useState(false)

  const onPay = () => {
    if (!sel) return
    // TODO(PG): 카카오페이/카드/토스 결제 성공 콜백에서 addDiamonds 호출로 교체
    addDiamonds(sel.dia)
    burst()
    sfx.coin()
    setDone(true)
  }

  const close = () => {
    setSel(null)
    setDone(false)
  }

  const USES: { emoji: string; cost: number; label: string }[] = [
    { emoji: '🔮', cost: FORTUNE_DIA_COST, label: l({ ko: '운세 종합 (오늘·주간·월간·올해)', en: 'Full fortune (day·week·month·year)', ja: '総合運勢（今日・週・月・年）' }) },
    { emoji: '🧠', cost: IQ_DIA_COST, label: l({ ko: 'IQ 정밀검사 전체 해제', en: 'Unlock full precision IQ test', ja: 'IQ精密検査の全解除' }) },
  ]

  return (
    <div className="min-h-dvh pb-10">
      <TopBar title={l({ ko: '다이아 충전', en: 'Charge Diamonds', ja: 'ダイヤチャージ' })} back="/shop" right={<span />} />

      <div className="space-y-4 px-4">
        {/* 보유 잔액 */}
        <Card className="!bg-gradient-to-br !from-[#6E7BF2] !to-[#A88BF2] !p-6 text-center text-white">
          <p className="text-[13px] font-bold text-white/85">{l({ ko: '보유 다이아', en: 'Your diamonds', ja: '保有ダイヤ' })}</p>
          <motion.p
            key={diamonds}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={SPRING.flick}
            className="mt-1 text-[40px] font-extrabold leading-none"
          >
            💎 {diamonds.toLocaleString()}
          </motion.p>
          <p className="mt-2 text-[12px] font-semibold text-white/80">1 💎 = 100원 상당</p>
        </Card>

        {/* 다이아 사용처 */}
        <Card className="!p-5">
          <p className="text-[14px] font-extrabold">{l({ ko: '다이아로 할 수 있는 것', en: 'What diamonds unlock', ja: 'ダイヤでできること' })}</p>
          <div className="mt-3 space-y-2.5">
            {USES.map((u) => (
              <div key={u.emoji} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF0FE] text-[18px]">{u.emoji}</span>
                <span className="min-w-0 flex-1 break-keep text-[13.5px] font-bold text-ink-sub">{u.label}</span>
                <span className="shrink-0 rounded-full bg-[#EEF0FE] px-2.5 py-1 text-[12.5px] font-extrabold text-[#6E7BF2]">💎{u.cost}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 충전 번들 */}
        <div>
          <p className="mb-2 px-1 text-[15px] font-extrabold">{l({ ko: '충전 패키지', en: 'Packages', ja: 'チャージパック' })}</p>
          <div className="grid grid-cols-2 gap-3">
            {DIA_BUNDLES.map((b) => {
              const orig = b.dia * 100
              return (
                <motion.button
                  key={b.dia}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSel(b)
                    sfx.tap()
                  }}
                  className="relative overflow-hidden rounded-3xl border-2 bg-surface p-4 text-center shadow-card"
                  style={{ borderColor: b.best ? '#6E7BF2' : '#ECECF5' }}
                >
                  {b.best && (
                    <span className="absolute right-0 top-0 rounded-bl-xl rounded-tr-3xl bg-[#6E7BF2] px-2.5 py-1 text-[10.5px] font-extrabold text-white">
                      BEST
                    </span>
                  )}
                  <p className="text-[30px] leading-none">💎</p>
                  <p className="mt-1.5 text-[19px] font-extrabold text-ink">{b.dia.toLocaleString()}<span className="text-[13px] font-bold text-ink-faint"> 다이아</span></p>
                  {b.off ? (
                    <div className="mt-1">
                      <span className="text-[12px] font-bold text-ink-faint line-through">₩{orig.toLocaleString()}</span>
                      <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-extrabold text-red-500">-{b.off}%</span>
                    </div>
                  ) : (
                    <div className="mt-1 h-[18px]" />
                  )}
                  <p className="mt-1 text-[17px] font-extrabold text-[#6E7BF2]">₩{b.krw.toLocaleString()}</p>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* 베타 안내 */}
        <div className="rounded-2xl bg-[#FFF6E5] px-4 py-3 text-[12px] font-semibold leading-relaxed text-[#9A6B00]">
          🧪 {l({
            ko: '결제(PG) 연동 전 베타입니다. 지금은 충전 시 즉시 지급되며, 정식 오픈 시 카카오페이·신용카드·토스 결제로 전환됩니다.',
            en: 'Beta before payment gateway. Diamonds are granted instantly now; real KakaoPay/card/Toss checkout comes at launch.',
            ja: '決済連携前のベータです。今は即時付与され、正式公開時にカカオペイ・カード・Toss決済へ切り替わります。',
          })}
        </div>
      </div>

      {/* 결제 확인 모달 */}
      <Modal open={!!sel} onClose={close}>
        {sel && !done && (
          <div className="text-center">
            <p className="text-[44px] leading-none">💎</p>
            <h3 className="mt-2 text-[20px] font-extrabold">{sel.dia.toLocaleString()} 다이아 충전</h3>
            <p className="mt-1 text-[14px] font-bold text-ink-faint">
              ₩{sel.krw.toLocaleString()}{sel.off ? ` · ${sel.off}% 할인` : ''}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['카카오페이', '신용카드', 'Toss'].map((m) => (
                <span key={m} className="rounded-full border border-line bg-surface2 px-3 py-1.5 text-[12.5px] font-bold text-ink-faint">
                  {m} <span className="text-[10.5px] text-ink-faint/70">준비중</span>
                </span>
              ))}
            </div>

            <div className="mt-5">
              <Button color="iq" onClick={onPay}>
                {l({ ko: '충전하기 (베타 즉시지급)', en: 'Charge (beta · instant)', ja: 'チャージ（ベータ即時）' })}
              </Button>
              <button onClick={close} className="mt-2 w-full py-2 text-[13.5px] font-bold text-ink-faint">
                {l({ ko: '취소', en: 'Cancel', ja: 'キャンセル' })}
              </button>
            </div>
            <p className="mt-2 text-[11px] font-medium text-ink-faint">
              {l({
                ko: '만 14세 미만은 결제 불가 · 미사용 다이아 7일 내 청약철회 가능',
                en: 'No purchase under 14 · unused diamonds refundable within 7 days',
                ja: '14歳未満は購入不可・未使用ダイヤは7日以内に返金可',
              })}
            </p>
          </div>
        )}
        {sel && done && (
          <div className="text-center">
            <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={SPRING.flick} className="text-[52px] leading-none">
              🎉
            </motion.p>
            <h3 className="mt-2 text-[20px] font-extrabold">{l({ ko: '충전 완료!', en: 'Charged!', ja: 'チャージ完了！' })}</h3>
            <p className="mt-1 text-[15px] font-bold text-[#6E7BF2]">💎 +{sel.dia.toLocaleString()}</p>
            <div className="mt-5">
              <Button color="iq" onClick={close}>{l({ ko: '확인', en: 'Done', ja: '確認' })}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
