import { LEGAL_VERSION } from '../../data/legal'
import { setSoundEnabled } from '../../lib/sound'
import type { Avatar, Lang } from '../../data/types'

/**
 * 설정/계정 슬라이스 — 테마·언어·사운드·글자크기·닉네임·아바타·온보딩·동의.
 * 경제(포인트/다이아/원장)·검사와 전혀 얽히지 않아 가장 안전하게 먼저 분리한 슬라이스.
 * useStore의 persist set을 그대로 받아 동작은 기존과 100% 동일(필드명·persist 키 불변).
 *
 * 나머지 도메인(economy/test/social/content/league/admin)도 동일 패턴으로 분리한다.
 * 단, 그 슬라이스들은 공통 grantFree/freeLeft 클로저를 공유하므로 helpers를 함께 주입하고
 * 라이브 경제 회귀검증을 거쳐 점진 적용한다.
 */
export interface SettingsActions {
  setLang: (l: Lang) => void
  setSound: (v: boolean) => void
  setAmbient: (v: boolean) => void
  setTheme: (v: 'light' | 'dark') => void
  setFontScale: (v: number) => void
  setNotify: (v: boolean) => void
  setNickname: (n: string) => void
  setAvatar: (a: Avatar) => void
  completeOnboarding: (nickname: string, avatar: Avatar) => void
  acceptConsent: () => void
  setBirthDate: (d: string) => void
}

/** persist set (Partial<State> 패치) — 슬라이스 내부는 set의 형태만 알면 충분하므로 any로 느슨하게 받는다. */
type Patch = (partial: any) => void

const today = () => new Date().toISOString().slice(0, 10)

export const createSettingsSlice = (set: Patch): SettingsActions => ({
  setLang: (lang) => set({ lang }),
  setSound: (sound) => {
    setSoundEnabled(sound)
    set({ sound })
  },
  setAmbient: (ambient) => set({ ambient }),
  setTheme: (theme) => set({ theme }),
  setFontScale: (fontScale) => set({ fontScale: Math.min(1.3, Math.max(0.9, fontScale)) }),
  setNotify: (notify) => set({ notify }),
  setNickname: (nickname) => set({ nickname: nickname.slice(0, 12) || '누리' }),
  setAvatar: (avatar) => set({ avatar }),
  completeOnboarding: (nickname, avatar) =>
    set({ nickname: nickname.trim().slice(0, 12) || '친구', avatar, onboarded: true, consent: { v: LEGAL_VERSION, at: today() } }),
  acceptConsent: () => set({ consent: { v: LEGAL_VERSION, at: today() } }),
  setBirthDate: (birthDate) => set({ birthDate }),
})
