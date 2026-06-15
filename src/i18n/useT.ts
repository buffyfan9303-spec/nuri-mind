import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { DICT, format } from './translations'
import type { L } from '../data/types'

/** UI 문자열 번역 훅 — t('key') 또는 t('key', {p: 30}) */
export function useT() {
  const lang = useStore((s) => s.lang)
  return useMemo(
    () =>
      (key: string, vars?: Record<string, string | number>) => {
        const s = DICT[lang][key] ?? DICT.ko[key] ?? key
        return vars ? format(s, vars) : s
      },
    [lang],
  )
}

/** 데이터 객체 내장 번역(L) 해석 훅 */
export function useL() {
  const lang = useStore((s) => s.lang)
  return useMemo(() => (l: L | string | undefined) => (typeof l === 'string' ? l : l ? l[lang] : ''), [lang])
}
