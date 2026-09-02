import { useEffect, useRef } from 'react'

/**
 * 뒤로가기(Back) 스택 — 홀덤 캘린더에서 이식.
 *
 * 문제: 모달·시트가 열린 채 Android/브라우저 뒤로가기를 누르면 오버레이가 닫히는 대신 **페이지가
 * 빠져나간다**(NURI MIND에는 history 처리가 하나도 없었다). 모바일에서 뒤로가기는 '닫기'의 동의어라
 * 이건 곧 "약관 읽다가 뒤로가기 → 온보딩이 사라짐"이다.
 *
 * 해결: popstate 리스너 **하나** + LIFO 스택. 오버레이가 열릴 때 history 항목 1개를 push하고 등록,
 * 뒤로가기는 최상단 한 겹만 닫는다. X/ESC/배경 탭으로 닫으면 disposer가 그 항목을 되감는다.
 * 모든 오버레이는 useBackClose(open, onClose) 한 줄이면 된다.
 *
 * 홀덤이 실전에서 겪은 세 가지를 그대로 막는다:
 *  ⓐ 죽은 꼬리 — 프로그램적으로 닫힌 항목은 microtask에 모아 go(-k) 한 번으로 정리. 겹마다 back()을
 *     부르면 순서가 어긋나 한 칸 더 돌아가 앱 밖으로 나간다.
 *  ⓑ 토큰 유실 — 앱 곳곳의 replaceState({}, '', url)가 현재 항목의 __layer 토큰을 지우면 위치가
 *     루트로 오인돼 다음 뒤로가기가 열린 겹을 전부 닫는다 → replaceState를 감싸 토큰만 보존.
 *  ⓒ pushState 실패(Safari throttle) — 칸을 못 잡은 항목은 hasSlot=false로 두고 되감지 않는다.
 *     실패를 삼기고 '가졌다'고 치면 정리 때 남의 칸을 되감아 사이트를 이탈한다.
 *
 * 홀덤의 '입양(adoptable)' 예약은 가져오지 않았다 — 이 앱은 App 상태로 lazy 오버레이를 띄우지 않는다.
 */

type CloseFn = () => void

interface Layer {
  id: number
  close: CloseFn
  /** false = 닫혔지만 history 칸이 아직 남아 있는 '죽은 꼬리' */
  live: boolean
  /** 실제 history 칸을 차지했는가(pushState 성공) — 되감기 상한의 근거 */
  hasSlot: boolean
}

/** history 항목과 1:1. 배열 순서 = history 순서. */
const entries: Layer[] = []
let seq = 0
let initialized = false
/** 우리가 실제로 밀어 넣은 칸 수 — go(-k)의 절대 상한 */
let ownedSlots = 0

function currentLayerId(): number {
  const st = window.history.state as { __layer?: number } | null
  return st && typeof st.__layer === 'number' ? st.__layer : 0
}

function handlePop() {
  // 현재 위치(__layer)보다 위에 쌓인 항목은 전부 소비된 것 — 한 번 뒤로가기면 최상단 한 겹만 닫힌다
  const cur = currentLayerId()
  while (entries.length && entries[entries.length - 1].id > cur) {
    const top = entries.pop()!
    if (top.hasSlot) ownedSlots = Math.max(0, ownedSlots - 1)
    if (!top.live) continue
    top.live = false
    try {
      top.close()
    } catch {
      /* 닫기 콜백 오류는 스택 정리를 막지 않는다 */
    }
  }
}

let balanceQueued = false
function scheduleBalance() {
  if (balanceQueued) return
  balanceQueued = true
  queueMicrotask(() => {
    balanceQueued = false
    let k = 0
    while (entries.length && !entries[entries.length - 1].live) {
      if (entries.pop()!.hasSlot) k++
    }
    if (k > ownedSlots) k = ownedSlots // 소유한 칸을 넘어 되감으면 앱 진입 이전으로 나간다
    if (k > 0) {
      ownedSlots -= k
      try {
        window.history.go(-k)
      } catch {
        /* history 조작 불가 환경 */
      }
    }
  })
}

function init() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  window.addEventListener('popstate', handlePop)

  // ⓑ __layer 토큰 보존 — 호출자가 직접 주지 않으면 현재 항목의 토큰을 얹어 준다
  try {
    const raw = window.history.replaceState.bind(window.history)
    window.history.replaceState = function (state: unknown, unused: string, url?: string | URL | null) {
      let next = state
      if (!(state && typeof state === 'object' && '__layer' in (state as object))) {
        const cur = currentLayerId()
        if (cur) next = { ...((state as object | null) ?? {}), __layer: cur }
      }
      return raw(next as never, unused, url as never)
    } as typeof window.history.replaceState
  } catch {
    /* history를 재정의할 수 없는 환경 — 뒤로가기 닫기는 그대로 동작한다 */
  }

  // 새로고침·bfcache로 예전 세션의 토큰이 남아 있으면 그 위에서 시작 — 아니면 '현재보다 위' 판정이 영영 성립하지 않는다
  seq = Math.max(seq, currentLayerId())
}

function pushEntry(layer: Layer) {
  const top = entries.length ? entries[entries.length - 1] : null
  // 죽은 꼬리가 바로 현재 위치면 그 칸을 재사용 — 유령 칸이 생기지 않는다
  if (top && !top.live && currentLayerId() === top.id) {
    entries.pop()
    layer.hasSlot = top.hasSlot
    entries.push(layer)
    try {
      window.history.replaceState({ __layer: layer.id }, '')
    } catch {
      /* 무시 */
    }
    return
  }
  entries.push(layer)
  try {
    window.history.pushState({ __layer: layer.id }, '')
    layer.hasSlot = true
    ownedSlots++
  } catch {
    /* ⓒ 칸을 못 잡았다 — hasSlot=false 유지 */
  }
}

/** 오버레이 한 겹을 연다. @returns disposer — 프로그램적으로 닫을 때 호출하면 history를 균형 있게 정리 */
export function pushLayer(close: CloseFn): () => void {
  init()
  const id = ++seq
  const layer: Layer = { id, close, live: true, hasSlot: false }
  pushEntry(layer)
  let disposed = false
  return () => {
    if (disposed) return
    disposed = true
    const l = entries.find((e) => e.id === id)
    if (!l || !l.live) return // 이미 뒤로가기로 소비됨
    l.live = false
    scheduleBalance()
  }
}

/** `open`인 동안 뒤로가기가 이 오버레이만 닫는다. 모달·시트는 이 훅 한 줄로 끝. */
export function useBackClose(open: boolean, onClose: CloseFn): void {
  const ref = useRef(onClose)
  ref.current = onClose
  useEffect(() => {
    if (!open) return
    return pushLayer(() => ref.current())
  }, [open])
}
