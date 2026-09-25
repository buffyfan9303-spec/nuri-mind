import { test, expect } from '@playwright/test'
import { round1, topPercentOf } from '../src/lib/format'

/** 화면 숫자 규칙 — 소수 첫째 자리 반올림, '상위 %'는 0.5 하한 */
test('상위 %: 부동소수점 오차 없이 소수 한 자리', () => {
  expect(topPercentOf(83.7)).toBe(16.3) // 100 − 83.7 = 16.299999999999997
  expect(topPercentOf(12.04)).toBe(88)
  expect(topPercentOf(42.35)).toBe(57.7) // 57.65 → 반올림
  expect(topPercentOf(99.5)).toBe(0.5)
  expect(topPercentOf(100)).toBe(0.5) // '상위 0%'는 없다
})

test('round1: 반올림·반내림', () => {
  expect(round1(105.63)).toBe(105.6)
  expect(round1(100.45)).toBe(100.5)
  expect(round1(12)).toBe(12)
})
