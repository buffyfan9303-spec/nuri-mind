/**
 * 저장소 보호 — localStorage는 용량 초과·사생활 모드·쿠키 차단 웹뷰에서 읽기·쓰기 모두 예외를 던진다.
 * persist는 그 예외를 set() 밖으로 흘려 적립 직후의 서버 미러(mirrorEarn)·화면 처리까지 건너뛰게 만든다.
 * 저장만 포기하고 앱 상태는 계속 간다(메모리 상태 유지).
 *
 * 원래 store/useStore.ts 안에 있던 것을 그대로 옮겼다 — economy.ts도 같은 보호가 필요한데,
 * economy가 스토어를 import 하면 순환 참조가 된다(스토어가 economy를 import 한다).
 * ⚠️ 이 파일엔 import를 두지 않는다(어디서든 끌어다 써도 번들·순환에 영향이 없게).
 *
 * setItem은 성공 여부를 돌려준다 — 계정 보관본처럼 "못 쓴 것"을 알아야 하는 호출부가 있다.
 * (persist의 StateStorage는 void 반환을 기대하지만 boolean 반환 함수도 그대로 받는다.)
 */
let storageWarned = false

export const safeLocalStorage = {
  getItem: (k: string): string | null => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k: string, v: string): boolean => {
    try {
      localStorage.setItem(k, v)
      return true
    } catch (e) {
      if (!storageWarned) {
        storageWarned = true
        console.warn('[store] 저장 공간에 쓰지 못했어요 — 이번 방문 동안만 유지돼요', e)
      }
      return false
    }
  },
  removeItem: (k: string): void => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}
