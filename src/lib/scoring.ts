import type { LikertItem, IqItem, SubscaleScore, TestResult, TestId } from '../data/types'
import { uid } from './random'

/* ───────────────────────── 통계 엔진 (백서 §2) ─────────────────────────
 * ① 정규 분포 누적 알고리즘 (Normal CDF) — 원점수를 인류 전체 좌표(백분위)로 변환
 * ② 라플라스 베이즈 평활화 — 분자 +0.6 / 분모 +1.2 로 0%·100% 과적합 차단
 * 보정 상수(μ, σ)는 ASRS·LSRP·ICAR 공개 규준 연구의 성인 표본 분포를 근사한 추정치.
 * ──────────────────────────────────────────────────────────────────── */

/** 오차함수 근사 (Abramowitz & Stegun 7.1.26, 최대 오차 1.5e-7) */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const t = 1 / (1 + p * x)
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return sign * y
}

/** 표준정규 누적분포함수 Φ(z) */
export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2))
}

/** 원점수 → 백분위 (0.5~99.5로 클램프해 극단값 과신 방지) */
export function percentile(raw: number, mu: number, sigma: number): number {
  const p = normalCdf((raw - mu) / sigma) * 100
  return Math.min(99.5, Math.max(0.5, Math.round(p * 10) / 10))
}

/** 라플라스 베이즈 평활화 — (x + 0.6) / (n + 1.2) */
export function laplace(score: number, max: number): number {
  return (score + 0.6) / (max + 1.2)
}

/* ───────────────────────── ADHD (ASRS v1.1 기반) ───────────────────── */
/** 20문항 × 0~4점. 규준 근사: μ=33, σ=12.5 (ASRS 성인 표본 환산) */
const ADHD_MU = 33
const ADHD_SIGMA = 12.5

export function scoreAdhd(items: LikertItem[], answers: Record<string, number>): TestResult {
  let raw = 0
  let screener = 0
  const subAcc: Record<string, { s: number; m: number }> = {}

  for (const it of items) {
    const v = answers[it.id] ?? 0
    raw += v
    if (it.core && it.coreThreshold !== undefined && v >= it.coreThreshold) screener++
    const acc = (subAcc[it.sub] ??= { s: 0, m: 0 })
    acc.s += v
    acc.m += 4
  }

  const pct = percentile(raw, ADHD_MU, ADHD_SIGMA)
  // ASRS Part A 양성 기준: 핵심 6문항 중 4개 이상 음영 구간
  const band =
    screener >= 4 ? 'high' : screener === 3 || pct >= 80 ? 'caution' : pct >= 55 ? 'mild' : 'low'
  const persona = band === 'high' || band === 'caution' ? 'meerkat' : 'collie'

  const subscales: SubscaleScore[] = Object.entries(subAcc).map(([key, { s, m }]) => ({
    key,
    score: s,
    max: m,
    ratio: laplace(s, m),
  }))

  return base('adhd', raw, pct, band, persona, subscales, { screener })
}

/* ───────────────────────── EGO (LSRP + SVO 기반) ───────────────────── */
/** 1~5점 동의 척도. SELF+STR 10문항: μ=26, σ=6.5 / EMP 5문항: μ=18, σ=3.4 / STR 5문항: μ=13, σ=3.8.
 *  근거: LSRP 1차/2차 사이코패시(Levenson, Kiehl & Fitzpatrick 1995) + SVO(사회적 가치지향) 일반표본 근사. */
export function scoreEgo(items: LikertItem[], answers: Record<string, number>): TestResult {
  const ax: Record<string, { s: number; m: number; n: number }> = {}
  for (const it of items) {
    const v = answers[it.id] ?? 3
    const acc = (ax[it.sub] ??= { s: 0, m: 0, n: 0 })
    acc.s += v
    acc.m += 5
    acc.n++
  }
  const SELF = ax.SELF?.s ?? 0
  const STR = ax.STR?.s ?? 0
  const EMP = ax.EMP?.s ?? 0
  const AVD = ax.AVD?.s ?? 0
  const VAL = ax.VAL?.s ?? 0

  const selfPct = percentile(SELF + STR, 26, 6.5)
  const altPct = percentile(EMP, 18, 3.4)
  const strPct = percentile(STR, 13, 3.8)
  const avdRatio = laplace(AVD - (ax.AVD?.n ?? 0), (ax.AVD?.n ?? 0) * 4)
  const maskFlag = VAL >= 8 // 타당도 2문항 합 8 이상 → 위장 응답 의심

  let persona: string
  if (altPct >= selfPct) {
    persona = avdRatio >= 0.55 ? 'deer' : 'sheep'
  } else {
    persona = strPct >= 55 ? 'tiger' : 'wolf'
  }

  const band =
    altPct >= 70 && avdRatio < 0.5
      ? 'trueAltruist'
      : altPct >= 60
        ? 'dutiful'
        : selfPct >= 75
          ? 'strategist'
          : selfPct >= 55
            ? 'selfFirst'
            : 'balanced'

  const subscales: SubscaleScore[] = ['SELF', 'STR', 'EMP', 'AVD'].map((key) => {
    const a = ax[key] ?? { s: 0, m: 1, n: 0 }
    return { key, score: a.s, max: a.m, ratio: laplace(a.s - a.n, a.m - a.n) }
  })

  const raw = SELF + STR
  return base('ego', raw, selfPct, band, persona, subscales, {
    maskFlag,
    axes: { alt: altPct, self: selfPct, str: strPct, avd: Math.round(avdRatio * 100) },
  })
}

