import { useEffect, useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, TopBar } from '../components/ui'
import Button from '../components/Button'
import { useL } from '../i18n/useT'
import { ID_RULE, PW_MIN, getAuthUser, normalizeId, signInWithId, signUpWithId, type IdAuthError } from '../lib/auth'

/**
 * 아이디·비밀번호 로그인/회원가입. 약관·개인정보 동의는 온보딩에서 이미 받았다(이 화면은 온보딩 뒤에만 열린다).
 * 성공하면 세션 이벤트(onAuthChange)가 계정 경계·동기화를 맡는다 — 카카오 로그인과 같은 경로.
 */
export default function IdLogin() {
  const l = useL()
  const nav = useNavigate()
  const uid = useId()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  // 이미 로그인돼 있으면 들어오지 않는다 — 로그아웃(계정 경계) 없이 다른 계정으로 바로 바꾸면,
  // 진행 중이던 이전 계정의 적립 전송이 새 계정 토큰으로 나가 섞일 수 있다(카카오는 리다이렉트라 페이지가 새로 떴다)
  useEffect(() => {
    let alive = true
    void getAuthUser().then((u) => alive && u && nav('/profile', { replace: true }))
    return () => {
      alive = false
    }
  }, [nav])

  const msg = (e: IdAuthError | 'mismatch'): string =>
    ({
      invalid_id: l({ ko: '아이디는 영문 소문자·숫자·밑줄(_) 4~20자로 만들어 주세요.', en: 'Use 4–20 lowercase letters, numbers, or _.', ja: 'IDは英小文字・数字・_ で4〜20文字にしてください。' }),
      weak_password: l({ ko: `비밀번호는 ${PW_MIN}자 이상으로 해 주세요.`, en: `Password must be at least ${PW_MIN} characters.`, ja: `パスワードは${PW_MIN}文字以上にしてください。` }),
      mismatch: l({ ko: '비밀번호 확인이 달라요.', en: "Passwords don't match.", ja: 'パスワード確認が一致しません。' }),
      taken: l({ ko: '이미 쓰고 있는 아이디예요.', en: 'That ID is already taken.', ja: 'そのIDはすでに使われています。' }),
      wrong: l({ ko: '아이디나 비밀번호가 맞지 않아요.', en: 'Wrong ID or password.', ja: 'IDまたはパスワードが違います。' }),
      too_many: l({ ko: '가입 시도가 너무 많아요. 1시간 뒤에 다시 시도해 주세요.', en: 'Too many sign-ups. Please try again in an hour.', ja: '登録の試行が多すぎます。1時間後にお試しください。' }),
      confirm_required: l({ ko: '지금은 아이디 가입을 받을 수 없어요. 잠시 후 다시 시도해 주세요.', en: 'ID sign-up is unavailable right now. Please try again later.', ja: '現在ID登録を受け付けられません。後ほどお試しください。' }),
      failed: l({ ko: '연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.', en: 'Connection problem. Please try again shortly.', ja: '接続が不安定です。少し後にお試しください。' }),
    })[e]

  const submit = async (ev?: FormEvent) => {
    ev?.preventDefault()
    if (busy) return
    if (mode === 'signup' && pw !== pw2) return setErr(msg('mismatch'))
    setBusy(true)
    setErr('')
    // 네트워크 예외(오프라인 등)도 실패로 — 버튼이 busy로 멈추지 않게
    const r = await (mode === 'login' ? signInWithId(id, pw) : signUpWithId(id, pw)).catch(() => ({ ok: false as const, error: 'failed' as const }))
    setBusy(false)
    if (!r.ok) return setErr(msg(r.error ?? 'failed'))
    nav('/profile', { replace: true })
  }

  const idBad = mode === 'signup' && id !== '' && !ID_RULE.test(normalizeId(id))
  const field = 'mt-1.5 w-full rounded-2xl border-2 border-line bg-surface px-4 py-3.5 text-[16px] font-extrabold outline-none focus:border-mind-400'

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/profile" title={mode === 'login' ? l({ ko: '아이디로 로그인', en: 'Log in with ID', ja: 'IDでログイン' }) : l({ ko: '아이디로 회원가입', en: 'Sign up with ID', ja: 'IDで会員登録' })} />
      <main className="mx-auto max-w-md px-5">
        <div role="tablist" className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-surface2 p-1">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m)
                setErr('')
              }}
              className={`rounded-xl py-2.5 text-[14px] font-extrabold ${mode === m ? 'bg-surface text-ink shadow-card' : 'text-ink-faint'}`}
            >
              {m === 'login' ? l({ ko: '로그인', en: 'Log in', ja: 'ログイン' }) : l({ ko: '회원가입', en: 'Sign up', ja: '会員登録' })}
            </button>
          ))}
        </div>

        <Card className="mt-4 !p-4">
          <form onSubmit={submit} noValidate>
            <label htmlFor={`${uid}-id`} className="text-[14px] font-extrabold">{l({ ko: '아이디', en: 'ID', ja: 'ID' })}</label>
            <input id={`${uid}-id`} value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={20} className={field} />
            {mode === 'signup' && (
              <p className={`mt-1 text-[12px] font-bold ${idBad ? 'text-red-500' : 'text-ink-faint'}`}>
                {l({ ko: '영문 소문자·숫자·밑줄(_) 4~20자', en: '4–20 lowercase letters, numbers, _', ja: '英小文字・数字・_ 4〜20文字' })}
              </p>
            )}

            <label htmlFor={`${uid}-pw`} className="mt-4 block text-[14px] font-extrabold">{l({ ko: '비밀번호', en: 'Password', ja: 'パスワード' })}</label>
            <input id={`${uid}-pw`} type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className={field} />

            {mode === 'signup' && (
              <>
                <label htmlFor={`${uid}-pw2`} className="mt-4 block text-[14px] font-extrabold">{l({ ko: '비밀번호 확인', en: 'Confirm password', ja: 'パスワード確認' })}</label>
                <input id={`${uid}-pw2`} type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" className={field} />
                <p className="mt-2 break-keep text-[12px] font-bold leading-relaxed text-ink-faint">
                  {l({ ko: '이메일을 받지 않아서 비밀번호를 잊으면 찾을 수 없어요. 꼭 기억해 두세요.', en: "We don't collect an email, so a forgotten password can't be recovered.", ja: 'メールを受け取らないため、パスワードを忘れると復旧できません。' })}
                </p>
              </>
            )}

            {err && <p role="alert" className="mt-3 break-keep text-[13px] font-bold text-red-500">{err}</p>}
            {/* Enter로 제출되게 — 공용 Button은 type="button"이라 숨은 submit을 둔다 */}
            <button type="submit" hidden aria-hidden tabIndex={-1} />
            <Button full className="mt-5" busy={busy} error={!!err} onClick={() => void submit()}>
              {mode === 'login' ? l({ ko: '로그인', en: 'Log in', ja: 'ログイン' }) : l({ ko: '가입하고 시작하기', en: 'Sign up', ja: '登録してはじめる' })}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}
