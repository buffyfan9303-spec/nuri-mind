import { useEffect, useId, useState } from 'react'
import { SPRING } from '../lib/motion'
import { MotionConfig, motion } from 'framer-motion'
import Button from './Button'
import Avatar from './Avatar'
import { PERSONA_VISUAL } from '../i18n/personaVisual'
import type { Avatar as AvatarT } from '../data/types'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { Link } from 'react-router-dom'
import { celebrate } from '../lib/confetti'
import { sfx } from '../lib/sound'
import { LEGAL_EFFECTIVE } from '../data/legal'
import { authReady, signInWithKakao, getAuthUser, onAuthChange } from '../lib/auth'
import { logoutAccount } from '../lib/economy'
import { moderateText } from '../lib/moderation'
import { humanizeError } from '../lib/dbError'
import LegalSheet from './LegalSheet'
import BizInfo from './BizInfo'
import Emoji from './Emoji'
import AppleLoginButton from './AppleLoginButton'

/**
 * 온보딩 입력 초안 — 이 화면은 두 정상 동선에서 통째로 언마운트된다.
 *  · 약관 열람: /legal/*는 공개 라우트라 App의 온보딩 분기가 다른 트리로 교체된다
 *  · 카카오 가입(주 경로): OAuth 전체 페이지 리다이렉트 후 새 문서로 복귀
 * 둘 다 컴포넌트 state를 날려 닉네임·캐릭터·필수 동의 체크가 리셋되므로 밖에 보관한다.
 */
const DRAFT_KEY = 'nuri-mind-onboard-draft'
/** 초대 링크(?invite=CODE)의 코드 — 카카오 리다이렉트로 URL이 갈리므로 세션에 보관 */
const INVITE_KEY = 'nuri-mind-invite-code'
type Draft = { nick: string; picked: string | null; agreed: boolean }
const loadDraft = (): Draft => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (raw) return { nick: '', picked: null, agreed: false, ...(JSON.parse(raw) as Partial<Draft>) }
  } catch {
    /* 저장소 불가 — 빈 초안 */
  }
  return { nick: '', picked: null, agreed: false }
}

// 시작 캐릭터 후보(귀여운 페르소나) — 검사로 더 모을 수 있음
const STARTERS = ['penguin', 'koala', 'cat', 'dolphin', 'hamster', 'owl', 'meerkat', 'collie']

