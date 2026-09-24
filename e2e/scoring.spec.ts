import { test, expect } from '@playwright/test'
import { scorePerfection, scoreIq } from '../src/lib/scoring'
import { PERFECTION_ITEMS } from '../src/data/perfection'
import { IQ_ITEMS } from '../src/data/iq'

/**
 * 채점 도달성 — 브라우저 없이 채점 함수만 부른다(2026-09-25 심리측정 검토의 수용 기준).
 * 결과 구간이 '수학적으로 나올 수 없는' 상태로 다시 돌아가지 않게 막는다.
 */

/** 하위 척도별 합계가 원하는 값이 되도록 응답을 만든다(각 문항 1~5) */
function answersFor(sums: Record<string, number>): Record<string, number> {
  const bySub: Record<string, string[]> = {}
  for (const it of PERFECTION_ITEMS) (bySub[it.sub] ??= []).push(it.id)
  const out: Record<string, number> = {}
  for (const [sub, ids] of Object.entries(bySub)) {
    let left = sums[sub]
    ids.forEach((id, i) => {
      const remain = ids.length - i - 1
      const v = Math.max(1, Math.min(5, left - remain))
      out[id] = v
      left -= v
    })
  }
  return out
}

test('완벽주의: 기준 높고 부적응 낮으면 driven(건강한 높은 기준)', () => {
  // STD 25(최대), 부적응 45(문항 평균 3) → 총점 70(상위), 부적응 평균 3 < 기준 평균 5
  const r = scorePerfection(PERFECTION_ITEMS, answersFor({ STD: 25, CM: 15, DA: 15, SOC: 15 }))
  expect(r.band).toBe('driven')
})

test('완벽주의: 부적응 평균이 기준 평균 이상이면 strain', () => {
  // STD 20(평균 4), 부적응 60(평균 4) → 같으면 주의 쪽
  const r = scorePerfection(PERFECTION_ITEMS, answersFor({ STD: 20, CM: 20, DA: 20, SOC: 20 }))
  expect(r.band).toBe('strain')
})

test('IQ: 정밀판(전 문항)은 보정 전과 같은 척도', () => {
  const all = Object.fromEntries(IQ_ITEMS.map((it) => [it.id, it.answer]))
  const r = scoreIq(IQ_ITEMS, all)
  expect(r.iq).toBe(143) // 보정 전과 같다(r=1이면 σ 그대로)
})

test('IQ: 빠른판 만점은 정밀판 만점보다 덜 극단적', () => {
  const half = IQ_ITEMS.slice(0, 10)
  const r = scoreIq(half, Object.fromEntries(half.map((it) => [it.id, it.answer])))
  expect(r.iq).toBeLessThan(143)
  expect(r.iq).toBeGreaterThanOrEqual(130)
})
