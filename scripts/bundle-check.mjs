/**
 * 번들 예산 검사 — `npm run bundle` (verify가 빌드 뒤에 자동 실행)
 *
 * 왜 필요한가: 메인 번들은 "정적 import 한 줄"로 조용히 부푼다. 실제로 두 번 났다 —
 * personaVisual.ts는 애초에 animalTranslations(184KB)를 메인에서 끊으려고 만든 모듈인데,
 * 성장 플래너를 붙이면서 Home → lib/growth → animalTranslations 로 다시 이어졌다.
 * 그 결과 플랜이 있는 사람만 쓰는 데이터를 **모든 방문자가** 받고 있었다.
 *
 * 크기는 사람이 눈으로 확인하지 않으면 절대 안 본다. 그래서 숫자로 못 박는다.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS = join(ROOT, 'dist/assets')

/**
 * 현재값 209KB. 여유를 조금만 둔다 — 넉넉하게 잡으면 경고가 울릴 때쯤엔 이미 늦는다.
 * 의도적으로 늘려야 한다면 이 숫자를 바꾸되, 커밋 메시지에 왜인지 남길 것.
 */
const BUDGET_GZIP_KB = 225

/**
 * 메인 번들에 들어오면 안 되는 무거운 모듈 — 각각 그 안에만 있는 문자열로 탐지한다.
 * (식별자는 minify로 사라지므로 내용 문자열을 쓴다)
 */
const FORBIDDEN = [
  { name: 'animalTranslations (페르소나 처방 전문 184KB)', mark: '온 세상의 알림을 다 받아보는 뇌' },
  { name: 'legalDocs (약관 본문 52KB)', mark: '누리 마인드 이용약관' },
  // ⚠️ 마커는 그 파일에만 있는 문자열이어야 한다. 처음엔 리커트 라벨을 썼다가
  //    LIKERT_AGREE(정적 유지)에도 같은 문자열이 있어 오탐이 났다.
  { name: 'dict.en (영어 사전 36KB)', mark: 'New animal unlocked — added to your dex!' },
  { name: 'dict.ja (일본어 사전 40KB)', mark: 'ヌリマインドへようこそ' },
]

if (!existsSync(ASSETS)) {
  console.log('❌ dist/assets 가 없습니다. 먼저 npm run build 를 실행하세요.')
  process.exit(1)
}

const entry = readdirSync(ASSETS).find((f) => /^index-.*\.js$/.test(f))
if (!entry) {
  console.log('❌ 메인 번들(index-*.js)을 찾지 못했습니다.')
  process.exit(1)
}

const src = readFileSync(join(ASSETS, entry), 'utf8')
const gzipKb = Math.round(gzipSync(Buffer.from(src)).length / 1024)
const fails = []

console.log(`\n번들 예산`)
const within = gzipKb <= BUDGET_GZIP_KB
console.log(`  ${within ? '✅' : '❌'} 메인 번들  ${gzipKb}KB (gzip) / 예산 ${BUDGET_GZIP_KB}KB`)
if (!within) fails.push(`메인 번들이 예산을 ${gzipKb - BUDGET_GZIP_KB}KB 초과했습니다`)

for (const f of FORBIDDEN) {
  const leaked = src.includes(f.mark)
  console.log(`  ${leaked ? '❌' : '✅'} ${leaked ? '메인에 유입됨' : '분리 유지'}  ${f.name}`)
  if (leaked) fails.push(`${f.name} 이(가) 메인 번들에 들어갔습니다 — 어느 정적 import가 끌어왔는지 확인하세요`)
}

if (fails.length) {
  console.log('\n❌ 실패')
  fails.forEach((m) => console.log(`   · ${m}`))
  console.log()
  process.exit(1)
}
console.log('\n번들 예산 통과\n')
