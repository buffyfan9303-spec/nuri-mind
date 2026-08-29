import type { Lang } from '../data/types'
import ko from './dict.ko'

/**
 * UI 딕셔너리 레지스트리 — 언어별 분리 로딩.
 *
 * 왜 나눴나: 세 언어를 한 파일에 두니 124KB였고, 한국어 사용자가 쓰지도 않는 en/ja를
 * 함께 받고 있었다. ko만 메인 번들에 두고 나머지는 고른 사람만 받게 한다.
 *
 * 동기 API(t('key'))를 깨지 않기 위해: 아직 안 받은 언어는 ko로 폴백해 즉시 렌더하고,
 * 사전이 도착하면 구독자에게 알려 다시 그린다. 비한국어 사용자는 첫 프레임에 한국어가
 * 잠깐 보일 수 있는데, 그 대가로 대다수인 한국어 사용자가 80KB를 아낀다.
 */
const LOADED: Partial<Record<Lang, Record<string, string>>> = { ko }

let version = 0
const listeners = new Set<() => void>()

/** 사전이 새로 도착했을 때 다시 그리기 위한 구독(useSyncExternalStore용) */
export function subscribeDict(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
export function dictVersion(): number {
  return version
}

/** 해당 언어 사전. 아직 안 왔으면 ko(항상 존재)로 폴백한다. */
export function dictFor(lang: Lang): Record<string, string> {
  return LOADED[lang] ?? ko
}

/** 언어 사전을 필요할 때 한 번만 받아온다. 실패해도 ko 폴백이라 화면은 깨지지 않는다. */
export async function loadDict(lang: Lang): Promise<void> {
  if (LOADED[lang]) return
  try {
    const m = lang === 'en' ? await import('./dict.en') : lang === 'ja' ? await import('./dict.ja') : null
    if (!m) return
    LOADED[lang] = m.default
    version++
    listeners.forEach((f) => f())
  } catch {
    /* 청크 로드 실패 — ko로 계속 동작 */
  }
}

/** 빈도 척도 (ADHD, 0~4) */
export const LIKERT_FREQ: Record<Lang, string[]> = {
  ko: ['전혀 없다', '거의 없다', '가끔 있다', '자주 있다', '매우 자주 있다'],
  en: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
  ja: ['全くない', 'ほとんどない', '時々ある', 'よくある', '非常に多い'],
}

/** 동의 척도 (EGO, 1~5) */
export const LIKERT_AGREE: Record<Lang, string[]> = {
  ko: ['전혀 아니다', '아닌 편이다', '보통이다', '그런 편이다', '매우 그렇다'],
  en: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  ja: ['全くそう思わない', 'そう思わない', 'どちらとも言えない', 'そう思う', '強くそう思う'],
}

export function format(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}
