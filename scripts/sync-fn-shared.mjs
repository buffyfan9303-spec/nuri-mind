/**
 * 엣지 함수 공용 모듈 동기화.
 *
 * Supabase 엣지 함수는 함수 폴더 단위로 번들돼 배포되므로, 폴더 밖(_shared/)의 파일을
 * 상대 경로로 import할 수 없다. 그래서 원본 하나(_shared/llm.ts)를 각 함수 폴더에
 * llm.ts 사본으로 떨궈 두고, 스모크가 원본과 동일한지 검사한다(사본이 조용히 갈라지는 것을 차단).
 *
 * 실행: npm run sync:fn   /   검사: npm run smoke
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
export const SRC = join(ROOT, 'supabase/functions/_shared/llm.ts')
export const TARGETS = ['deep-report', 'ai-report', 'fortune-detail']

const BANNER = `// ⚠️ 자동 생성 파일 — 직접 수정하지 마세요.
// 원본: supabase/functions/_shared/llm.ts · 갱신: npm run sync:fn
`

export function expected() {
  return BANNER + readFileSync(SRC, 'utf8')
}

export function copyPath(fn) {
  return join(ROOT, 'supabase/functions', fn, 'llm.ts')
}

// 직접 실행했을 때만 파일을 쓴다(스모크는 import해서 검사만 한다)
if (process.argv[1] && process.argv[1].endsWith('sync-fn-shared.mjs')) {
  const want = expected()
  for (const fn of TARGETS) {
    const p = copyPath(fn)
    const changed = !existsSync(p) || readFileSync(p, 'utf8') !== want
    if (changed) writeFileSync(p, want)
    console.log(`${changed ? '갱신' : '동일'}  supabase/functions/${fn}/llm.ts`)
  }
}