/* ───────────────────────── IQ (ICAR 기반 유동 지능) ────────────────── */
/** 난이도 가중 점수. μ=14.75, σ=5.2 → IQ = 100 + 15z.
 *  근거: ICAR(Condon & Revelle 2014) 공개 문항. ICAR16↔WAIS 상관 r≈.81 — 정식 지능검사 추정 지표(대체 아님). */
const IQ_MU = 14.75
const IQ_SIGMA = 5.2
/** 정밀판 20문항 전체 난이도합 — 빠른판(부분 문항)을 동일 척도로 환산하는 기준 */
const IQ_FULL_DIFF = 29.5

export function scoreIq(items: IqItem[], answers: Record<string, string | null>): TestResult {
  let weighted = 0
  const kindAcc: Record<string, { s: number; m: number }> = {}
  for (const it of items) {
    const correct = answers[it.id] === it.answer
    if (correct) weighted += it.difficulty
    const k = it.kind === 'letter' ? 'series' : it.kind
    const acc = (kindAcc[k] ??= { s: 0, m: 0 })
    acc.s += correct ? 1 : 0
    acc.m += 1
  }
  // 빠른판(부분 문항)도 정밀판과 동일 척도로 — 응답한 문항 난이도합 기준으로 전체 환산
  const totalDiff = items.reduce((a, it) => a + it.difficulty, 0)
  const weightedScaled = totalDiff > 0 ? weighted * (IQ_FULL_DIFF / totalDiff) : weighted
  const z = (weightedScaled - IQ_MU) / IQ_SIGMA
  const iq = Math.max(60, Math.min(145, Math.round(100 + 15 * z)))
  const pct = Math.min(99.5, Math.max(0.5, Math.round(normalCdf(z) * 1000) / 10))
  const band = iq >= 130 ? 'top' : iq >= 115 ? 'high' : iq >= 105 ? 'upper' : iq >= 95 ? 'avg' : 'grow'
  const persona = iq >= 115 ? 'owl' : 'tit'

  const subscales: SubscaleScore[] = Object.entries(kindAcc).map(([key, { s, m }]) => ({
    key,
    score: s,
    max: m,
    ratio: laplace(s, m), // 소형 척도 과적합 방지 — 백서 §2-②
  }))

  return base('iq', weighted, pct, band, persona, subscales, { iq })
}

/* ───────────────────── LOVE (ECR-R + Bartholomew 4범주) ───────────────── */
/** 1~5 동의. ECR-R(Fraley 2000) 실규준 정렬: ANX 9문항 μ=23.5 σ=8.0 / AVO 9문항(역2) μ=21.5 σ=8.0.
 *  (이전 μ26/24·σ6.5는 협소 σ로 중간점수가 극단 백분위로 튀어, 원규준 문항평균 2.6/2.4·넓은 σ로 보정) */
export function scoreLove(items: LikertItem[], answers: Record<string, number>): TestResult {
  const ax: Record<string, { s: number; m: number; n: number }> = {}
  for (const it of items) {
    let v = answers[it.id] ?? 3
    if (it.reverse) v = 6 - v
    const acc = (ax[it.sub] ??= { s: 0, m: 0, n: 0 })
    acc.s += v
    acc.m += 5
    acc.n++
  }
  const ANX = ax.ANX?.s ?? 0
  const AVO = ax.AVO?.s ?? 0
  const VAL = ax.VAL?.s ?? 0

  const anxPct = percentile(ANX, 23.5, 8.0)
  const avoPct = percentile(AVO, 21.5, 8.0)
  const security = Math.round((100 - (anxPct + avoPct) / 2) * 10) / 10
  const maskFlag = VAL >= 8

  const band =
    anxPct < 50 && avoPct < 50 ? 'secure' : anxPct >= 50 && avoPct < 50 ? 'anxious' : avoPct >= 50 && anxPct < 50 ? 'avoidant' : 'fearful'
  const persona = { secure: 'penguin', anxious: 'koala', avoidant: 'cat', fearful: 'hedgehog' }[band]!

  const subscales: SubscaleScore[] = ['ANX', 'AVO'].map((key) => {
    const a = ax[key] ?? { s: 0, m: 1, n: 0 }
    return { key, score: a.s, max: a.m, ratio: laplace(a.s - a.n, a.m - a.n) }
  })

  return base('love', ANX + AVO, Math.min(99.5, Math.max(0.5, security)), band, persona, subscales, {
    maskFlag,
    axes: { anx: anxPct, avo: avoPct, sec: security },
  })
}

