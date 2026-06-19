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

/** 전광판 색 — 날짜별로 회전(시즌/기분 변형). grad=배경 그라데, shadow=3D그림자, fade=우측 페이드 */
const TICKER_PALETTES = [
  { grad: ['#4FA882', '#6E9FDC'], shadow: '#2F6B52', fade: '#5A9FB5' },
  { grad: ['#FF8A4C', '#F25C8E'], shadow: '#C2453A', fade: '#F8717D' },
  { grad: ['#8B7CF6', '#6E9FDC'], shadow: '#5B49C4', fade: '#7B8EE6' },
  { grad: ['#10B981', '#12A5C2'], shadow: '#0B7A55', fade: '#11A5B1' },
  { grad: ['#F25C8E', '#FFB347'], shadow: '#B83863', fade: '#F98A6A' },
]

/** 📣 전광판(확성기) — 커뮤니티 상단. 1다이아로 게시, AI 필터로 욕설·19금·스팸 차단. */
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
  const pal = TICKER_PALETTES[Math.floor(Date.now() / 86400000) % TICKER_PALETTES.length]

  return (
    <>
      {/* 확성기 전광판 — 듀오링고 스타일(둥근 카드 + 3D 그림자 + 흔들리는 메가폰) */}
      <div
        className="relative mt-3 overflow-hidden rounded-3xl"
        style={{ background: `linear-gradient(135deg,${pal.grad[0]},${pal.grad[1]})`, boxShadow: `0 4px 0 ${pal.shadow}` }}
      >
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <motion.div
            animate={{ rotate: [0, -13, 13, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut', repeatDelay: 1.5 }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-[18px] shadow"
            style={{ transformOrigin: '50% 70%' }}
          >
            📣
          </motion.div>
          <div className="relative min-w-0 flex-1 overflow-hidden">
            <motion.div
              className="flex gap-8 whitespace-nowrap"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, duration: Math.max(14, items.length * 5.5), ease: 'linear' }}
            >
              {loop.map((m, i) => (
                <span key={i} className="text-[13.5px] font-extrabold tracking-tight text-white">
                  {m.text}
                  {m.nick ? <span className="font-bold text-white/75"> · {m.nick}</span> : null}
                </span>
              ))}
            </motion.div>
            {/* 양끝 페이드(말풍선이 칼로 잘리지 않게) */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-5" style={{ background: `linear-gradient(90deg,transparent,${pal.fade})` }} />
          </div>
          <motion.button
            whileTap={{ scale: 0.9, y: 2, boxShadow: '0 0 0 rgba(0,0,0,0.18)' }}
            onClick={() => {
              setOpen(true)
              sfx.tap()
            }}
            className="z-10 shrink-0 rounded-2xl bg-white px-2.5 py-1.5 text-[12px] font-extrabold text-[#2F6B52]"
            style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.18)' }}
          >
            📢 💎{TICKER_COST}
          </motion.button>
        </div>
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
