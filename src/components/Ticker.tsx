import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Modal } from './ui'
import Button from './Button'
import { useStore, TICKER_COST } from '../store/useStore'
import { useL } from '../i18n/useT'
import { moderateText, type ModReason } from '../lib/moderation'
import { burst } from '../lib/confetti'
import { sfx } from '../lib/sound'

/** 📣 전광판(확성기) — 커뮤니티 상단 LED 전광판. 1다이아로 게시, AI 필터로 욕설·19금·스팸 차단. */
export default function Ticker() {
  const l = useL()
  const nav = useNavigate()
  const msgs = useStore((s) => s.tickerMsgs)
  const diamonds = useStore((s) => s.diamonds)
  const postTicker = useStore((s) => s.postTicker)

  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const [needCharge, setNeedCharge] = useState(false)

  const reasonMsg = (r?: ModReason): string => {
    switch (r) {
      case 'adult':
        return l({ ko: '19금·성인 표현은 올릴 수 없어요', en: 'Adult content is not allowed', ja: 'アダルト表現は投稿できません' })
      case 'contact':
        return l({ ko: '연락처·외부 유도는 올릴 수 없어요', en: 'No contacts or off-platform links', ja: '連絡先・外部誘導は不可です' })
      case 'spam':
        return l({ ko: '도박·스팸성 내용은 올릴 수 없어요', en: 'No gambling or spam', ja: 'ギャンブル・スパムは不可です' })
      default:
        return l({ ko: '부적절한 표현이 포함돼 있어요', en: 'Contains inappropriate language', ja: '不適切な表現が含まれています' })
    }
  }

  const submit = () => {
    const body = text.trim()
    if (!body) return
    const m = moderateText(body)
    if (!m.ok) {
      setErr(reasonMsg(m.reason))
      sfx.err?.()
      return
    }
    const r = postTicker(body)
    if (r === 'dia') {
      setNeedCharge(true)
      return
    }
    if (r === 'bad') {
      setErr(reasonMsg())
      return
    }
    burst()
    sfx.coin()
    setText('')
    setErr('')
    setOpen(false)
  }

  const items = msgs.length ? msgs : [{ id: 'empty', text: l({ ko: '📣 첫 전광판을 올려보세요!', en: '📣 Be the first on the board!', ja: '📣 最初の電光掲示を！' }), nick: '', at: 0 }]
  const loop = [...items, ...items]

  return (
    <>
      {/* LED 전광판 바 (풀블리드) */}
      <div className="relative -mx-5 mt-2 flex items-center gap-2 overflow-hidden px-3 py-2" style={{ background: 'linear-gradient(90deg,#1A1340,#2A1C5A,#1A1340)' }}>
        <span className="z-10 shrink-0 rounded-full bg-[#FFD34E] px-2 py-0.5 text-[10px] font-extrabold text-[#3A2A00]">📣 LIVE</span>
        <div className="relative flex-1 overflow-hidden">
          <motion.div
            className="flex gap-10 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: Math.max(16, items.length * 6), ease: 'linear' }}
          >
            {loop.map((m, i) => (
              <span key={i} className="text-[13px] font-extrabold text-[#FFE9A8]" style={{ textShadow: '0 0 8px rgba(255,211,78,0.45)' }}>
                {m.text}
                {m.nick ? <span className="text-[#C9B8FF]"> — {m.nick}</span> : null}
              </span>
            ))}
          </motion.div>
        </div>
        <button
          onClick={() => {
            setOpen(true)
            sfx.tap()
          }}
          className="z-10 shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-extrabold text-white"
        >
          📢 💎{TICKER_COST}
        </button>
      </div>

      {/* 게시 모달 */}
      <Modal open={open} onClose={() => { setOpen(false); setErr('') }}>
        <div className="text-center">
          <p className="text-[34px] leading-none">📢</p>
          <h3 className="mt-1.5 text-[18px] font-extrabold">{l({ ko: '확성기 쏘기', en: 'Megaphone shout', ja: '拡声器を撃つ' })}</h3>
          <p className="mx-auto mt-1 max-w-[280px] break-keep text-[12.5px] font-bold text-ink-faint">{l({ ko: `모두의 화면 상단 전광판에 흐르는 메시지 · 💎${TICKER_COST} · 그냥 글쓰기는 무료예요!`, en: `Scrolls on everyone's top board · 💎${TICKER_COST} · normal posts are free!`, ja: `全員の上部電光掲示に流れる · 💎${TICKER_COST} · 通常の投稿は無料！` })}</p>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setErr('') }}
            maxLength={60}
            rows={2}
            autoFocus
            placeholder={l({ ko: '한 줄 외쳐보세요! (최대 60자)', en: 'Shout one line! (max 60)', ja: '一言どうぞ！(最大60字)' })}
            className="mt-3 w-full resize-none rounded-2xl border-2 border-line bg-surface px-4 py-3 text-[15px] font-bold leading-relaxed outline-none focus:border-[#8B7CF6]"
          />
          <div className="mt-1 flex items-center justify-between text-[11.5px] font-bold">
            <span className="text-ink-faint">{l({ ko: '보유', en: 'You have', ja: '保有' })} 💎 {diamonds}</span>
            <span className="text-ink-faint">{text.length}/60</span>
          </div>
          {err && <p className="mt-1.5 text-[12.5px] font-extrabold text-red-500">⚠️ {err}</p>}
          <div className="mt-3.5">
            <Button color="burn" disabled={!text.trim()} onClick={submit}>
              📢 💎{TICKER_COST} {l({ ko: '확성기 쏘기', en: 'Shout', ja: '撃つ' })}
            </Button>
          </div>
          <p className="mt-2 text-[11px] font-medium leading-relaxed text-ink-faint">
            {l({ ko: '🤖 욕설·19금·광고/연락처는 AI 필터로 자동 차단돼요', en: '🤖 Profanity, adult, ads/contacts are auto-blocked', ja: '🤖 暴言・アダルト・広告/連絡先は自動ブロック' })}
          </p>
        </div>
      </Modal>

      {/* 다이아 부족 */}
      <Modal open={needCharge} onClose={() => setNeedCharge(false)}>
        <div className="text-center">
          <p className="text-[44px] leading-none">💎</p>
          <h3 className="mt-2 text-[19px] font-extrabold">{l({ ko: '다이아가 부족해요', en: 'Not enough diamonds', ja: 'ダイヤが足りません' })}</h3>
          <p className="mt-1 break-keep text-[13.5px] font-bold text-ink-faint">
            {l({ ko: `전광판 게시에 ${TICKER_COST}다이아가 필요해요 · 보유 ${diamonds}`, en: `Posting needs 💎${TICKER_COST} · you have ${diamonds}`, ja: `投稿に💎${TICKER_COST}必要・保有${diamonds}` })}
          </p>
          <div className="mt-5">
            <Button color="iq" onClick={() => nav('/charge')}>💎 {l({ ko: '충전하러 가기', en: 'Go charge', ja: 'チャージへ' })}</Button>
            <button onClick={() => setNeedCharge(false)} className="mt-2 w-full py-2 text-[13px] font-bold text-ink-faint">{l({ ko: '닫기', en: 'Close', ja: '閉じる' })}</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
