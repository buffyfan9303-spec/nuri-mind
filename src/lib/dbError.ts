import type { Lang } from '../data/types'

/**
 * 서버 원문 에러 → 사람 말.
 *
 * 왜 필요한가: Supabase·OAuth가 돌려주는 문구는 영어 개발자 언어다.
 * "provider is not enabled", "new row violates row-level security policy", "Failed to fetch" —
 * 한국어 심리검사 앱의 가입 화면에 이런 문장이 뜨면 사용자는 자기 잘못인지 앱 고장인지도 모른다.
 * 표시 계층 한 곳에서 정규식 몇 개로 번역하는 게 가장 작은 수술이다.
 *
 * 원문을 완전히 버리지는 않는다 — 매칭이 안 되면 폴백 문구를 쓰되, 콘솔에는 원문이 남는다(호출부에서 로깅).
 * P0001(RAISE EXCEPTION)은 우리가 직접 쓴 한국어 메시지라 그대로 통과시킨다.
 */
const RULES: { re: RegExp; msg: Record<Lang, string> }[] = [
  {
    re: /failed to fetch|networkerror|network request|load failed|timeout|abort/i,
    msg: {
      ko: '네트워크가 불안정해요. 연결을 확인하고 다시 시도해 주세요.',
      en: 'The network looks unstable. Check your connection and try again.',
      ja: 'ネットワークが不安定です。接続を確認して再試行してください。',
    },
  },
  {
    re: /row-level security|permission denied|not authorized|42501|jwt|invalid token/i,
    msg: {
      ko: '권한이 없어요. 로그인 상태를 확인해 주세요.',
      en: 'You do not have permission. Check that you are signed in.',
      ja: '権限がありません。ログイン状態をご確認ください。',
    },
  },
  {
    re: /access_denied|user cancelled|cancell?ed|popup closed/i,
    msg: {
      ko: '로그인이 취소됐어요.',
      en: 'Sign-in was cancelled.',
      ja: 'ログインがキャンセルされました。',
    },
  },
  {
    re: /provider .*not enabled|unsupported provider|redirect|invalid.*url/i,
    msg: {
      ko: '카카오 로그인 설정을 확인 중이에요. 잠시 후 다시 시도해 주세요.',
      en: 'We are checking the Kakao sign-in setup. Please try again shortly.',
      ja: 'カカオログイン設定を確認中です。しばらくしてお試しください。',
    },
  },
  {
    re: /rate ?limit|too many requests|429/i,
    msg: {
      ko: '요청이 너무 빨라요. 잠시 뒤에 다시 시도해 주세요.',
      en: 'Too many requests. Please wait a moment and try again.',
      ja: 'リクエストが多すぎます。少し待って再試行してください。',
    },
  },
  {
    re: /duplicate key|already exists|23505/i,
    msg: {
      ko: '이미 처리된 요청이에요.',
      en: 'This was already processed.',
      ja: 'すでに処理済みです。',
    },
  },
]

const FALLBACK: Record<Lang, string> = {
  ko: '잠시 문제가 있었어요. 다시 시도해 주세요.',
  en: 'Something went wrong. Please try again.',
  ja: '問題が発生しました。もう一度お試しください。',
}

function textOf(err: unknown): string {
  if (typeof err === 'string') return err
  if (err && typeof err === 'object') {
    const e = err as { message?: unknown; error_description?: unknown; code?: unknown; details?: unknown }
    return [e.message, e.error_description, e.code, e.details].filter((v) => typeof v === 'string').join(' ')
  }
  return ''
}

/**
 * 서버 에러를 사용자에게 보여줄 한 문장으로. lang은 스토어의 현재 언어.
 *
 * ⚠️ '한글이면 우리 메시지'라는 판정은 쓰지 않는다.
 * OAuth 콜백 에러는 URL 쿼리(?error_description=…)에서 오고, 그 값은 링크를 만든 사람이 정한다.
 * 한글이라는 이유로 통과시키면 "고객센터 010-0000-0000으로 인증번호를 보내주세요" 같은 문장을
 * **우리 앱의 공식 에러 배너 안에** 띄워 줄 수 있다. 우리 것임이 증명된 경우(P0001 코드)만 원문을 쓴다.
 */
export function humanizeError(err: unknown, lang: Lang = 'ko', fallback?: string): string {
  const raw = textOf(err)
  const code = err && typeof err === 'object' ? (err as { code?: unknown }).code : undefined
  // P0001 = 우리가 DB 함수에서 직접 RAISE한 메시지 — 이미 사람 말이고, 출처가 우리다
  if (code === 'P0001' && /[가-힣]/.test(raw)) return raw.slice(0, 120)
  for (const r of RULES) if (r.re.test(raw)) return r.msg[lang]
  return fallback ?? FALLBACK[lang]
}
