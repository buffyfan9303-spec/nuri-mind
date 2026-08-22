import type { SubscaleScore, TestResult } from '../data/types'
import type { MbtiItem } from '../data/mbti'
import { laplace } from './scoring'
import { uid } from './random'

/* ───────────── 성향 나침반(MBTI 스타일) 채점 — scoring.ts와 분리된 확장 모듈 ─────────────
 * 축별 6문항 × 양극 5점(1=왼쪽 극, 5=오른쪽 극). reverse 문항은 6-x로 변환해
 * 항상 E/N/T/P 방향 raw(6~30) → pct(0~100)로 환산. 유형 코드는 보조 요약
 * (연속 점수가 주 결과 — 이분 절단의 재검사 불안정성 회피, Pittenger 2005).
 * percentile 필드엔 '선호 명료도'(축별 |pct-50| 평균×2, 0~100)를 담는다. */
export function scoreMbti(items: MbtiItem[], answers: Record<string, number>): TestResult {
  const acc: Record<string, number> = { EI: 0, SN: 0, TF: 0, JP: 0 }
  const cnt: Record<string, number> = { EI: 0, SN: 0, TF: 0, JP: 0 }
  for (const it of items) {
    const v = answers[it.id] ?? 3
    acc[it.axis] += it.reverse ? 6 - v : v
    cnt[it.axis]++
  }
  const pct = (axis: string) => {
    const n = cnt[axis] || 1
    return Math.round(((acc[axis] - n) / (n * 4)) * 100)
  }
  const axes = { EI: pct('EI'), SN: pct('SN'), TF: pct('TF'), JP: pct('JP') }
  // pct=50(경계)은 MBTI 관례에 따라 I/N/F/P 부여 — UI에서 '경계' 표시
  const code =
    (axes.EI > 50 ? 'E' : 'I') + (axes.SN >= 50 ? 'N' : 'S') + (axes.TF > 50 ? 'T' : 'F') + (axes.JP >= 50 ? 'P' : 'J')
  const clarity = Math.round(
    ((Math.abs(axes.EI - 50) + Math.abs(axes.SN - 50) + Math.abs(axes.TF - 50) + Math.abs(axes.JP - 50)) / 4) * 2,
  )
  // Keirsey 4기질 매핑 (mbti.ts temperamentOf와 동일 규칙 — 순환 의존 없이 인라인)
  const persona = code.includes('N') ? (code.includes('T') ? 'mbtiNT' : 'mbtiNF') : code.includes('J') ? 'mbtiSJ' : 'mbtiSP'
  const subscales: SubscaleScore[] = (['EI', 'SN', 'TF', 'JP'] as const).map((key) => ({
    key,
    score: acc[key],
    max: cnt[key] * 5,
    ratio: laplace(acc[key] - cnt[key], cnt[key] * 4),
  }))
  return {
    id: uid('r_'),
    testId: 'mbti',
    at: Date.now(),
    raw: acc.EI + acc.SN + acc.TF + acc.JP,
    percentile: clarity,
    band: code,
    persona,
    axes,
    subscales,
    durationMs: 0,
  }
}
