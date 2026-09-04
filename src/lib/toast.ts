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
const WITH_ACTION = 6000

interface ToastState {
  items: ToastItem[]
  show: (text: string, variant?: ToastVariant, action?: ToastAction) => void
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
    // 같은 문구가 연달아 쌓이면(따발총 탭) 마지막 하나만 남긴다
    const dup = get().items.find((i) => i.text === text && i.variant === variant)
    if (dup) get().dismiss(dup.id)

    const id = ++seq
    haptic(variant === 'err' ? [18, 40, 18] : 10)
    set((s) => ({ items: [...s.items, { id, text, variant, action }] }))
    timers.set(
      id,
      setTimeout(() => get().dismiss(id), action ? WITH_ACTION : DURATION[variant]),
    )
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
}
