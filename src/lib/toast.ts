import { create } from 'zustand'
import { haptic } from './haptic'

export type ToastVariant = 'ok' | 'err' | 'info'

export interface ToastAction {
  label: string
  run: () => void
}

export interface ToastItem {
  id: number
  text: string
  variant: ToastVariant
  action?: ToastAction
}

/**
 * 노출 시간 — 읽는 데 걸리는 시간이 다르므로 종류별로 다르다.
 * 되돌리기가 붙으면 '읽고 → 판단하고 → 손을 뻗는' 시간이 필요해 가장 길다(6초).
 * 실패는 다시 읽게 되므로 4.5초, 성공은 이미 예상한 결과라 2.4초면 충분하다.
 */
const DURATION: Record<ToastVariant, number> = { ok: 2400, err: 4500, info: 2800 }

/**
 * 되돌리기 창 — 토스트가 떠 있는 시간과 **실제 되돌릴 수 있는 시간이 같아야 한다**.
 * 호출부(삭제 유예 타이머)가 이 상수를 함께 쓴다. 어긋나면 화면엔 '되돌리기'가 보이는데
 * 눌러도 아무 일이 없는 구간이 생긴다 — 버튼이 거짓말을 하는 최악의 상태다.
 */
export const UNDO_WINDOW_MS = 6000

interface ToastState {
  items: ToastItem[]
  /** 만들어진 토스트 id — 되돌리기가 무효가 되는 순간 호출부가 직접 내릴 수 있어야 한다 */
  show: (text: string, variant?: ToastVariant, action?: ToastAction) => number
  dismiss: (id: number) => void
}

let seq = 0
const timers = new Map<number, ReturnType<typeof setTimeout>>()

/**
 * 전역 토스트 — 화면마다 손으로 만들던 알림 4종(성장플랜·우편함·커뮤니티)을 하나로 모은다.
 *
 * 스토어로 두는 이유: 알림을 띄우는 쪽은 catch 블록 깊숙한 곳(비동기 콜백)이라
 * 컨텍스트 훅을 부를 수 없는 자리가 많다. show()는 어디서나 부를 수 있어야 한다.
 *
 * 햅틱을 여기서 치는 이유: 손끝의 성공/실패 구분은 화면을 안 봐도 전달된다.
 * 실패는 두 번 끊어 치는 패턴이라 성공(한 번)과 촉각만으로 구분된다.
 */
export const useToastStore = create<ToastState>((set, get) => ({
  items: [],
  show: (text, variant = 'ok', action) => {
    // 같은 문구가 연달아 쌓이면(따발총 탭) 마지막 하나만 남긴다.
    // 단 되돌리기가 달린 토스트는 겹쳐도 지우지 않는다 — 글 2개를 연속 삭제하면 문구가 같아서
    // 첫 번째 글의 되돌리기가 사라지고, 그 글은 유예 창이 열려 있는데도 되돌릴 방법이 없어진다.
    if (!action) {
      const dup = get().items.find((i) => i.text === text && i.variant === variant && !i.action)
      if (dup) get().dismiss(dup.id)
    }

    const id = ++seq
    haptic(variant === 'err' ? [18, 40, 18] : 10)
    set((s) => ({ items: [...s.items, { id, text, variant, action }] }))
    timers.set(
      id,
      setTimeout(() => get().dismiss(id), action ? UNDO_WINDOW_MS : DURATION[variant]),
    )
    return id
  },
  dismiss: (id) => {
    const t = timers.get(id)
    if (t) clearTimeout(t)
    timers.delete(id)
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
  },
}))

/** 훅 밖(콜백·catch)에서도 부를 수 있는 단축 — 화면 컴포넌트에선 그냥 이걸 쓰면 된다 */
export const toast = {
  ok: (text: string, action?: ToastAction) => useToastStore.getState().show(text, 'ok', action),
  err: (text: string, action?: ToastAction) => useToastStore.getState().show(text, 'err', action),
  info: (text: string, action?: ToastAction) => useToastStore.getState().show(text, 'info', action),
  /** 되돌리기가 더는 통하지 않을 때 그 토스트를 내린다 — 거짓말하는 버튼을 화면에 남기지 않는다 */
  close: (id: number) => useToastStore.getState().dismiss(id),
}
