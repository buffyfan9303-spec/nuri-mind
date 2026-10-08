import { shareOrigin } from '../lib/platform'
import { useEffect, useState } from 'react'
import { Card } from './ui'
import Button from './Button'
import { useStore } from '../store/useStore'
import { useL, useT } from '../i18n/useT'
import { authMark, isStaleAuth } from '../lib/economy'
import { referralNextStep } from '../lib/econCore'
import { burst } from '../lib/confetti'
import { sfx } from '../lib/sound'
import { ensureReferralCodeServer, referralCountServer, referralReady, redeemReferralServer } from '../lib/referral'
import Emoji, { EmojiText } from './Emoji'
import { shareOrCopy } from '../lib/share'

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
  const l = useL()
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
    const text = `🧠 누리 마인드 — 심리검사로 진짜 나 찾기! 이 링크로 시작하면 너도 나도 +100P 🎁 ${shareOrigin()}/?invite=${referralCode}`
    if ((await shareOrCopy({ text })) === 'copied') {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }
  }

  const submit = async () => {
    // 서버 검증(카카오 로그인 + supabase): 계정당 1회 — localStorage 초기화 파밍 차단.
    // 서버가 확정 판정('used'/'self'/'invalid')을 내리면 로컬 폴백 금지 —
    // 특히 자기 서버 코드('self')가 로컬 검사(로컬 코드와만 비교)를 통과해 자가지급되는 구멍 차단.
    // 로컬 폴백은 비로그인('no_auth' — 서버 판정 대상이 아님)일 때만.
    // ⚠️ 'unavailable'(로그인했는데 서버 확인 실패)에서 로컬 보상을 주면 안 된다 — 서버가 'used'라고
    //    했을 계정도 오프라인·장애 한 번에 +100P를 받는다. "지금은 확인할 수 없어요"로 막는다.
    if (referralReady()) {
      const start = authMark()
      const sv = await redeemReferralServer(input.trim().toUpperCase())
      // 응답을 기다리는 사이 계정이 바뀌었으면 이 판정은 지금 계정 것이 아니다 — 로컬 보상도 주지 않는다
      const step = referralNextStep(sv, isStaleAuth(start, authMark()))
      if (step === 'blocked') {
        setMsg({ ok: false, text: l({ ko: '지금은 확인할 수 없어요. 잠시 후 다시 시도해 주세요.', en: "We can't verify this right now. Please try again shortly.", ja: '今は確認できません。少し後にもう一度お試しください。' }) })
        sfx.err()
        return
      }
      if (step === 'used') {
        setMsg({ ok: false, text: t('invite.usedAccount') })
        sfx.err()
        return
      }
      if (step === 'self') {
        setMsg({ ok: false, text: t('invite.mine') })
        sfx.err()
        return
      }
      if (step === 'invalid') {
        setMsg({ ok: false, text: t('invite.invalid') })
        sfx.err()
        return
      }
    }
    // 여기 닿는 경우: 서버 미설정 빌드 · 비로그인('no_auth') · 서버가 'ok'(지급 완료 — 로컬 반영, 같은 멱등키라 서버 이중 지급 없음)
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
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ego-light"><Emoji e="🤝" size={30} /></div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-extrabold">{t('invite.title')}</h3>
          <p className="mt-0.5 text-[13px] font-bold leading-relaxed text-ink-faint">{t('invite.sub')}</p>
        </div>
      </div>

      {/* 내 코드 */}
      <div className="mt-4 flex items-center gap-2">
        <div className="min-w-0 flex-1 rounded-2xl border-2 border-dashed border-mind-300 bg-mind-50 px-4 py-3 text-center">
          <p className="text-[11px] font-extrabold tracking-widest text-mind-600">{t('invite.myCode')}</p>
          {/* 360px에서 tracking-[0.15em]+20px가 2줄로 접혔다 — nowrap+살짝 축소 */}
          <p className="whitespace-nowrap text-[17px] font-extrabold tracking-[0.08em] text-mind-800">{referralCode}</p>
        </div>
        <div className="flex w-[104px] flex-col gap-2">
          <Button color="white" size="sm" onClick={copy}>
            <EmojiText text={copied ? '✅' : `📋 ${t('invite.copy')}`} />
          </Button>
          <Button color="mind" size="sm" onClick={share}>
            {t('common.share')}
          </Button>
        </div>
      </div>

      {/* 마일스톤 */}
      <div className="mt-4">
        <p className="text-[13px] font-extrabold text-ink-sub"><Emoji e="🏁" inline />{t('invite.ms')}</p>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {MILESTONES.map((m) => {
            const hit = shownCount >= m.n
            return (
              <div
                key={m.n}
                className="rounded-2xl border-2 py-2 text-center"
                style={{
                  // 라인 토큰 — 고정 #E3EAE5는 다크모드에서 어두운 카드 위에 밝은 테두리로 떠 있었다
                  borderColor: hit ? '#4FA882' : 'rgb(var(--line))',
                  background: hit ? '#4FA8821A' : 'rgb(var(--surface))',
                }}
              >
                <p className="text-[11px] font-extrabold"><Emoji e={hit ? '🎉' : '👥'} inline />{m.n}명</p>
                <p className="mt-0.5 text-[11px] font-extrabold text-mind-700">+{m.p.toLocaleString()}P</p>
                {m.d && <p className="text-[11px] font-extrabold text-[#6E7BF2]">+<Emoji e="💎" inline />{m.d}</p>}
              </div>
            )
          })}
        </div>
        <p className="mt-1.5 text-[11px] font-bold text-ink-faint">ⓘ {t('invite.msNote')}</p>
      </div>

      {/* 친구 코드 입력 */}
      {!referredBy && (
        <div className="mt-4">
          <p className="text-[13px] font-extrabold text-ink-sub">{t('invite.enterTitle')}</p>
          <div className="mt-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value.toUpperCase())
                setMsg(null)
              }}
              placeholder={t('invite.ph')}
              aria-label={t('invite.enterTitle')}
              maxLength={11}
              className="min-w-0 flex-1 rounded-2xl border-2 border-line bg-surface px-4 py-3 text-[15px] font-extrabold outline-none focus:border-mind-400"
            />
            <Button color="mind" size="sm" full={false} disabled={input.length < 9} onClick={submit}>
              {t('invite.submit')}
            </Button>
          </div>
        </div>
      )}
      {msg && (
        <p className={`mt-2.5 text-center text-[14px] font-extrabold ${msg.ok ? 'text-mind-700' : 'text-red-500'}`}>
          {msg.text}
        </p>
      )}
    </Card>
  )
}
