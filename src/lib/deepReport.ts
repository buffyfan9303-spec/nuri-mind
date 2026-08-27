/**
 * AI 종합 심층 리포트 — 전 검사를 가로질러 "한 사람"으로 통합한 프리미엄 리포트.
 *
 * 개별 검사 리포트(AiReport)와의 차이: 검사 하나가 아니라 완료한 모든 검사를 교차 종합한다.
 * 서버 엣지(deep-report)가 Claude를 호출하고, 키는 엣지에만 있다.
 * 엣지 미배포·키 없음·실패 시 null → 호출부가 정적 폴백(페르소나 조합)으로 동작.
 *
 * 비용 가드: 비프리미엄은 이 함수를 호출하지 않는다(정적 티저만 노출).
 */
import { FUNCTIONS_URL, ANON_KEY } from './supabase'
import { PERSONAS } from '../i18n/animalTranslations'
import type { Lang, TestResult } from '../data/types'

export interface DeepSection {
  key: string
  title: string
  body: string
}

export interface DeepReport {
  sections: DeepSection[]
  at: number
}

/** 섹션 키 → 아이콘(엣지의 SECTION_KEYS와 1:1) */
export const SECTION_EMOJI: Record<string, string> = {
  core: '🧭',
  strengths: '💪',
  shadow: '🌑',
  relations: '💞',
  work: '🎯',
  stress: '🌊',
  cognition: '🧠',
  roadmap: '🌱',
}

/** 인지 지수 필드 — 정밀검사 완료 시에만 리포트에 포함 */
const COG_FIELDS: { k: keyof TestResult; label: string }[] = [
  { k: 'iq', label: 'IQ' },
  { k: 'mq', label: 'memory' },
  { k: 'fq', label: 'focus' },
  { k: 'sq', label: 'speed' },
  { k: 'xq', label: 'spatial' },
  { k: 'wq', label: 'switching' },
]

/**
 * 검사 결과 → 엣지 페이로드로 집계.
 * 같은 검사를 여러 번 했으면 최신 1개만(중복 해석 방지).
 */
export function buildPayload(
  results: TestResult[],
  testName: (id: string) => string,
  lang: Lang,
  nickname: string,
) {
  const latest = new Map<string, TestResult>()
  for (const r of [...results].sort((a, b) => b.at - a.at)) {
    if (!latest.has(r.testId)) latest.set(r.testId, r)
  }
  const rows = [...latest.values()]

  const tests = rows.map((r) => {
    const p = PERSONAS[r.persona]
    const pick = (arr: { ko: string; en: string; ja: string }[] | undefined) =>
      (arr ?? []).slice(0, 2).map((x) => x[lang] ?? x.ko)
    return {
      name: testName(r.testId),
      band: r.band,
      topPercent: r.percentile,
      persona: p ? (p.name[lang] ?? p.name.ko) : r.persona,
      strengths: pick(p?.strengths),
      risks: pick(p?.risks),
      ...(r.axes ? { axes: r.axes } : {}),
    }
  })

  // 인지 지수는 결과 어디에든 있으면 모아서 1개 객체로
  const cognition: Record<string, number> = {}
  for (const r of rows) {
    for (const f of COG_FIELDS) {
      const v = r[f.k]
      if (typeof v === 'number') cognition[f.label] = v
    }
  }

  return { tests, cognition, lang, nickname: nickname.slice(0, 20) }
}

/** 심층 리포트 생성 요청. 실패 시 null(호출부가 정적 폴백). */
export async function fetchDeepReport(payload: ReturnType<typeof buildPayload>): Promise<DeepReport | null> {
  if (!FUNCTIONS_URL) return null
  try {
    const r = await fetch(`${FUNCTIONS_URL}/deep-report`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY },
      body: JSON.stringify(payload),
    })
    if (!r.ok) return null
    const data = (await r.json()) as { sections?: DeepSection[]; at?: number }
    const sections = (data.sections ?? []).filter((s) => s && typeof s.body === 'string' && s.body.trim())
    if (sections.length < 3) return null
    return { sections, at: data.at ?? Date.now() }
  } catch {
    return null
  }
}
