/**
 * E2E 전에 4173을 잡고 있는 고아 프로세스를 정리한다 — `npm run e2e`가 먼저 부른다.
 *
 * 왜 필요한가: Windows에서 `npm run build && vite preview`는 셸을 거쳐 뜨고, Playwright가 셸을
 * 죽여도 vite는 살아남는 일이 잦다(파이프가 먼저 끊기거나 && 체인이 중단될 때). 그 고아가
 * 4173을 쥔 채 옛 dist를 서빙하면 다음 E2E는 "포트 사용 중"으로 시작도 못 하거나, 더 나쁘게는
 * reuseExistingServer가 켜져 있을 때 몇 판 전 빌드를 검사한다. 이 세션에서만 네 번 겪었다.
 */
import { execSync } from 'node:child_process'

const port = Number(process.argv[2] ?? 4173)
const isWin = process.platform === 'win32'

try {
  const out = isWin
    ? execSync(`netstat -ano -p tcp`, { encoding: 'utf8' })
    : execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t || true`, { encoding: 'utf8' })

  const pids = new Set(
    isWin
      ? out
          .split(/\r?\n/)
          .filter((l) => l.includes(`:${port} `) && /LISTENING/.test(l))
          .map((l) => l.trim().split(/\s+/).pop())
          .filter((p) => p && p !== '0')
      : out.split(/\s+/).filter(Boolean),
  )

  if (pids.size === 0) {
    console.log(`포트 ${port} 비어 있음`)
  } else {
    for (const pid of pids) {
      try {
        execSync(isWin ? `taskkill /PID ${pid} /F` : `kill -9 ${pid}`, { stdio: 'ignore' })
        console.log(`포트 ${port} 고아 프로세스 ${pid} 종료`)
      } catch {
        console.log(`PID ${pid} 종료 실패 — 이미 없거나 권한 부족`)
      }
    }
  }
} catch (e) {
  // 정리 실패가 테스트를 막으면 안 된다 — Playwright의 --strictPort가 어차피 요란하게 알려준다
  console.log(`포트 점검 건너뜀: ${String(e).slice(0, 80)}`)
}