/* ───────────────── BURNOUT (Maslach 3요인 구조) ──────────────── */
/** 0~4 빈도. 소진지수 = EX + CY + (20 − EF). μ=32, σ=12.5 */
export function scoreBurnout(items: LikertItem[], answers: Record<string, number>): TestResult {
  const ax: Record<string, { s: number; m: number }> = {}
  for (const it of items) {
    const v = answers[it.id] ?? 0
    const acc = (ax[it.sub] ??= { s: 0, m: 0 })
    acc.s += v
    acc.m += 4
  }
  const EX = ax.EX?.s ?? 0
  const CY = ax.CY?.s ?? 0
  const EF = ax.EF?.s ?? 0 // 효능감 (높을수록 건강)
  const raw = EX + CY + ((ax.EF?.m ?? 20) - EF)

  const pct = percentile(raw, 32, 12.5)
  const band = pct >= 85 ? 'high' : pct >= 65 ? 'caution' : pct >= 40 ? 'mild' : 'low'
  const persona = band === 'high' ? 'sloth' : band === 'caution' ? 'camel' : 'dolphin'

  const subscales: SubscaleScore[] = ['EX', 'CY', 'EF'].map((key) => {
    const a = ax[key] ?? { s: 0, m: 1 }
    return { key, score: a.s, max: a.m, ratio: laplace(a.s, a.m) }
  })

  return base('burnout', raw, pct, band, persona, subscales, {})
}

/* ──────────── DOPAMINE (SAS-SV + 행동중독 4요소) ──────────── */
/** 0~4 빈도, 4요소 각 5문항. μ=30, σ=13 → "뇌 절임 백분위" */
export function scoreDopamine(items: LikertItem[], answers: Record<string, number>): TestResult {
  const ax: Record<string, { s: number; m: number }> = {}
  let raw = 0
  for (const it of items) {
    const v = answers[it.id] ?? 0
    raw += v
    const acc = (ax[it.sub] ??= { s: 0, m: 0 })
    acc.s += v
    acc.m += 4
  }
  const pct = percentile(raw, 30, 13)
  const band = pct >= 85 ? 'high' : pct >= 60 ? 'caution' : pct >= 35 ? 'mild' : 'low'
  const persona = band === 'high' ? 'raccoon' : band === 'caution' ? 'hamster' : 'bear'

  const subscales: SubscaleScore[] = Object.entries(ax).map(([key, { s, m }]) => ({
    key,
    score: s,
    max: m,
    ratio: laplace(s, m),
  }))

  return base('dopamine', raw, pct, band, persona, subscales, {})
}

/* ──────────── RESILIENCE (CD-RISC + BRS, 긍정 진술) ──────────── */
/** 1~5 동의, 전 문항 긍정. raw 20~100. μ=66 σ=13 → 높을수록 탄탄.
 *  근거: CD-RISC(Connor & Davidson 2003) 일반인구 규준 M≈80.4·SD≈12.8(원 0~100척도)을 본 척도 범위로 환산. */
export function scoreResilience(items: LikertItem[], answers: Record<string, number>): TestResult {
  const ax: Record<string, { s: number; m: number; n: number }> = {}
  let raw = 0
  for (const it of items) {
    const v = answers[it.id] ?? 3
    raw += v
    const acc = (ax[it.sub] ??= { s: 0, m: 0, n: 0 })
    acc.s += v
    acc.m += 5
    acc.n++
  }
  const pct = percentile(raw, 66, 13)
  const band = pct >= 70 ? 'high' : pct >= 40 ? 'mid' : 'low'
  const persona = band === 'high' ? 'bamboo' : band === 'mid' ? 'willow' : 'glass'
  const subscales: SubscaleScore[] = ['BO', 'CTL', 'AD', 'SU'].map((key) => {
    const a = ax[key] ?? { s: 0, m: 1, n: 0 }
    return { key, score: a.s, max: a.m, ratio: laplace(a.s - a.n, a.m - a.n) }
  })
  return base('resilience', raw, pct, band, persona, subscales, {})
}

