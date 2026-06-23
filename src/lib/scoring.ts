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

/* ──────────── SELF-ESTEEM (Rosenberg RSES 10문항) ──────────── */
/** 1~5 동의, 10문항(부정 5 역채점). raw 10~50. μ=34 σ=6.5 → 높을수록 자존감↑.
 *  근거: Rosenberg Self-Esteem Scale(1965)을 5점 척도로 환산. 일반 성인은 중상위로 약하게 치우침. */
export function scoreSelfEsteem(items: LikertItem[], answers: Record<string, number>): TestResult {
  const ax: Record<string, { s: number; m: number; n: number }> = {}
  let raw = 0
  for (const it of items) {
    let v = answers[it.id] ?? 3
    if (it.reverse) v = 6 - v
    raw += v
    const acc = (ax[it.sub] ??= { s: 0, m: 0, n: 0 })
    acc.s += v
    acc.m += 5
    acc.n++
  }
  const pct = percentile(raw, 34, 6.5)
  const band = pct >= 78 ? 'high' : pct >= 50 ? 'secure' : pct >= 25 ? 'moderate' : 'low'
  const persona = band === 'high' ? 'lion' : band === 'secure' ? 'swan' : band === 'moderate' ? 'squirrel' : 'mouse'
  const subscales: SubscaleScore[] = ['POS', 'NEG'].map((key) => {
    const a = ax[key] ?? { s: 0, m: 1, n: 0 }
    return { key, score: a.s, max: a.m, ratio: laplace(a.s - a.n, a.m - a.n) }
  })
  return base('selfesteem', raw, pct, band, persona, subscales, {})
}

/* ──────────── PERFECTIONISM (Frost MPS 4차원) ──────────── */
/** 1~5 동의, 20문항. raw 20~100. μ=58 σ=13. STD=적응 축, CM+DA+SOC=부적응 축.
 *  근거: Frost Multidimensional Perfectionism Scale(Frost et al. 1990). 부적응 비중으로 고완벽 유형 구분. */
export function scorePerfection(items: LikertItem[], answers: Record<string, number>): TestResult {
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
  const STD = ax.STD?.s ?? 0
  const malad = (ax.CM?.s ?? 0) + (ax.DA?.s ?? 0) + (ax.SOC?.s ?? 0)
  const maladRatio = malad / Math.max(1, malad + STD)
  const pct = percentile(raw, 58, 13)
  let band: string
  let persona: string
  if (pct >= 68) {
    if (maladRatio >= 0.6) { band = 'strain'; persona = 'beaver' }
    else { band = 'driven'; persona = 'eagle' }
  } else if (pct >= 38) {
    band = 'balanced'
    persona = 'butterfly'
  } else {
    band = 'easy'
    persona = 'duck'
  }
  const subscales: SubscaleScore[] = ['STD', 'CM', 'DA', 'SOC'].map((key) => {
    const a = ax[key] ?? { s: 0, m: 1, n: 0 }
    return { key, score: a.s, max: a.m, ratio: laplace(a.s - a.n, a.m - a.n) }
  })
  return base('perfect', raw, pct, band, persona, subscales, {})
}

/* ──────────── SELF-EFFICACY (GSE-10) ──────────── */
/** 1~5 동의, 10문항(전 문항 긍정). raw 10~50. μ=33 σ=6.5 → 높을수록 자기효능감↑.
 *  근거: General Self-Efficacy Scale(Schwarzer & Jerusalem 1995)을 5점 척도로 환산. */
