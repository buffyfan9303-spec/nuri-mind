/**
 * 🌱 성장 플래너 — 검사 결과를 "매일 할 수 있는 행동"으로 바꾸는 층.
 *
 * 리포트가 알려주는 방향(무엇을 고칠까)을 실제 실행(오늘 뭐 하지)으로 잇는다.
 * 과제는 페르소나의 solutions(검사별 큐레이션된 처방)에서 파생 — AI 키가 없어도 동작하며,
 * 심층 리포트의 '90일 로드맵'은 화면 상단 안내로 함께 보여준다.
 *
 * ⚠️ 완료 기록의 날짜 키는 반드시 lib/date(로컬 KST) — UTC는 하루 경계가 9시로 밀린다.
 */
import { PERSONAS } from '../i18n/animalTranslations'
import { TESTS } from '../data/tests'
import type { L, TestResult } from '../data/types'

// 주기 판정은 의존성 없는 lib/cadence에 산다 — 스토어가 이 파일을 통해 들어오면
// 위의 animalTranslations(184KB)가 메인 번들로 딸려온다. 소비처 import 경로는 그대로 두려고 재수출한다.
export { isTaskDone, weekKeyOfDay, type Cadence } from './cadence'
import type { Cadence } from './cadence'

export interface GrowthTask {
  /** `${testId}:${index}` — 완료 기록(growthDone)의 키 */
  id: string
  title: L
  cadence: Cadence
}

export interface GrowthFocus {
  testId: string
  emoji: string
  tasks: GrowthTask[]
}

/** 값이 높을수록 개선이 필요한 검사(위험형) */
const RISK_HIGH = new Set(['adhd', 'burnout', 'dopamine', 'dark', 'perfect', 'socialanx'])
/** 값이 낮을수록 개선이 필요한 검사(강점형) */
const RISK_LOW = new Set(['resilience', 'selfesteem', 'efficacy'])

/** 이 결과가 얼마나 '지금 손볼 가치가 큰가' — 클수록 우선 */
function needScore(r: TestResult): number {
  const high = r.band === 'high'
  const low = r.band === 'low'
  if (RISK_HIGH.has(r.testId)) return high ? 3 : r.band === 'mid' ? 2 : 1
  if (RISK_LOW.has(r.testId)) return low ? 3 : r.band === 'mid' ? 2 : 1
  return 1 // love·ego 등 중립형은 후순위
}

/** 검사별 최신 결과 1개씩 */
export function latestResults(results: TestResult[]): TestResult[] {
  const by = new Map<string, TestResult>()
  for (const r of [...results].sort((a, b) => b.at - a.at)) if (!by.has(r.testId)) by.set(r.testId, r)
  return [...by.values()]
}

/**
 * 결과에서 성장 포커스 3개를 고른다(개선 여지가 큰 순, 처방이 있는 검사만).
 *
 * ⚠️ 페르소나가 겹치는 검사는 건너뛴다. 처방 문구는 페르소나 단위라서 같은 페르소나를 두 번
 *    고르면 두 번째 카드의 과제가 중복제거(buildFocuses의 used)에 전부 먹혀 카드째 사라진다 —
 *    "3가지를 골라 드려요"라고 해놓고 1개만 나오는 결과가 됐다.
 */
export function pickFocusIds(results: TestResult[], max = 3): string[] {
  const out: string[] = []
  const personas = new Set<string>()
  const ranked = latestResults(results)
    .filter((r) => (PERSONAS[r.persona]?.solutions?.length ?? 0) > 0)
    .sort((a, b) => needScore(b) - needScore(a) || b.at - a.at)
  for (const r of ranked) {
    if (personas.has(r.persona)) continue
    personas.add(r.persona)
    out.push(r.testId)
    if (out.length >= max) break
  }
  return out
}

/**
 * 포커스(검사) → 실천 과제 2개(매일 1 · 주간 1).
 * ⚠️ 같은 페르소나가 여러 검사에 걸릴 수 있어 문구가 겹친다 — used로 이미 쓴 처방을 건너뛴다.
 *    id는 solutions의 실제 인덱스를 써서 목록이 바뀌어도 완료 기록이 어긋나지 않게 한다.
 */
export function tasksFor(testId: string, results: TestResult[], used?: Set<string>): GrowthTask[] {
  const r = latestResults(results).find((x) => x.testId === testId)
  const sol = r ? PERSONAS[r.persona]?.solutions ?? [] : []
  const out: GrowthTask[] = []
  for (let i = 0; i < sol.length && out.length < 2; i++) {
    const key = sol[i].ko
    if (used?.has(key)) continue
    used?.add(key)
    out.push({ id: `${testId}:${i}`, title: sol[i], cadence: out.length === 0 ? 'daily' : 'weekly' })
  }
  return out
}

/** 저장된 포커스 id → 렌더용 포커스 목록(포커스 간 과제 중복 제거) */
export function buildFocuses(focusIds: string[], results: TestResult[]): GrowthFocus[] {
  const used = new Set<string>()
  return focusIds
    .map((id) => ({
      testId: id,
      emoji: TESTS.find((t) => t.id === id)?.emoji ?? '🌱',
      tasks: tasksFor(id, results, used),
    }))
    .filter((f) => f.tasks.length > 0)
}

