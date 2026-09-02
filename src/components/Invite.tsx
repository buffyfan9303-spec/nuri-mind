import { useEffect, useState } from 'react'
import { Card } from './ui'
import Button from './Button'
import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'
import { burst } from '../lib/confetti'
import { sfx } from '../lib/sound'
import { ensureReferralCodeServer, referralCountServer, referralReady, redeemReferralServer } from '../lib/referral'

// 누적 초대 보너스 — 신규 유입 LTV로 정당화(일일 상한과 별개). 서버 연동 시 자동 지급.
// 최상위(10명+)엔 다이아(유료 재화)까지 얹어 강력한 바이럴 후크.
const MILESTONES: { n: number; p: number; d?: number }[] = [
  { n: 1, p: 100 },
  { n: 3, p: 300 },
  { n: 5, p: 600 },
  { n: 10, p: 1500, d: 10 },
]

/** Temu식 마일스톤 친구 초대 (코드 기반 — 서버 연동 전 로컬 버전) */
export default function Invite() {
  const t = useT()
  const referralCodeLocal = useStore((s) => s.referralCode)
  const referredBy = useStore((s) => s.referredBy)
  const invitedCount = useStore((s) => s.invitedCount)
  const redeemCode = useStore((s) => s.redeemCode)

  // 표시·공유 코드: 로그인 시 서버 코드(profiles.referral_code = 인바이터 보상 매칭 기준), 아니면 로컬 폴백
  const [referralCode, setReferralCode] = useState(referralCodeLocal)
  const [serverCount, setServerCount] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [input, setInput] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const sv = await ensureReferralCodeServer()
      if (!alive || !sv) return
      setReferralCode(sv)
      const n = await referralCountServer(sv)
      if (alive && n !== null) setServerCount(n)
    })()
    return () => {
      alive = false
    }
  }, [])

  const shownCount = serverCount ?? invitedCount

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCopied(true)
      sfx.tap()
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* noop */
    }
  }

  const share = async () => {
    // 링크에 코드를 실어 보낸다 — 온보딩 화면엔 코드 입력란이 없어서
    // '가입할 때 코드 입력' 안내는 실제로 따라갈 수 없는 동선이었다.
    const text = `🧠 누리 마인드 — 심리검사로 진짜 나 찾기! 이 링크로 시작하면 너도 나도 +100P 🎁 ${window.location.origin}/?invite=${referralCode}`
    try {
      if (navigator.share) await navigator.share({ text })
      else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }
    } catch {
      /* 사용자가 취소 */
    }
  }

  const submit = async () => {
    // 서버 검증(카카오 로그인 + supabase): 계정당 1회 — localStorage 초기화 파밍 차단.
    // 서버가 확정 판정('used'/'self'/'invalid')을 내리면 로컬 폴백 금지 —
    // 특히 자기 서버 코드('self')가 로컬 검사(로컬 코드와만 비교)를 통과해 자가지급되는 구멍 차단.
    // 로컬 폴백은 판정 불가('no_auth'/'unavailable')일 때만.
    if (referralReady()) {
      const sv = await redeemReferralServer(input.trim().toUpperCase())
      if (sv === 'used') {
        setMsg({ ok: false, text: t('invite.usedAccount') })
        sfx.err()
        return
      }
      if (sv === 'self') {
        setMsg({ ok: false, text: t('invite.mine') })
        sfx.err()
        return
      }
      if (sv === 'invalid') {
        setMsg({ ok: false, text: t('invite.invalid') })
        sfx.err()
        return
      }
    }
    const r = redeemCode(input)
    if (r === 'ok') {
      setMsg({ ok: true, text: t('invite.ok') })
      burst()
      sfx.coin()
    } else {
      setMsg({ ok: false, text: t(r === 'mine' ? 'invite.mine' : r === 'used' ? 'invite.used' : 'invite.invalid') })
      sfx.err()
    }
  }

  return (
    <Card className="!p-5">
      <div className="flex items-center gap-3.5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ego-light text-3xl">🤝</div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-semibold">{t('invite.title')}</h3>
          <p className="mt-0.5 text-[13px] font-medium leading-relaxed text-ink-faint">{t('invite.sub')}</p>
        </div>
      </div>

      {/* 내 코드 */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 rounded-2xl border-2 border-dashed border-mind-300 bg-mind-50 px-4 py-3 text-center">
          <p className="text-[11px] font-semibold tracking-widest text-mind-600">{t('invite.myCode')}</p>
          <p className="text-[20px] font-extrabold tracking-[0.15em] text-mind-800">{referralCode}</p>
        </div>
        <div className="flex w-[104px] flex-col gap-2">
          <Button color="white" size="sm" onClick={copy}>
            {copied ? '✅' : `📋 ${t('invite.copy')}`}
          </Button>
          <Button color="mind" size="sm" onClick={share}>
            {t('common.share')}
          </Button>
        </div>
      </div>

      {/* 마일스톤 */}
      <div className="mt-4">
        <p className="text-[13px] font-semibold text-ink-sub">🏁 {t('invite.ms')}</p>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {MILESTONES.map((m) => {
            const hit = shownCount >= m.n
            return (
              <div
                key={m.n}
                className="rounded-2xl border-2 py-2 text-center"
                style={{
                  borderColor: hit ? '#4FA882' : '#E3EAE5',
                  background: hit ? '#4FA8821A' : 'rgb(var(--surface))',
                }}
              >
                <p className="text-[11px] font-semibold">{hit ? '🎉' : '👥'}{m.n}명</p>
                <p className="mt-0.5 text-[11px] font-semibold text-mind-700">+{m.p.toLocaleString()}P</p>
                {m.d && <p className="text-[11px] font-semibold text-[#6E7BF2]">+💎{m.d}</p>}
              </div>
            )
          })}
        </div>
        <p className="mt-1.5 text-[11px] font-medium text-ink-faint">ⓘ {t('invite.msNote')}</p>
      </div>

      {/* 친구 코드 입력 */}
      {!referredBy && (
        <div className="mt-4">
          <p className="text-[13px] font-semibold text-ink-sub">{t('invite.enterTitle')}</p>
          <div className="mt-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value.toUpperCase())
                setMsg(null)
              }}
              placeholder={t('invite.ph')}
              maxLength={11}
              className="min-w-0 flex-1 rounded-2xl border-2 border-line bg-surface px-4 py-3 text-[15px] font-semibold outline-none focus:border-mind-400"
            />
            <Button color="mind" size="sm" full={false} disabled={input.length < 9} onClick={submit}>
              {t('invite.submit')}
            </Button>
          </div>
        </div>
      )}
      {msg && (
        <p className={`mt-2.5 text-center text-[14px] font-semibold${msg.ok ? 'text-mind-700' : 'text-red-500'}`}>
          {msg.text}
        </p>
      )}
    </Card>
  )
}