/* ──────────── DARK TRIAD (SD3 3요인) ──────────── */
/** 1~5 동의. MA/NA 7문항, PS 5문항, VAL 1. 종합 백분위 = 3축 평균.
 *  SD3(Jones&Paulhus 2014) 실규준: 사이코패시(PS) 평균이 MA/NA보다 낮음 → PS μ=10.5 σ=3.0(문항평균 ~2.1)으로 정렬 */
export function scoreDark(items: LikertItem[], answers: Record<string, number>): TestResult {
  const ax: Record<string, { s: number; n: number }> = {}
  for (const it of items) {
    const v = answers[it.id] ?? 3
    const acc = (ax[it.sub] ??= { s: 0, n: 0 })
    acc.s += v
    acc.n++
  }
  const MA = ax.MA?.s ?? 0
  const NA = ax.NA?.s ?? 0
  const PS = ax.PS?.s ?? 0
  const VAL = ax.VAL?.s ?? 0

  const maPct = percentile(MA, 21, 5.5)
  const naPct = percentile(NA, 21, 5.5)
  const psPct = percentile(PS, 10.5, 3.0)
  const overall = Math.round(((maPct + naPct + psPct) / 3) * 10) / 10
  const maskFlag = VAL >= 4

  const dom = maPct >= naPct && maPct >= psPct ? 'MA' : naPct >= psPct ? 'NA' : 'PS'
  const band = overall >= 70 ? 'high' : overall >= 45 ? 'mid' : 'low'
  const persona =
    band === 'low' ? 'dove' : dom === 'MA' ? 'fox' : dom === 'NA' ? 'peacock' : 'shark'

  const subscales: SubscaleScore[] = ['MA', 'NA', 'PS'].map((key) => {
    const a = ax[key] ?? { s: 0, n: 1 }
    return { key, score: a.s, max: a.n * 5, ratio: laplace(a.s - a.n, a.n * 5 - a.n) }
  })

  return base('dark', MA + NA + PS, overall, band, persona, subscales, {
    maskFlag,
    axes: { ma: maPct, na: naPct, ps: psPct },
  })
}

/* ──────────── MEMORY (작업기억 — 숫자 폭/역폭 실측 과제) ────────────
 * 정밀검사 2호. 자기보고가 아닌 실제 인지과제(Digit Span, Wechsler WMS 계열).
 * 정방향 폭 = 즉시 기억 용량, 역방향 폭 = 작업기억(조작) 부하.
 * 합성점수 = 정방향 정답수 + 역방향 정답수×1.3(난이도 가중) → MQ=100+15z. */
export interface SpanTrial {
  len: number
  correct: boolean
}
const MEM_MU = 7.6
const MEM_SIGMA = 2.8

export function scoreMemory(fwd: SpanTrial[], bwd: SpanTrial[]): TestResult {
  const fwdCorrect = fwd.filter((t) => t.correct).length
  const bwdCorrect = bwd.filter((t) => t.correct).length
  const spanOf = (arr: SpanTrial[]) => arr.filter((t) => t.correct).reduce((m, t) => Math.max(m, t.len), 0)
  const fwdSpan = spanOf(fwd)
  const bwdSpan = spanOf(bwd)

  const composite = fwdCorrect + bwdCorrect * 1.3
  const z = (composite - MEM_MU) / MEM_SIGMA
  const mq = Math.max(60, Math.min(145, Math.round(100 + 15 * z)))
  const pct = Math.min(99.5, Math.max(0.5, Math.round(normalCdf(z) * 1000) / 10))

  const band = mq >= 116 ? 'sharp' : mq >= 96 ? 'solid' : 'quick'
  const persona = band === 'sharp' ? 'elephant' : band === 'solid' ? 'octopus' : 'goldfish'

  const subscales: SubscaleScore[] = [
    { key: 'fwd', score: fwdCorrect, max: fwd.length, ratio: laplace(fwdCorrect, fwd.length) },
    { key: 'bwd', score: bwdCorrect, max: bwd.length, ratio: laplace(bwdCorrect, bwd.length) },
  ]

  return base('memory', fwdCorrect + bwdCorrect, pct, band, persona, subscales, {
    mq,
    axes: { fwd: fwdSpan, bwd: bwdSpan },
  })
}

function base(
  testId: TestId,
  raw: number,
  pct: number,
  band: string,
  persona: string,
  subscales: SubscaleScore[],
  extra: Partial<TestResult>,
): TestResult {
  return {
    id: uid('r_'),
    testId,
    at: Date.now(),
    raw,
    percentile: pct,
    band,
    persona,
    subscales,
    durationMs: 0,
    ...extra,
  }
}
