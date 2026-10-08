/**
 * 계정·재화 동기화 행동 검사 — 브라우저·supabase 없이 src/lib/econCore.ts를 직접 불러 순서를 재현한다.
 * (Node 22.6+ 타입 제거 실행. econCore.ts는 import가 없는 파일이라 그대로 읽힌다.)
 *
 * 각 묶음은 "막아야 하는 것"과 "막으면 안 되는 것"을 같이 단언한다 — 한쪽만 있으면
 * 가드를 `return true`/`return false` 한 줄로 바꿔도 초록이 된다.
 * 마지막 묶음은 배선 앵커(소스 계약)다 — 순수 함수가 맞아도 호출부가 안 부르면 소용없다.
 *
 * 실행: node scripts/econ-check.mjs  (smoke ⑬에서도 불린다)
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')

export async function runEconCheck() {
  const C = await import(pathToFileURL(join(ROOT, 'src/lib/econCore.ts')).href)
  const passes = []
  const fails = []
  const check = (name, cond, detail = '') => (cond ? passes.push(name) : fails.push(`${name}${detail ? ' — ' + detail : ''}`))

  const mkKV = (failSet = () => false) => {
    const m = new Map()
    return {
      m,
      getItem: (k) => (m.has(k) ? m.get(k) : null),
      setItem: (k, v) => {
        if (failSet(k, v)) return false
        m.set(k, v)
        return true
      },
      removeItem: (k) => void m.delete(k),
    }
  }
  const entry = (id, uid, kind = 'earn', amount = 10) => ({ id, k: 'evt:' + id, kind, amount, memo: id, uid })

  /* ── 1. 계정 세대 — 무엇이 세대를 올리고 무엇이 안 올리는가 ── */
  {
    const z = { uid: null, epoch: 0 }
    const a = C.nextAuthMark(z, 'A')
    check('세대: 로그인(null→A)은 안 올린다', a.uid === 'A' && a.epoch === 0)
    check('세대: 같은 계정 재확인(TOKEN_REFRESHED)은 그대로', C.nextAuthMark(a, 'A') === a)
    check('세대: 계정 전환(A→B)은 +1', C.nextAuthMark(a, 'B').epoch === 1)
    check('세대: 로그아웃은 +1(이미 로그아웃이어도)', C.nextAuthMark(a, null).epoch === 1 && C.nextAuthMark(z, null).epoch === 1)

    let now = a
    const start = now
    now = C.nextAuthMark(now, null)
    check('늦은 응답: A 시작 → 로그아웃 직후 이미 낡음', C.isStaleAuth(start, now))
    now = C.nextAuthMark(now, 'B')
    check('늦은 응답: A 시작 → 로그아웃 → B 로그인 = 낡음', C.isStaleAuth(start, now))
    check('늦은 응답: A → 로그아웃 → A 재로그인도 낡음(uid만 보면 놓침)', C.isStaleAuth(start, C.nextAuthMark(C.nextAuthMark(a, null), 'A')))
    check('늦은 응답(반대편): 토큰 갱신만 있었으면 낡지 않음', !C.isStaleAuth(a, C.nextAuthMark(a, 'A')))
  }

  /* ── 2. 재진입 게이트 — 진행 중 호출을 버리지 않고 끝난 뒤 한 번 더 ── */
  {
    const g = C.createRerunGate()
    const first = g.tryEnter()
    const second = g.tryEnter()
    const again = g.exit()
    check('게이트: 진행 중 들어온 호출 → 끝난 뒤 재실행 요청', first === true && second === false && again === true)
    const g2 = C.createRerunGate()
    g2.tryEnter()
    check('게이트(반대편): 들어온 호출이 없으면 재실행 안 함', g2.exit() === false && g2.tryEnter() === true)
  }

  /* ── 3. 아웃박스 — 보내기 직전 세션 uid 재확인(보안 검토 S3) ── */
  {
    // A의 항목 2개 + 비로그인 항목 1개. 첫 항목을 보낸 직후 세션이 B로 바뀐다(비밀번호 로그인, 리로드 없음).
    const kv = mkKV()
    C.saveOutboxTo(kv, [entry('a1', 'A'), entry('a2', 'A'), entry('g3', null)])
    let session = 'A'
    const sent = []
    const ok = await C.drainOutbox({
      uid: 'A',
      kv,
      sessionUid: async () => session,
      isStale: () => false,
      sendEarn: async (e) => {
        sent.push({ id: e.id, token: session })
        session = 'B'
        return true
      },
      sendSpend: async () => 'ok',
    })
    const left = C.loadOutboxFrom(kv)
    check('S3: 세션이 B로 바뀐 뒤 A 항목을 보내지 않는다', sent.length === 1 && sent.every((s) => s.token === 'A'), JSON.stringify(sent))
    check('S3: 못 보낸 항목은 보존(a2 남음, 비로그인 항목은 A가 클레임하지 않음)', ok === false && left.some((x) => x.id === 'a2' && x.uid === 'A') && left.some((x) => x.id === 'g3' && x.uid === null))

    // 세대 가드만 바뀌는 경우(세션 확인 전에 끊김)
    const kv2 = mkKV()
    C.saveOutboxTo(kv2, [entry('a1', 'A'), entry('a2', 'A')])
    let stale = false
    const sent2 = []
    await C.drainOutbox({
      uid: 'A',
      kv: kv2,
      sessionUid: async () => 'A',
      isStale: () => stale,
      sendEarn: async (e) => {
        sent2.push(e.id)
        stale = true
        return true
      },
      sendSpend: async () => 'ok',
    })
    check('배출: 도중 로그아웃(세대 변경) → 다음 항목부터 중단', sent2.length === 1)

    // 반대편 — 세션이 그대로면 전부 보내고, 비로그인 항목은 A가 클레임해 보낸다
    const kv3 = mkKV()
    C.saveOutboxTo(kv3, [entry('a1', 'A'), entry('g2', null), entry('b3', 'B')])
    const sent3 = []
    const ok3 = await C.drainOutbox({
      uid: 'A',
      kv: kv3,
      sessionUid: async () => 'A',
      isStale: () => false,
      sendEarn: async (e) => (sent3.push(e.id), true),
      sendSpend: async () => 'ok',
    })
    const left3 = C.loadOutboxFrom(kv3)
    check('배출(반대편): 세션이 그대로면 A·비로그인 항목 전부 전송, B 항목은 휴면 보존', ok3 === true && sent3.join(',') === 'a1,g2' && left3.length === 1 && left3[0].id === 'b3')
  }

  /* ── 4. 계정 동기화 — 늦게 끝난 이전 계정 호출이 새 계정에 쓰지 않는다 ── */
  {
    const mkSync = ({ kv, session = () => 'A', ledger = 3, server = 777, onLedger, onServer, onSendEarn }) => {
      const st = { mark: { uid: null, epoch: 0 } }
      const calls = { swap: [], restore: [], setWallet: [], sendEarn: [], flush: [] }
      const deps = {
        kv,
        hooks: {
          getWallet: () => ({ points: 50 }),
          restoreTo: (s, sn) => calls.restore.push([s, sn]),
          swapAccount: (a, b) => calls.swap.push([a, b]),
          setWallet: (p) => calls.setWallet.push(p),
        },
        sessionUid: async () => session(),
        getAuth: () => st.mark,
        noteUid: (uid) => {
          st.mark = C.nextAuthMark(st.mark, uid)
        },
        flush: async (o) => (calls.flush.push(o.force), true),
        fetchLedgerCount: async () => (onLedger?.(st), ledger),
        fetchServerPoints: async () => (onServer?.(st), server),
        sendEarn: async (a, m, k) => (calls.sendEarn.push(k), onSendEarn?.(st), true),
      }
      return { deps, calls, st }
    }
    const switchTo = (st, uid) => (st.mark = C.nextAuthMark(st.mark, uid))

    // ① 첫 동기화(복원 경로): 원장 수를 기다리는 사이 로그아웃 → B 로그인
    {
      const kv = mkKV()
      const { deps, calls } = mkSync({ kv, onLedger: (st) => (switchTo(st, null), switchTo(st, 'B')) })
      await C.runAccountSync(deps)
      check('동기화: 첫 동기화 중 A→B 전환 → 복원·마커 쓰기 없음', calls.restore.length === 0 && kv.getItem(C.SYNC_UID_KEY) === null && kv.getItem(C.LOCAL_UID_KEY) === null)
    }
    // ② 첫 동기화: 서버 잔액을 기다리는 사이 전환
    {
      const kv = mkKV()
      const { deps, calls } = mkSync({ kv, onServer: (st) => switchTo(st, 'B') })
      await C.runAccountSync(deps)
      check('동기화: 서버 잔액 응답 전에 전환 → restoreTo 안 부름', calls.restore.length === 0 && kv.getItem(C.SYNC_UID_KEY) === null)
    }
    // ③ 계정 전환 경로(마커 X → A): 서버 잔액 대기 중 로그아웃
    {
      const kv = mkKV()
      kv.setItem(C.SYNC_UID_KEY, 'X')
      kv.setItem(C.LOCAL_UID_KEY, 'X')
      const { deps, calls } = mkSync({ kv, onServer: (st) => switchTo(st, null) })
      await C.runAccountSync(deps)
      check('동기화: 전환 정산 중 로그아웃 → setWallet·마커 쓰기 없음(경계 스왑은 이미 적용)', calls.setWallet.length === 0 && kv.getItem(C.SYNC_UID_KEY) === 'X' && calls.swap.length === 1)
    }
    // ④ 신규 계정 이관: 이관 전송 직후 전환
    {
      const kv = mkKV()
      const { deps, calls } = mkSync({ kv, ledger: 0, onSendEarn: (st) => switchTo(st, 'B') })
      await C.runAccountSync(deps)
      check('동기화: 이관 직후 전환 → 마커 안 박음', calls.sendEarn.includes('local_migration') && kv.getItem(C.SYNC_UID_KEY) === null)
    }
    // ⑤ getSession 대기 중 전환 — 시작 세대와 달라졌으면 아무것도 안 함
    {
      const kv = mkKV()
      kv.setItem(C.LOCAL_UID_KEY, 'X')
      let st0
      const r = mkSync({ kv })
      st0 = r.st
      r.deps.sessionUid = async () => (switchTo(st0, null), 'A')
      await C.runAccountSync(r.deps)
      check('동기화: 세션 조회 중 로그아웃 → 스왑조차 안 함', r.calls.swap.length === 0 && kv.getItem(C.LOCAL_UID_KEY) === 'X')
    }
    // 반대편 — 전환 없이 끝까지 가면 정상 반영
    {
      const kv = mkKV()
      const { deps, calls } = mkSync({ kv })
      await C.runAccountSync(deps)
      check('동기화(반대편): 방해 없으면 복원 + 마커 A', calls.restore.length === 1 && calls.restore[0][0] === 777 && kv.getItem(C.SYNC_UID_KEY) === 'A' && kv.getItem(C.LOCAL_UID_KEY) === 'A')
      const kv2 = mkKV()
      kv2.setItem(C.SYNC_UID_KEY, 'X')
      kv2.setItem(C.LOCAL_UID_KEY, 'X')
      const r2 = mkSync({ kv: kv2 })
      await C.runAccountSync(r2.deps)
      check('동기화(반대편): 전환 정산 정상 → setWallet(서버) + 마커 A', r2.calls.setWallet[0] === 777 && kv2.getItem(C.SYNC_UID_KEY) === 'A' && r2.calls.swap[0]?.join('>') === 'X>A')
      // 토큰 갱신(같은 uid 이벤트)은 동기화를 끊지 않는다
      const kv3 = mkKV()
      const r3 = mkSync({ kv: kv3, onLedger: (st) => switchTo(st, 'A') })
      await C.runAccountSync(r3.deps)
      check('동기화(반대편): 도중 같은 계정 토큰 갱신은 무해', r3.calls.restore.length === 1 && kv3.getItem(C.SYNC_UID_KEY) === 'A')
    }
  }

  /* ── 5. 계정 삭제 오류 — 서버 원문을 돌려주지 않는다 ── */
  {
    const leak = 'relation "auth.users" does not exist at delete_account()'
    const cases = [
      { name: 'FunctionsHttpError', message: leak },
      { name: 'FunctionsRelayError', message: leak },
      { name: 'FunctionsFetchError', message: leak },
      new Error(leak),
      { message: leak },
      null,
      'boom',
    ]
    const allowed = new Set(['network', 'server_rejected', 'server_unavailable', 'unknown'])
    const outs = cases.map((e) => C.deleteErrorCode(e))
    check('삭제 오류: 어떤 입력에도 코드만(원문 미포함)', outs.every((o) => allowed.has(o) && !o.includes('relation')), outs.join(','))
    check('삭제 오류(반대편): 종류별 코드 구분', outs[0] === 'server_rejected' && outs[1] === 'server_unavailable' && outs[2] === 'network')
  }

  /* ── 6. 우편 일괄 수령 집계 ── */
  {
    const r = C.tallyClaims([
      { id: 1, got: 5 },
      { id: 2, got: null },
      { id: 3, got: 0 },
      { id: 4, got: 7 },
    ])
    check('일괄 수령: 실패분은 미수령으로 분리, 성공분만 합산', r.okIds.join(',') === '1,3,4' && r.failedIds.join(',') === '2' && r.total === 12)
    const all = C.tallyClaims([{ id: 9, got: 3 }])
    check('일괄 수령(반대편): 전부 성공이면 실패 0', all.failedIds.length === 0 && all.total === 3)
  }

  /* ── 7. 초대 코드 — 'unavailable'에서 로컬 보상 금지 ── */
  {
    const S = C.referralNextStep
    check('초대: unavailable·모르는 응답·계정 변경 → 막음', S('unavailable', false) === 'blocked' && S('weird', false) === 'blocked' && S('ok', true) === 'blocked' && S('no_auth', true) === 'blocked')
    check('초대(반대편): ok·비로그인은 로컬 진행, 서버 확정 판정은 그대로', S('ok', false) === 'local' && S('no_auth', false) === 'local' && S('used', false) === 'used' && S('self', false) === 'self' && S('invalid', false) === 'invalid')
  }

  /* ── 8. 계정 보관본 — 저장 실패를 조용히 넘기지 않는다 ── */
  {
    const full = { diamonds: 30, premiumUntil: 99, results: ['x'.repeat(5000)] }
    const compact = { diamonds: 30, premiumUntil: 99 }
    const kvBig = mkKV((k, v) => v.length > 1000) // 용량 초과: 큰 값만 실패
    const r1 = C.vaultSave(kvBig, 'u-compact', full, compact)
    const stored = JSON.parse(kvBig.getItem(C.acctKey('u-compact')) ?? 'null')
    check('보관: 전체 저장 실패 → 축약본(다이아·프리미엄)을 저장소에', r1 === 'compact' && stored?.diamonds === 30 && stored?.premiumUntil === 99 && !('results' in stored))
    check('보관: 같은 방문에선 메모리의 전체본으로 복원', C.vaultLoad(kvBig, 'u-compact')?.results?.length === 1)
    const kvDead = mkKV(() => true)
    const r2 = C.vaultSave(kvDead, 'u-mem', full, compact)
    check('보관: 저장소 전부 실패 → memory 반환(호출부가 경고) + 메모리 복원', r2 === 'memory' && C.vaultLoad(kvDead, 'u-mem')?.diamonds === 30)
    C.vaultDrop(kvBig, 'u-compact')
    check('보관: 삭제는 메모리·저장소 둘 다', C.vaultLoad(kvBig, 'u-compact') === null)
    const kvOk = mkKV()
    check('보관(반대편): 정상 저장소 → full, 다른 탭(메모리 없음)에서도 저장소본이 읽힘', C.vaultSave(kvOk, 'u-ok', full, compact) === 'full' && JSON.parse(kvOk.getItem(C.acctKey('u-ok'))).results.length === 1)
    const kvOld = mkKV()
    kvOld.setItem(C.acctKey('u-disk'), JSON.stringify({ diamonds: 4 }))
    check('보관(반대편): 메모리에 없으면 저장소 보관본을 읽는다', C.vaultLoad(kvOld, 'u-disk')?.diamonds === 4)
  }

  /* ── 9. 배선 앵커 — 순수 함수를 호출부가 실제로 쓰는가 ── */
  {
    const econ = read('src/lib/economy.ts')
    const code = econ.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
    check('배선: economy가 runAccountSync·drainOutbox·재진입 게이트를 쓴다', /runAccountSync\(/.test(code) && /drainOutbox\(/.test(code) && /syncGate\.tryEnter\(\)/.test(code) && /if \(syncGate\.exit\(\)\)/.test(code))
    check('배선: economy에 localStorage 직접 접근 없음', !/\blocalStorage\./.test(code))
    check('배선: economy가 서버 오류 원문(message)을 돌려주지 않음', !/\.message\b/.test(code))
    check('배선: 세대는 auth 이벤트 콜백 안에서 동기로 반영', /onAuthChange\(\(uid\) => \{\s*noteAuthUid\(uid\)/.test(code))
    const mail = read('src/pages/Mailbox.tsx')
    const staleChecks = (mail.match(/isStaleAuth\(start, authMark\(\)\)/g) ?? []).length
    check('배선: 우편 수령 두 곳 모두 늦은 응답 가드(지금 값 getter)', staleChecks >= 2 && /tallyClaims\(results\)/.test(mail) && !/claimAllMail/.test(mail), `가드 ${staleChecks}곳`)
    const inv = read('src/components/Invite.tsx')
    check('배선: 초대 입력이 서버 판정 → referralNextStep을 거친다', /referralNextStep\(sv, isStaleAuth\(start, authMark\(\)\)\)/.test(inv) && /step === 'blocked'/.test(inv))
    const store = read('src/store/useStore.ts')
    check('배선: 스토어 전환이 보관 실패를 vaultSave로 판정', /vaultSave\(safeLocalStorage, prevUid, snap, compact\)/.test(store) && /saved !== 'full'/.test(store) && !/localStorage\.setItem\(KEY\(/.test(store))
    check('배선: 초대 보상 로컬 멱등키', /paidKeys\.includes\('referral_redeem'\)/.test(store))
  }

  return { passes, fails }
}

// 직접 실행
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { passes, fails } = await runEconCheck()
  console.log(`econ-check 통과 ${passes.length} · 실패 ${fails.length}`)
  fails.forEach((f) => console.log('  ✗ ' + f))
  process.exit(fails.length ? 1 : 0)
}
