import { useEffect, useState } from 'react'
import { useSkeletonGate } from '../hooks/useSkeletonGate'
import { motion } from 'framer-motion'
import { TopBar, Card } from '../components/ui'
import Button from '../components/Button'
import { useStore } from '../store/useStore'
import { useL } from '../i18n/useT'
import { authReady, getAuthUser, onAuthChange, signInWithKakao } from '../lib/auth'
import { fetchMail, claimMail, claimAllMail, cancelPurchase, type MailItem, confirmMailDelivery } from '../lib/mailbox'
import { isAccountSwitchPending } from '../lib/economy'
import { burst } from '../lib/confetti'
import { sfx } from '../lib/sound'

/** 만료까지 남은 일수(올림). */
function expDays(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

/**
 * DB에 깨진 인코딩으로 저장된 한글 감지(우편 제목은 SQL 함수가 서버에서 조립 —
 * SQL Editor 실행 시 인코딩이 깨지면 'ë‹¤ì´ì•„' 같은 모지바케가 그대로 옴).
 * 한글이 하나도 없는데 라틴 확장 문자가 연속되거나 대체문자(�)가 있으면 깨진 것으로 판정.
 */
function isMojibake(s: string | null | undefined): boolean {
  if (!s) return false
  if (/�/.test(s)) return true
  if (/[가-힣]/.test(s)) return false
  return /[À-ɏˀ-˿]{2}/.test(s) || /^[?\s·]+$/.test(s)
}

export default function Mailbox() {
  const l = useL()
  const addDiamonds = useStore((s) => s.addDiamonds)
  const [mail, setMail] = useState<MailItem[]>([])
  const [loading, setLoading] = useState(true)
  // 응답이 200ms 안에 오면(대부분) '불러오는 중'을 아예 안 보인다 — 번쩍임이 빈 화면보다 산만하다
  const showLoading = useSkeletonGate(loading)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [uid, setUid] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const u = await getAuthUser()
    setLoggedIn(!!u)
    setUid(u?.id ?? null)
    setMail(u ? await fetchMail() : [])
    setLoading(false)
  }
  useEffect(() => {
    load()
    // 타 탭 로그인/로그아웃(BroadcastChannel 전파)도 반영 — 세션 상태와 화면 동기화
    return onAuthChange(() => load())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const flash = (t: string) => {
    setMsg(t)
    setTimeout(() => setMsg(''), 2200)
  }

  const onLogin = async () => {
    const r = await signInWithKakao()
    if (!r.ok) flash(l({ ko: '카카오 로그인 준비 중이에요. 잠시 후 다시 시도해 주세요.', en: 'Kakao login is being set up. Please try again later.', ja: 'カカオログイン準備中です。後ほどお試しください。' }))
  }

  // OAuth 콜백에 에러가 실려오면(설정 문제 등) 사용자에게 그대로 보여줌 → 원인 진단
  useEffect(() => {
    const q = new URLSearchParams(window.location.search.slice(1))
    const h = new URLSearchParams(window.location.hash.slice(1))
    const err = q.get('error_description') || h.get('error_description') || q.get('error') || h.get('error')
    if (err) {
      flash(l({ ko: `카카오 로그인 실패: ${decodeURIComponent(err).slice(0, 90)}`, en: `Login failed: ${err.slice(0, 90)}`, ja: `ログイン失敗: ${err.slice(0, 90)}` }))
      window.history.replaceState({}, '', window.location.pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const claimFailMsg = () =>
    flash(l({ ko: '받기에 실패했어요. 네트워크 확인 후 다시 시도해 주세요.', en: 'Claim failed. Check your connection and retry.', ja: '受取に失敗。接続を確認して再試行してください。' }))

  /** 계정 전환 반영 전에는 수령 금지 — 서버에서 이미 claimed 처리된 다이아가 직후 스왑에 덮여 사라진다 */
  const switchPending = () => {
    if (!isAccountSwitchPending(uid)) return false
    sfx.err()
    flash(l({ ko: '계정 동기화 중이에요. 잠시 후 다시 받아 주세요.', en: 'Syncing your account — please retry in a moment.', ja: 'アカウント同期中です。少し後に再試行してください。' }))
    return true
  }

  const onClaim = async (it: MailItem) => {
    if (switchPending()) return
    const got = await claimMail(it.id)
    // 실패(null)는 수령 처리하지 않음 — 가짜 '수령 완료·환불 불가' 표시 방지
    if (got === null) {
      sfx.err()
      claimFailMsg()
      return
    }
    if (got > 0) addDiamonds(got)
    // 로컬 가산이 끝난 뒤에만 서버에 배송 확정 — 그 전엔 서버가 재지급 가능 상태로 보관
    void confirmMailDelivery([it.id])
    setMail((m) => m.map((x) => (x.id === it.id ? { ...x, claimed: true } : x)))
    burst()
    sfx.coin()
    if (got > 0) flash(l({ ko: `💎 ${got}개를 받았어요`, en: `Got 💎${got}`, ja: `💎${got}個 受取` }))
  }

  const onClaimAll = async () => {
    if (switchPending()) return
    const got = await claimAllMail()
    if (got === null) {
      sfx.err()
      claimFailMsg()
      return
    }
    if (got > 0) addDiamonds(got)
    void confirmMailDelivery()
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
          <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl bg-mind-100 py-2.5 text-center text-[14px] font-semibold text-mind-700">
            {msg}
          </motion.p>
        )}

        {loading ? (
          showLoading && (
            <p className="mt-16 text-center text-[14px] font-bold text-ink-faint">{l({ ko: '불러오는 중…', en: 'Loading…', ja: '読み込み中…' })}</p>
          )
        ) : !authReady() || loggedIn === false ? (
          <Card className="mt-6 text-center">
            <div className="text-[28px]">📭</div>
            <h2 className="mt-2 break-keep text-[17px] font-semibold">{l({ ko: '카카오로 로그인하면 우편을 받아요', en: 'Log in with Kakao to get mail', ja: 'カカオログインで郵便を受取' })}</h2>
            <p className="mt-1.5 break-keep text-[13px] font-medium leading-relaxed text-ink-sub">
              {l({ ko: '지금은 이 기기에만 저장돼요. 카카오 계정으로 로그인하면 운영자 지급·결제 다이아·개인 우편을 어느 기기에서나 받을 수 있어요.', en: "You're using this device locally. Log in with Kakao to claim operator gifts, purchased diamonds, and personal mail on any device.", ja: '今はこの端末のみ。カカオでログインすると、運営者ギフト・購入ダイヤ・個人郵便をどの端末でも受取れます。' })}
            </p>
            <button onClick={onLogin} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#FEE500] py-3 text-[15px] font-semibold text-[#191919] shadow-card transition-transform active:translate-y-[2px]">
              {l({ ko: '카카오로 로그인', en: 'Log in with Kakao', ja: 'カカオでログイン' })}
            </button>
          </Card>
        ) : mail.length === 0 ? (
          <Card className="mt-6 text-center">
            <div className="text-[28px]">📭</div>
            <h2 className="mt-2 text-[16px] font-semibold">{l({ ko: '받은 우편이 없어요', en: 'No mail yet', ja: '郵便はありません' })}</h2>
          </Card>
        ) : (
          <>
            {unclaimedWithDia > 0 && (
              <div className="mt-4">
                <Button color="iq" onClick={onClaimAll}>
                  {l({ ko: `안 받은 우편 ${unclaimedWithDia}개 모두 받기`, en: `Claim all ${unclaimedWithDia}`, ja: `未受取 ${unclaimedWithDia}件 一括受取` })}
                </Button>
              </div>
            )}
            <div className="mt-4 space-y-2.5">
              {mail.map((it) => {
                const refundable = it.kind === 'purchase' && it.refundable && !it.claimed
                // 서버 문자열이 깨졌으면 클라에서 재구성(폰트 깨짐 방지)
                const title = isMojibake(it.title)
                  ? it.amount > 0
                    ? l({ ko: `다이아 ${it.amount}개 도착`, en: `💎 ${it.amount} diamonds arrived`, ja: `💎 ダイヤ${it.amount}個到着` })
                    : it.kind === 'personal'
                      ? l({ ko: '개인 우편', en: '✉️ Personal mail', ja: '✉️ 個人郵便' })
                      : it.kind === 'system'
                        ? l({ ko: '공지', en: '📢 Notice', ja: '📢 お知らせ' })
                        : l({ ko: '새 우편', en: '📬 New mail', ja: '📬 新着郵便' })
                  : it.title
                const sender = isMojibake(it.sender) ? l({ ko: '운영자', en: 'Operator', ja: '運営' }) : it.sender
                const body = isMojibake(it.body) ? null : it.body
                return (
                  <Card key={it.id} className={`!p-4 ${it.claimed ? 'opacity-60' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-iq-light text-[20px]">
                        {it.kind === 'purchase' ? '🧾' : it.kind === 'personal' ? '✉️' : it.kind === 'system' ? '📢' : '🎁'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[15px] font-semibold leading-tight">{title}</p>
                          <span className="shrink-0 text-[11px] font-medium text-ink-faint">{sender}</span>
                        </div>
                        {body && <p className="mt-1 break-keep text-[13px] font-medium leading-relaxed text-ink-sub">{body}</p>}
                        {(it.amount > 0 || it.points > 0) && (
                          <p className="mt-1.5 text-[13px] font-semibold text-mind-700">
                            {it.amount > 0 && `💎 ${it.amount}`}
                            {it.amount > 0 && it.points > 0 && ' · '}
                            {it.points > 0 && `🪙 ${it.points}`}
                          </p>
                        )}
                        <div className="mt-2.5 flex items-center gap-2">
                          {!it.claimed ? (
                            <button onClick={() => onClaim(it)} className="rounded-full bg-[#6E7BF2] px-4 py-1.5 text-[13px] font-semibold text-white">
                              {l({ ko: '받기', en: 'Claim', ja: '受取' })}
                            </button>
                          ) : (
                            <span className="rounded-full bg-line px-3 py-1.5 text-[12px] font-semibold text-ink-faint">
                              ✅ {l({ ko: '수령 완료', en: 'Received', ja: '受取済み' })}
                              {it.kind === 'purchase' && ` · ${l({ ko: '환불 불가', en: 'no refund', ja: '返金不可' })}`}
                            </span>
                          )}
                          {refundable && (
                            <button onClick={() => onCancel(it)} className="rounded-full border-2 border-line px-3 py-1.5 text-[12px] font-semibold text-ink-sub">
                              {l({ ko: '청약철회(환불)', en: 'Refund', ja: '返金' })}
                            </button>
                          )}
                          {!it.claimed && it.expires_at && (
                            <span className={`ml-auto shrink-0 text-[11px] font-semibold${expDays(it.expires_at) <= 3 ? 'text-red-400' : 'text-ink-faint'}`}>
                              ⏳ D-{Math.max(0, expDays(it.expires_at))}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
            <p className="mt-4 px-2 text-center text-[11px] font-medium leading-relaxed text-ink-faint">
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
