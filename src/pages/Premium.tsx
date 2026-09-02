import { useState } from 'react'
import { SPRING } from '../lib/motion'
import { motion } from 'framer-motion'
import { TopBar, Card, Modal } from '../components/ui'
import Button from '../components/Button'
import { useStore, isPremium, PREMIUM_KRW, PREMIUM_DAYS } from '../store/useStore'
import { track } from '../lib/analytics'
import { useL } from '../i18n/useT'
import { burst } from '../lib/confetti'
import { sfx } from '../lib/sound'

/**
 * ✨ 프리미엄 구독 — 월 5,900원(광고 제거·운세 무제한·전 정밀검사 해제).
 * ⚠️ 정기결제(PG) 연동 전 "베타": 구독 시 즉시 30일 활성. 정식 연동 시 onSubscribe()를
 *    카카오페이/카드 정기결제 성공 콜백으로 교체.
 */
export default function Premium() {
  const l = useL()
  const premiumUntil = useStore((s) => s.premiumUntil)
  const subscribe = useStore((s) => s.subscribePremiumBeta)
  const cancel = useStore((s) => s.cancelPremium)
  const active = isPremium(premiumUntil)
  const [confirm, setConfirm] = useState(false)
  const [done, setDone] = useState(false)

  const daysLeft = active ? Math.max(0, Math.ceil((premiumUntil - Date.now()) / 86400000)) : 0
  const untilStr = active
    ? new Date(premiumUntil).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  const BENEFITS = [
    { e: '🧬', t: l({ ko: 'AI 종합 심층 리포트', en: 'AI deep report', ja: 'AI総合レポート' }), d: l({ ko: '심층검사 11종을 하나로 읽은 나의 설명서(전 섹션)', en: 'All 11 deep tests read as one person', ja: '深層検査11種を一つに読む' }) },
    { e: '🔮', t: l({ ko: '운세 무제한', en: 'Unlimited fortune', ja: '運勢無制限' }), d: l({ ko: '종합·상세 운세를 매일 무제한으로. 다이아 걱정 없이', en: 'Full & detail fortune daily', ja: '総合・詳細運勢を無制限' }) },
    { e: '🚫', t: l({ ko: '광고 완전 제거', en: 'No ads', ja: '広告完全除去' }), d: l({ ko: '앱 전체 배너·하단 광고 제거', en: 'Removes all banners', ja: '全広告を除去' }) },
    { e: '🧠', t: l({ ko: '전 정밀검사 해제', en: 'All precision tests', ja: '全精密検査解除' }), d: l({ ko: 'IQ·기억·집중·처리속도·공간 상세 전부', en: 'IQ·memory·focus·speed·spatial', ja: 'IQ・記憶・集中・速度・空間' }) },
    { e: '💎', t: l({ ko: '다이아 절약', en: 'Save diamonds', ja: 'ダイヤ節約' }), d: l({ ko: '다이아 없이도 프리미엄 기능 이용', en: 'No diamonds needed', ja: 'ダイヤ不要' }) },
  ]

  const onSubscribe = () => {
    // TODO(PG): 카카오페이/카드 정기결제 성공 콜백에서 subscribe() 호출로 교체
    // ⚠️ 지금은 베타 즉시지급이라 이 이벤트는 '결제'가 아니라 '구독 의사'를 뜻한다.
    //    PG가 붙으면 결제 성공 콜백으로 옮겨야 매출과 일치한다.
    track('premium_start', { price: PREMIUM_KRW, billed: false })
    subscribe()
    burst()
    sfx.coin()
    setConfirm(false)
    setDone(true)
  }

  return (
    <div className="min-h-dvh pb-10">
      <TopBar title={l({ ko: '프리미엄', en: 'Premium', ja: 'プレミアム' })} back="/" right={<span />} />

      <div className="space-y-4 px-4">
        {/* 히어로 */}
        <Card
          className={`!p-6 text-center text-white ${
            active ? '!bg-gradient-to-br !from-[#F2B01E] !to-[#FF7E5F]' : '!bg-gradient-to-br !from-[#6E7BF2] !to-[#A88BF2]'
          }`}
        >
          <p className="text-[28px] leading-none">✨</p>
          {active ? (
            <>
              <h2 className="mt-2 text-[20px] font-extrabold">{l({ ko: '프리미엄 이용 중', en: 'Premium active', ja: 'プレミアム利用中' })}</h2>
              <p className="mt-1.5 text-[13px] font-medium text-white/90">
                {l({ ko: `${untilStr}까지 · D-${daysLeft}`, en: `Until ${untilStr} · D-${daysLeft}`, ja: `${untilStr}まで・D-${daysLeft}` })}
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-[20px] font-extrabold">{l({ ko: '누리 마인드 프리미엄', en: 'NURI MIND Premium', ja: 'ヌリマインド プレミアム' })}</h2>
              <p className="mt-2 text-[28px] font-extrabold leading-none">
                ₩{PREMIUM_KRW.toLocaleString()}
                <span className="text-[14px] font-bold text-white/80"> / {l({ ko: '월', en: 'mo', ja: '月' })}</span>
              </p>
              <p className="mt-1.5 text-[12px] font-semibold text-white/85">{l({ ko: '언제든 해지 가능', en: 'Cancel anytime', ja: 'いつでも解約可' })}</p>
            </>
          )}
        </Card>

        {/* 혜택 */}
        <Card className="!p-5">
          <p className="text-[14px] font-semibold">{l({ ko: '프리미엄 혜택', en: 'What you get', ja: '特典' })}</p>
          <div className="mt-3 space-y-3">
            {BENEFITS.map((b) => (
              <div key={b.e} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF0FE] text-[17px]">{b.e}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold">{b.t}</p>
                  <p className="mt-0.5 break-keep text-[12px] font-medium text-ink-faint">{b.d}</p>
                </div>
                <span className="shrink-0 text-[15px] font-semibold text-mind-500">✓</span>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA */}
        {active ? (
          <button onClick={cancel} className="w-full py-2.5 text-[13px] font-medium text-ink-faint">
            {l({ ko: '구독 해지 (베타)', en: 'Cancel subscription (beta)', ja: '解約（ベータ）' })}
          </button>
        ) : (
          <Button color="iq" onClick={() => setConfirm(true)}>
            ✨ {l({ ko: `프리미엄 시작 · 월 ₩${PREMIUM_KRW.toLocaleString()}`, en: `Start Premium · ₩${PREMIUM_KRW.toLocaleString()}/mo`, ja: `プレミアム開始・月₩${PREMIUM_KRW.toLocaleString()}` })}
          </Button>
        )}

        {/* 베타 안내 */}
        <div className="rounded-2xl bg-[#FFF6E5] px-4 py-3 text-[12px] font-semibold leading-relaxed text-[#9A6B00]">
          🧪 {l({
            ko: '정기결제(PG) 연동 전 베타예요. 지금은 구독하면 30일 바로 활성화되고, 정식 오픈 때 카카오페이·카드 정기결제로 바뀌어요.',
            en: 'Beta before recurring billing. Subscribing activates 30 days instantly; real KakaoPay/card billing comes at launch.',
            ja: '定期決済連携前のベータです。今は30日即時有効化され、正式公開時にカカオペイ・カード定期決済へ切り替わります。',
          })}
        </div>
      </div>

      {/* 구독 확인 모달 */}
      <Modal open={confirm} onClose={() => setConfirm(false)}>
        <div className="text-center">
          <p className="text-[28px] leading-none">✨</p>
          <h3 className="mt-2 text-[20px] font-extrabold">{l({ ko: '프리미엄 구독', en: 'Subscribe Premium', ja: 'プレミアム購読' })}</h3>
          <p className="mt-1 text-[14px] font-bold text-ink-faint">
            ₩{PREMIUM_KRW.toLocaleString()} / {l({ ko: '월', en: 'month', ja: '月' })} · {PREMIUM_DAYS}
            {l({ ko: '일', en: ' days', ja: '日' })}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['카카오페이', '신용카드', 'Toss'].map((m) => (
              <span key={m} className="rounded-full border border-line bg-surface2 px-3 py-1.5 text-[12px] font-medium text-ink-faint">
                {m} <span className="text-[11px] text-ink-faint/70">준비중</span>
              </span>
            ))}
          </div>
          <div className="mt-5">
            <Button color="iq" onClick={onSubscribe}>
              {l({ ko: '구독하기 (베타 즉시활성)', en: 'Subscribe (beta · instant)', ja: '購読（ベータ即時）' })}
            </Button>
            <button onClick={() => setConfirm(false)} className="mt-2 w-full py-2 text-[13px] font-medium text-ink-faint">
              {l({ ko: '취소', en: 'Cancel', ja: 'キャンセル' })}
            </button>
          </div>
          <p className="mt-2 text-[11px] font-medium text-ink-faint">
            {l({ ko: '만 14세 미만 결제 불가 · 언제든 해지 가능', en: 'No purchase under 14 · cancel anytime', ja: '14歳未満不可・いつでも解約可' })}
          </p>
        </div>
      </Modal>

      {/* 완료 모달 */}
      <Modal open={done} onClose={() => setDone(false)}>
        <div className="text-center">
          <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={SPRING.flick} className="text-[28px] leading-none">
            🎉
          </motion.p>
          <h3 className="mt-2 text-[20px] font-extrabold">{l({ ko: '프리미엄 활성화!', en: 'Premium activated!', ja: 'プレミアム有効化！' })}</h3>
          <p className="mt-1 break-keep text-[14px] font-bold text-mind-600">
            {l({ ko: '광고 제거 · 운세/정밀검사 무제한', en: 'No ads · unlimited fortune & tests', ja: '広告除去・運勢/検査無制限' })}
          </p>
          <div className="mt-5">
            <Button color="iq" onClick={() => setDone(false)}>{l({ ko: '확인', en: 'Done', ja: '確認' })}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
