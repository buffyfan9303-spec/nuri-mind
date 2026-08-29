import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useStore } from '../store/useStore'
import ko from './dict.ko'
import { dictFor, dictVersion, format, loadDict, subscribeDict } from './translations'
import type { L } from '../data/types'

/**
 * UI 문자열 번역 훅 — t('key') 또는 t('key', {p: 30})
 *
 * ⚠️ en/ja 사전은 별도 청크라 처음엔 없을 수 있다(i18n/translations.ts 참고).
 *    그동안은 ko로 폴백해 즉시 렌더하고, 사전이 도착하면 dictVersion이 바뀌어 다시 그린다.
 *    이 구독이 없으면 언어를 바꿔도 화면이 한국어에 머문다.
 */
export function useT() {
  const lang = useStore((s) => s.lang)
  const version = useSyncExternalStore(subscribeDict, dictVersion, dictVersion)

  // 사전 요청은 여기서 건다 — 언어를 쓰는 화면이 뜨는 순간이 곧 필요한 시점이다.
  // loadDict는 이미 받은 언어면 즉시 반환하므로 여러 컴포넌트가 불러도 요청은 1회다.
  useEffect(() => {
    void loadDict(lang)
  }, [lang])

  return useMemo(() => {
    const dict = dictFor(lang)
    return (key: string, vars?: Record<string, string | number>) => {
      const s = dict[key] ?? ko[key] ?? key
      return vars ? format(s, vars) : s
    }
    // version은 '사전이 도착했다'는 신호 — 값 자체는 쓰지 않지만 재계산의 트리거다
  }, [lang, version])
}

/**
 * 데이터 객체 내장 번역(L) 해석 훅.
 * L은 소스에 인라인된 { ko, en, ja } 객체라 사전 분리와 무관하다 — 로딩이 필요 없다.
 */
export function useL() {
  const lang = useStore((s) => s.lang)
  return useMemo(() => (l: L | string | undefined) => (typeof l === 'string' ? l : l ? l[lang] : ''), [lang])
}
