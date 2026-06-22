import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TopBar, Card } from '../components/ui'
import Button from '../components/Button'
import { useStore } from '../store/useStore'
import { useL } from '../i18n/useT'
import { authReady, getAuthUser } from '../lib/auth'
import { fetchMail, claimMail, claimAllMail, cancelPurchase, type MailItem } from '../lib/mailbox'
import { burst } from '../lib/confetti'
import { sfx } from '../lib/sound'

export default function Mailbox() {
  const l = useL()
  const addDiamonds = useStore((s) => s.addDiamonds)
  const [mail, setMail] = useState<MailItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const u = await getAuthUser()
    setLoggedIn(!!u)
    setMail(u ? await fetchMail() : [])
    setLoading(false)
  }
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const flash = (t: string) => {
    setMsg(t)
    setTimeout(() => setMsg(''), 2200)
  }

  const onClaim = async (it: MailItem) => {
    const got = await claimMail(it.id)
    if (got > 0) addDiamonds(got)
    setMail((m) => m.map((x) => (x.id === it.id ? { ...x, claimed: true } : x)))
    burst()
    sfx.coin()
    if (got > 0) flash(l({ ko: `💎 ${got}개를 받았어요`, en: `Got 💎${got}`, ja: `💎${got}個 受取` }))
  }

  const onClaimAll = async () => {
    const got = await claimAllMail()
    if (got > 0) addDiamonds(got)
    setMail((m) => m.map((x) => ({ ...x, claimed: true })))
    if (got > 0) {
      burst()
      sfx.coin()
      flash(l({ ko: `💎 ${got}개를 모두 받았어요`, en: `Claimed all 💎${got}`, ja: `💎${got}個 一括受取` }))
    }
  }

  const onCancel = async (it: MailItem) => {
    const r = await cancelPurchase(it.id)
    if (r === 'refunded') {
      setMail((m) => m.filter((x) => x.id !== it.id))
      flash(l({ ko: '청약철회(환불) 처리됐어요', en: 'Refund processed', ja: '返金処理しました' }))
    } else if (r === 'already_claimed') {
      flash(l({ ko: '이미 수령해 청약철회할 수 없어요', en: 'Already received — cannot refund', ja: '受取済みのため返金不可' }))
      sfx.err()
    } else {
      flash(l({ ko: '환불 대상이 아니에요', en: 'Not refundable', ja: '返金対象外' }))
      sfx.err()
    }
  }

  const unclaimedWithDia = mail.filter((m) => !m.claimed && m.amount > 0).length

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/" title={l({ ko: '우편함', en: 'Mailbox', ja: '郵便箱' })} />
      <main className="mx-auto max-w-md px-5">
        {msg && (
          <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl bg-mind-100 py-2.5 text-center text-[14px] font-extrabold text-mind-700">
            {msg}
          </motion.p>
        )}

        {loading ? (
          <p className="mt-16 text-center text-[14px] font-bold text-ink-faint">{l({ ko: '불러오는 중…', en: 'Loading…', ja: '読み込み中…' })}</p>
        ) : !authReady() || loggedIn === false ? (
          <Card className="mt-6 text-center">
            <div className="text-[44px]">📭</div>
            <h2 className="mt-2 text-[17px] font-extrabold">{l({ ko: '로그인하면 우편을 받을 수 있어요', en: 'Log in to receive mail', ja: 'ログインで郵便を受取' })}</h2>
            <p className="mt-1.5 break-keep text-[13px] font-medium leading-relaxed text-ink-sub">
              {l({ ko: '카카오 로그인하면 운영자 지급·결제 다이아·개인 우편을 여기서 받아요.', en: 'After Kakao login, claim operator gifts, purchased diamonds, and personal mail here.', ja: 'カカオログイン後、運営者ギフト・購入ダイヤ・個人郵便をここで受取。' })}
            </p>
          </Card>
        ) : mail.length === 0 ? (
          <Card className="mt-6 text-center">
            <div className="text-[44px]">📭</div>
            <h2 className="mt-2 text-[16px] font-extrabold">{l({ ko: '받은 우편이 없어요', en: 'No mail yet', ja: '郵便はありません' })}</h2>
          </Card>
        ) : (
          <>
            {unclaimedWithDia > 0 && (
              <div className="mt-4">
                <Button color="iq" onClick={onClaimAll}>
                  📬 {l({ ko: `안 받은 우편 ${unclaimedWithDia}개 모두 받기`, en: `Claim all ${unclaimedWithDia}`, ja: `未受取 ${unclaimedWithDia}件 一括受取` })}
                </Button>
              </div>
            )}
            <div className="mt-4 space-y-2.5">
              {mail.map((it) => {
                const refundable = it.kind === 'purchase' && it.refundable && !it.claimed
                return (
                  <Card key={it.id} className={`!p-4 ${it.claimed ? 'opacity-60' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-iq-light text-[20px]">
                        {it.kind === 'purchase' ? '🧾' : it.kind === 'personal' ? '✉️' : it.kind === 'system' ? '📢' : '🎁'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[15px] font-extrabold leading-tight">{it.title}</p>
                          <span className="shrink-0 text-[11px] font-bold text-ink-faint">{it.sender}</span>
                        </div>
                        {it.body && <p className="mt-1 break-keep text-[13px] font-medium leading-relaxed text-ink-sub">{it.body}</p>}
                        {(it.amount > 0 || it.points > 0) && (
                          <p className="mt-1.5 text-[13px] font-extrabold text-mind-700">
                            {it.amount > 0 && `💎 ${it.amount}`}
                            {it.amount > 0 && it.points > 0 && ' · '}
                            {it.points > 0 && `🪙 ${it.points}`}
                          </p>
                        )}
                        <div className="mt-2.5 flex items-center gap-2">
                          {!it.claimed ? (
                            <button onClick={() => onClaim(it)} className="rounded-full bg-[#6E7BF2] px-4 py-1.5 text-[13px] font-extrabold text-white">
                              {l({ ko: '받기', en: 'Claim', ja: '受取' })}
                            </button>
                          ) : (
                            <span className="rounded-full bg-line px-3 py-1.5 text-[12px] font-extrabold text-ink-faint">
                              ✅ {l({ ko: '수령 완료', en: 'Received', ja: '受取済み' })}
                              {it.kind === 'purchase' && ` · ${l({ ko: '환불 불가', en: 'no refund', ja: '返金不可' })}`}
                            </span>
                          )}
                          {refundable && (
                            <button onClick={() => onCancel(it)} className="rounded-full border-2 border-line px-3 py-1.5 text-[12px] font-extrabold text-ink-sub">
                              {l({ ko: '청약철회(환불)', en: 'Refund', ja: '返金' })}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
            <p className="mt-4 px-2 text-center text-[11.5px] font-medium leading-relaxed text-ink-faint">
              {l({
                ko: 'ⓘ 유료 결제 다이아는 우편함에서 "받기" 전까지만 청약철회(환불)할 수 있어요. 받기를 누르면 콘텐츠 사용 개시로 간주되어 환불이 제한됩니다.',
                en: 'ⓘ Purchased diamonds can be refunded only before you tap "Claim". Claiming counts as using the content, after which refunds are restricted.',
                ja: 'ⓘ 購入ダイヤは「受取」前のみ返金可能。受取はコンテンツ使用開始とみなされ返金が制限されます。',
              })}
            </p>
          </>
        )}
      </main>
    </div>
  )
}