export function scoreEfficacy(items: LikertItem[], answers: Record<string, number>): TestResult {
  let raw = 0
  let n = 0
  for (const it of items) {
    raw += answers[it.id] ?? 3
    n++
  }
  const pct = percentile(raw, 33, 6.5)
  const band = pct >= 78 ? 'high' : pct >= 50 ? 'secure' : pct >= 25 ? 'moderate' : 'low'
  const persona = band === 'high' ? 'horse' : band === 'secure' ? 'kangaroo' : band === 'moderate' ? 'chick' : 'jellyfish'
  const subscales: SubscaleScore[] = [{ key: 'EFF', score: raw, max: n * 5, ratio: laplace(raw - n, n * 5 - n) }]
  return base('efficacy', raw, pct, band, persona, subscales, {})
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

/* ──────────── FOCUS (정밀 집중력 — Go/No-Go 반응과제) ────────────
 * 정밀검사 3호. SART(Sustained Attention to Response) 계열 실측 과제.
 * 처리속도(평균 반응시간) + 집중지속(누락=Go놓침) + 충동억제(오반응=No-Go누름)를 동시 측정.
 * 합성 = 정확도 z(가중0.6) + 속도 z(가중0.4) → FQ=100+15z. */
export interface GoTrial {
  go: boolean
  responded: boolean
  rt: number | null
}
const FOCUS_ACC_MU = 0.85
const FOCUS_ACC_SIGMA = 0.1
const FOCUS_RT_MU = 480
const FOCUS_RT_SIGMA = 90

export function scoreFocus(trials: GoTrial[]): TestResult {
  const goTrials = trials.filter((t) => t.go)
  const nogoTrials = trials.filter((t) => !t.go)
  const hits = goTrials.filter((t) => t.responded)
  const correctRej = nogoTrials.filter((t) => !t.responded)
  const commissions = nogoTrials.length - correctRej.length
  const accuracy = trials.length ? (hits.length + correctRej.length) / trials.length : 0
  const rts = hits.map((t) => t.rt).filter((x): x is number => x != null)
  const meanRT = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 800

  const zAcc = (accuracy - FOCUS_ACC_MU) / FOCUS_ACC_SIGMA
  const zRT = (FOCUS_RT_MU - meanRT) / FOCUS_RT_SIGMA // 빠를수록 +
  const z = 0.6 * zAcc + 0.4 * zRT
  const fq = Math.max(60, Math.min(145, Math.round(100 + 15 * z)))
  const pct = Math.min(99.5, Math.max(0.5, Math.round(normalCdf(z) * 1000) / 10))

  const band = fq >= 115 ? 'sharp' : fq >= 96 ? 'steady' : 'wander'
  const persona = band === 'sharp' ? 'hawk' : band === 'steady' ? 'bee' : 'otter'

  const subscales: SubscaleScore[] = [
    { key: 'sustain', score: hits.length, max: goTrials.length, ratio: laplace(hits.length, goTrials.length) },
    { key: 'inhibit', score: correctRej.length, max: nogoTrials.length, ratio: laplace(correctRej.length, nogoTrials.length) },
  ]

  return base('focus', hits.length + correctRej.length, pct, band, persona, subscales, {
    fq,
    axes: { rt: Math.round(meanRT), acc: Math.round(accuracy * 100), miss: goTrials.length - hits.length, false: commissions },
  })
}

/* ──────────── SPEED (정밀 처리속도 — 기호-숫자 매칭 DSST) ────────────
 * 정밀검사 4호. WAIS 기호쓰기(Digit-Symbol Coding) 계열 실측 과제.
 * 기호↔숫자 대응표를 보고 40개를 빠르고 정확히 매칭 → 처리속도 지수 SQ.
 * 합성 = 속도 z(가중0.7, 개당 반응시간) + 정확도 z(가중0.3) → SQ=100+15z. */
const SPEED_MS_MU = 1400
const SPEED_MS_SIGMA = 400
const SPEED_ACC_MU = 0.92
const SPEED_ACC_SIGMA = 0.08

export function scoreSpeed(correct: number, total: number, totalMs: number): TestResult {
  const perItem = total > 0 ? totalMs / total : 9999
  const accuracy = total > 0 ? correct / total : 0
  const zSpeed = (SPEED_MS_MU - perItem) / SPEED_MS_SIGMA // 개당 빠를수록 +
  const zAcc = (accuracy - SPEED_ACC_MU) / SPEED_ACC_SIGMA
  const z = 0.7 * zSpeed + 0.3 * zAcc
  const sq = Math.max(60, Math.min(145, Math.round(100 + 15 * z)))
  const pct = Math.min(99.5, Math.max(0.5, Math.round(normalCdf(z) * 1000) / 10))

  const band = sq >= 115 ? 'fast' : sq >= 96 ? 'brisk' : 'easy'
  const persona = band === 'fast' ? 'cheetah' : band === 'brisk' ? 'rabbit' : 'tortoise'

  const tempoRatio = Math.max(0.02, Math.min(0.99, (2200 - perItem) / 1700))
  const subscales: SubscaleScore[] = [
    { key: 'tempo', score: Math.round(tempoRatio * 100), max: 100, ratio: tempoRatio },
    { key: 'matchacc', score: correct, max: total, ratio: laplace(correct, total) },
  ]

  return base('speed', correct, pct, band, persona, subscales, {
    sq,
    axes: { ms: Math.round(perItem), acc: Math.round(accuracy * 100), count: correct },
  })
}

/* ──────────── SPATIAL (정밀 공간지각 — 심적 회전) ────────────
 * 정밀검사 5호. Shepard–Metzler/letter-rotation 계열 실측 과제.
 * 회전·반사된 글자를 머릿속에서 똑바로 돌려 정상/거울을 판별 → 공간 지수 XQ.
 * 합성 = 정확도 z(가중0.6) + 속도 z(가중0.4) → XQ=100+15z. */
const SPATIAL_ACC_MU = 0.82
const SPATIAL_ACC_SIGMA = 0.13
const SPATIAL_RT_MU = 2500
const SPATIAL_RT_SIGMA = 900

export function scoreSpatial(correct: number, total: number, totalMs: number): TestResult {
  const accuracy = total > 0 ? correct / total : 0
  const meanRT = total > 0 ? totalMs / total : 9999
  const zAcc = (accuracy - SPATIAL_ACC_MU) / SPATIAL_ACC_SIGMA
  const zRT = (SPATIAL_RT_MU - meanRT) / SPATIAL_RT_SIGMA // 빠를수록 +
  const z = 0.6 * zAcc + 0.4 * zRT
  const xq = Math.max(60, Math.min(145, Math.round(100 + 15 * z)))
  const pct = Math.min(99.5, Math.max(0.5, Math.round(normalCdf(z) * 1000) / 10))

  const band = xq >= 115 ? 'high' : xq >= 96 ? 'mid' : 'low'
  const persona = band === 'high' ? 'bat' : band === 'mid' ? 'pigeon' : 'snail'

  const rotRatio = Math.max(0.02, Math.min(0.99, (4500 - meanRT) / 3800))
  const subscales: SubscaleScore[] = [
    { key: 'spacc', score: correct, max: total, ratio: laplace(correct, total) },
    { key: 'rotspeed', score: Math.round(rotRatio * 100), max: 100, ratio: rotRatio },
  ]

  return base('spatial', correct, pct, band, persona, subscales, {
    xq,
    axes: { rt: Math.round(meanRT), acc: Math.round(accuracy * 100) },
  })
}

/* ──────────── SWITCH (정밀 주의전환 — Task-switching) ────────────
 * 정밀검사 6호. 집행기능(executive function) 실측 과제.
 * '크기'와 '홀짝' 규칙을 신호에 맞춰 갈아타며 판단 → 정확도·속도 + 전환비용(switch cost).
 * 합성 = 정확도 z(0.55) + 속도 z(0.3) + 전환유연성 z(0.15) → WQ=100+15z. */
export interface SwitchTrial {
  correct: boolean
  rt: number
  isSwitch: boolean
}
const SW_ACC_MU = 0.88
const SW_ACC_SIGMA = 0.1
const SW_RT_MU = 1100
const SW_RT_SIGMA = 350
const SW_COST_MU = 180
const SW_COST_SIGMA = 200

export function scoreSwitch(trials: SwitchTrial[]): TestResult {
  const correct = trials.filter((t) => t.correct).length
  const accuracy = trials.length ? correct / trials.length : 0
  const rts = trials.map((t) => t.rt)
  const meanRT = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 9999
  const swRts = trials.filter((t) => t.isSwitch).map((t) => t.rt)
  const repRts = trials.filter((t) => !t.isSwitch).map((t) => t.rt)
  const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : meanRT)
  const switchCost = mean(swRts) - mean(repRts) // 낮을수록 유연

  const zAcc = (accuracy - SW_ACC_MU) / SW_ACC_SIGMA
  const zRT = (SW_RT_MU - meanRT) / SW_RT_SIGMA
  const zCost = (SW_COST_MU - switchCost) / SW_COST_SIGMA // 비용 낮을수록 +
  const z = 0.55 * zAcc + 0.3 * zRT + 0.15 * zCost
  const wq = Math.max(60, Math.min(145, Math.round(100 + 15 * z)))
  const pct = Math.min(99.5, Math.max(0.5, Math.round(normalCdf(z) * 1000) / 10))

  const band = wq >= 115 ? 'high' : wq >= 96 ? 'mid' : 'low'
  const persona = band === 'high' ? 'chameleon' : band === 'mid' ? 'frog' : 'panda'

  const flexRatio = Math.max(0.02, Math.min(0.99, (450 - switchCost) / 450))
  const subscales: SubscaleScore[] = [
    { key: 'swacc', score: correct, max: trials.length, ratio: laplace(correct, trials.length) },
    { key: 'flex', score: Math.round(flexRatio * 100), max: 100, ratio: flexRatio },
  ]

  return base('switch', correct, pct, band, persona, subscales, {
    wq,
    axes: { rt: Math.round(meanRT), acc: Math.round(accuracy * 100), cost: Math.round(switchCost) },
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