export default function Onboarding() {
  const lx = useL()
  const t = useT()
  const lang = useStore((s) => s.lang)
  const completeOnboarding = useStore((s) => s.completeOnboarding)
  const redeemCode = useStore((s) => s.redeemCode)
  const [draft0] = useState(loadDraft)
  const [nick, setNick] = useState(draft0.nick)
  const [picked, setPicked] = useState<string | null>(draft0.picked)
  const [agreed, setAgreed] = useState(draft0.agreed)
  const [kakaoNick, setKakaoNick] = useState<string | null>(null)
  const [nickErr, setNickErr] = useState('')
  // 약관은 시트로 — 라우트 이동은 이 화면을 언마운트해 입력을 통째로 날린다
  const [legal, setLegal] = useState<'terms' | 'privacy' | null>(null)
  // label↔input 연결 — 없으면 스크린리더가 입력칸을 이름 없이('편집 가능한 텍스트') 읽는다
  const nickId = useId()

  // 초대 코드 캡처 — URL에서 한 번 읽어 보관하고 주소창은 정리한다
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('invite')
    if (!code) return
    try {
      sessionStorage.setItem(INVITE_KEY, code.trim().toUpperCase().slice(0, 12))
    } catch {
      /* ignore */
    }
    const q = new URLSearchParams(window.location.search)
    q.delete('invite')
    window.history.replaceState({}, '', window.location.pathname + (q.toString() ? `?${q}` : ''))
  }, [])

  // 입력이 바뀔 때마다 초안 저장 — 약관 이동·카카오 리다이렉트를 건너 살아남는다
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ nick, picked, agreed }))
    } catch {
      /* 저장소 불가 — 초안 보존만 포기 */
    }
  }, [nick, picked, agreed])

  // 카카오 로그인 복귀 시(또는 APK 자동로그인) 닉네임 자동 프리필
  useEffect(() => {
    if (!authReady()) return
    const apply = () =>
      getAuthUser().then((u) => {
        if (u) {
          setKakaoNick(u.nickname || '친구')
          if (u.nickname) setNick((prev) => prev || u.nickname!)
        }
      })
    apply()
    return onAuthChange(apply)
  }, [])

  const [oauthErr, setOauthErr] = useState('')

  // OAuth 콜백 에러(동의 취소·프로바이더 설정 오류) 표시 — 무음 복귀 방지 + URL 잔존 파라미터 정리
  useEffect(() => {
    const q = new URLSearchParams(window.location.search.slice(1))
    const h = new URLSearchParams(window.location.hash.slice(1))
    const err = q.get('error_description') || h.get('error_description') || q.get('error') || h.get('error')
    if (err) {
      // 영어 원문('provider is not enabled')이 가입 첫 화면에 뜨면 신뢰가 깎인다 — 사람 말로 옮긴다
      setOauthErr(humanizeError(decodeURIComponent(err), lang))
      window.history.replaceState({}, '', window.location.pathname)
      setTimeout(() => setOauthErr(''), 6000)
    }
  }, [])

  const doKakao = async () => {
    sfx.tap()
    const r = await signInWithKakao()
    if (!r.ok) alert(t('auth.needSetup'))
  }

  const start = () => {
    if (!nick.trim() || !agreed) return
    // 닉네임도 커뮤니티 표시 문자열이다 — 전광판·댓글과 같은 필터를 통과해야 우회가 막힌다
    const mod = moderateText(nick)
    if (!mod.ok) {
      setNickErr(t('community.badword'))
      return
    }
    const avatar: AvatarT = picked ? { kind: 'animal', persona: picked } : null
    try {
      sessionStorage.removeItem(DRAFT_KEY)
    } catch {
      /* ignore */
    }
    completeOnboarding(nick, avatar)
    // 초대 링크(?invite=CODE)로 들어온 경우 가입 직후 자동 적용 — 코드를 외워 다시 칠 필요가 없다.
    // 카카오 리다이렉트를 건너오므로 URL이 아닌 sessionStorage에서 읽는다.
    try {
      const code = sessionStorage.getItem(INVITE_KEY)
      if (code) {
        redeemCode(code)
        sessionStorage.removeItem(INVITE_KEY)
      }
    } catch {
      /* ignore */
    }
    celebrate()
    sfx.coin()
  }

  return (
    // 온보딩은 App의 <MotionConfig reducedMotion="user"> **바깥**에서 렌더된다(가입 전 분기가 먼저 return) —
    // 여기서 직접 감싸지 않으면 '동작 줄이기'를 켠 사용자에게도 로고가 무한히 흔들린다(가입 첫 화면에서만).
    <MotionConfig reducedMotion="user">
    <div className="bg-dots min-h-dvh">
      <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-12">
        {/* 환영 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.ui} className="text-center">
          <motion.img src="/icon.svg" alt="" className="mx-auto h-20 w-20 rounded-3xl shadow-pop" animate={{ rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 3 }} />
          <h1 className="mt-5 break-keep text-[24px] font-extrabold leading-tight tracking-tight">{t('onboard.welcome')}</h1>
          <p className="mt-2.5 break-keep text-[14px] font-bold leading-relaxed text-ink-sub">{t('onboard.sub')}</p>
        </motion.div>

        {oauthErr && (
          <motion.p role="alert" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 break-keep rounded-2xl bg-red-50 px-4 py-2.5 text-center text-[12px] font-bold text-red-500">
            {/* '카카오로 3초 만에 시작 실패: …'는 버튼 문구에 '실패'를 붙인 꼴이라 어색했다 */}
            {lang === 'ko' ? '카카오 로그인 실패' : lang === 'ja' ? 'カカオログイン失敗' : 'Kakao sign-in failed'}: {oauthErr}
          </motion.p>
        )}

        {/* 카카오 간편가입 (주 경로) */}
        {authReady() && (
          <div className="mt-7">
            {kakaoNick ? (
              <div className="rounded-2xl bg-[#FEE500]/90 py-3.5 text-center text-[14px] font-extrabold text-[#3A1D1D]">
                <Emoji e="💬" inline />{t('onboard.kakaoReady', { nick: kakaoNick })}
                {/* 다른 계정으로 붙었을 때 빠져나갈 길 — 온보딩 게이트 탓에 Profile에 못 가므로 여기 필요 */}
                <button
                  onClick={async () => {
                    // ⚠️ signOut만 부르면 직전 계정의 지갑·검사기록이 게스트 프로필에 남는다 → 경계까지 한 쌍으로.
                    // 그리고 버튼 이름대로 곧장 카카오 로그인 화면(계정 선택)으로 보낸다 — 로그아웃만 하고 멈추면
                    // 다시 '카카오로 시작'을 눌러도 카카오 세션 때문에 같은 계정으로 돌아왔다.
                    await logoutAccount()
                    setKakaoNick(null)
                    setNick('')
                    const r = await signInWithKakao(true)
                    if (!r.ok) alert(t('auth.needSetup'))
                  }}
                  className="mt-1.5 block w-full text-[12px] font-bold text-[#3A1D1D]/60 underline"
                >
                  {t('onboard.otherAccount')}
                </button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={doKakao}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FEE500] py-4 text-[16px] font-extrabold text-[#3A1D1D] shadow-card"
              >
                {t('onboard.kakao')}
              </motion.button>
            )}
            {!kakaoNick && <AppleLoginButton className="mt-2.5" />}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="shrink-0 text-[12px] font-bold text-ink-faint">{t('onboard.or')}</span>
              <div className="h-px flex-1 bg-line" />
            </div>
          </div>
        )}

        {/* 닉네임 */}
        <div className={authReady() ? '' : 'mt-8'}>
          <label htmlFor={nickId} className="text-[14px] font-extrabold">
            {t('onboard.nickLabel')}
          </label>
          <input
            id={nickId}
            value={nick}
            onChange={(e) => {
              setNick(e.target.value)
              if (nickErr) setNickErr('')
            }}
            placeholder={t('onboard.nickPh')}
            maxLength={12}
            autoFocus
            className={`mt-2 w-full rounded-2xl border-2 bg-surface px-4 py-3.5 text-[16px] font-extrabold outline-none ${
              nickErr ? 'border-red-300 focus:border-red-400' : 'border-line focus:border-mind-400'
            }`}
          />
          {nickErr && (
            <p role="alert" className="mt-1.5 text-[12px] font-bold text-red-500">
              {nickErr}
            </p>
          )}
        </div>

        {/* 시작 캐릭터 */}
        <div className="mt-6">
          <p className="text-[14px] font-extrabold">{t('onboard.pickLabel')}</p>
          <div className="mt-2.5 grid grid-cols-4 gap-2.5">
            {STARTERS.map((key) => {
              const p = PERSONA_VISUAL[key]
              const sel = picked === key
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.97 }}
                  aria-pressed={sel}
                  onClick={() => {
                    setPicked(sel ? null : key)
                    sfx.tap()
                  }}
                  className="flex aspect-square items-center justify-center rounded-2xl border-2"
                  style={{ borderColor: sel ? '#4FA882' : 'rgb(var(--line))', background: sel ? '#4FA88216' : 'rgb(var(--surface))' }}
                >
                  {/* 글자가 없는 버튼 — 이모지가 곧 이름이라 대체 텍스트로 남긴다(버튼 이름 '🐧') */}
                  <Emoji e={p.emoji} size={32} label={p.emoji} />
                </motion.button>
              )
            })}
          </div>
          <p className="mt-2 text-[12px] font-bold text-ink-faint">{t('onboard.pickHint')}</p>
        </div>

        <div className="flex-1" />

        {/* 가입 선물 + 시작 */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-center gap-2 rounded-2xl bg-mind-50 py-2.5 text-[14px] font-extrabold text-mind-700">
            <Emoji e="🎁" inline />{t('onboard.bonus')}
          </div>
          {/* 필수 약관 동의 체크 (실서비스/스토어 심사 대비) */}
          <div className="mb-3 flex items-start gap-2.5 rounded-2xl border-2 border-line bg-surface px-3.5 py-3">
            <button
              type="button"
              onClick={() => {
                setAgreed((v) => !v)
                sfx.tap()
              }}
              // 동의 체크는 토글 버튼이 아니라 체크박스로 읽혀야 한다. 이름도 약관+개인정보 둘 다
              role="checkbox"
              aria-checked={agreed}
              aria-label={`${t('onboard.agreePre')}${t('onboard.terms')} · ${t('onboard.privacy')}${t('onboard.agreeSuf')} ${t('onboard.agreeReq')}`}
              // 보이는 칸은 22px — before로 사방 11px 넓혀 44px 히트영역(레이아웃은 그대로)
              className="relative mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md border-2 transition-colors before:absolute before:-inset-[11px] before:content-['']"
              style={{ borderColor: agreed ? '#4FA882' : 'rgb(var(--line))', background: agreed ? '#4FA882' : 'rgb(var(--surface))' }}
            >
              {agreed && <span className="text-[13px] font-bold leading-none text-white">✓</span>}
            </button>
            <p className="break-keep text-left text-[12px] font-bold leading-relaxed text-ink-sub">
              {t('onboard.agreePre')}
              <button type="button" onClick={() => setLegal('terms')} className="font-extrabold text-mind-700 underline underline-offset-2">
                {t('onboard.terms')}
              </button>
              <span className="mx-1 text-ink-faint">·</span>
              <button type="button" onClick={() => setLegal('privacy')} className="font-extrabold text-mind-700 underline underline-offset-2">
                {t('onboard.privacy')}
              </button>
              {t('onboard.agreeSuf')} <span className="font-extrabold text-mind-600">{t('onboard.agreeReq')}</span>
            </p>
          </div>
          <Button color="mind" size="lg" disabled={!nick.trim() || !agreed} onClick={start}>
            {t('onboard.start')}
          </Button>
          <p className="mt-2.5 px-2 text-center text-[11px] font-bold leading-relaxed text-ink-faint">
            {t('onboard.effective', { date: LEGAL_EFFECTIVE })} · {t('onboard.note')}
          </p>

          {/* 가입 없이 읽을 수 있는 공개 페이지 — 첫 화면이 가입 폼뿐이면 검색엔진·광고 심사가
              '콘텐츠 없는 사이트'로 본다. 진짜 <a href>라 크롤러가 따라간다(버튼은 못 따라간다). */}
          <nav aria-label={lx({ ko: '둘러보기', en: 'Browse', ja: '閲覧' })} className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] font-extrabold text-mind-700">
            <Link to="/about" className="py-1.5">{lx({ ko: '서비스 소개', en: 'About', ja: 'サービス紹介' })}</Link>
            <Link to="/magazine" className="py-1.5">{lx({ ko: '심리 매거진', en: 'Magazine', ja: 'マガジン' })}</Link>
            <Link to="/zodiac/rat" className="py-1.5">{lx({ ko: '띠별 오늘의 운세', en: 'Zodiac fortune', ja: '干支別運勢' })}</Link>
          </nav>

          {/* 사업자 정보 — 가입 전 첫 화면에서 확인 가능해야 함(카카오 비즈 심사·전자상거래 표시 의무) */}
          <div className="mt-4 border-t border-line pt-4 text-center">
            <BizInfo />
          </div>
        </div>
      </main>

      <LegalSheet doc={legal} onClose={() => setLegal(null)} />


      {/* 미리보기 아바타(우상단 작은 표시) */}
      {(picked || nick) && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="pointer-events-none fixed right-5 top-5 flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 shadow-card">
          <Avatar avatar={picked ? { kind: 'animal', persona: picked } : null} size={26} emojiScale={0.5} />
          <span className="max-w-[90px] truncate text-[13px] font-extrabold">{nick || '친구'}</span>
        </motion.div>
      )}
    </div>
    </MotionConfig>
  )
}
