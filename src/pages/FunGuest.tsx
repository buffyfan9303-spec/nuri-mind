import { useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui'
import Button from '../components/Button'
import { useL } from '../i18n/useT'
import { localDay } from '../lib/date'

/**
 * 비회원 맛보기(별자리·타로·꿈해몽 공용).
 * 입력한 이름·생일은 **컴포넌트 state에만** 있다 — 스토어·localStorage·서버 어디에도 남기지 않는다.
 * 유일한 예외: '가입하고 전체 보기'를 누른 순간 이름을 sessionStorage에 한 번 넘겨 가입 화면 닉네임 칸을 채운다
 * (Onboarding이 읽자마자 지운다).
 */
export interface GuestInfo {
  name: string
  birth: string
}

/** Onboarding.tsx의 PREFILL_KEY와 같은 문자열이어야 한다 */
const PREFILL_KEY = 'nuri-mind-prefill-nick'

export function GuestForm({ title, onDone }: { title: string; onDone: (g: GuestInfo) => void }) {
  const l = useL()
  const [name, setName] = useState('')
  const [birth, setBirth] = useState('')
  const nameId = useId()
  const birthId = useId()
  const ok = name.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(birth)
  const input = 'min-h-[48px] w-full rounded-2xl border-2 border-line bg-surface px-3.5 text-[15px] font-bold outline-none focus:border-mind-400'
  return (
    <Card className="mt-5">
      <h2 className="break-keep text-[16px] font-extrabold">{title}</h2>
      <label htmlFor={nameId} className="mt-4 block text-[13px] font-extrabold text-ink-sub">{l({ ko: '이름(닉네임)', en: 'Name (nickname)', ja: '名前（ニックネーム）' })}</label>
      <input id={nameId} value={name} onChange={(e) => setName(e.target.value)} maxLength={12} autoComplete="off" className={`mt-1.5 ${input}`} placeholder={l({ ko: '예: 누리', en: 'e.g. Nuri', ja: '例：ヌリ' })} data-testid="guest-name" />
      <label htmlFor={birthId} className="mt-3 block text-[13px] font-extrabold text-ink-sub">{l({ ko: '생년월일', en: 'Date of birth', ja: '生年月日' })}</label>
      <input id={birthId} type="date" value={birth} onChange={(e) => setBirth(e.target.value)} min="1900-01-01" max={localDay()} className={`mt-1.5 ${input}`} data-testid="guest-birth" />
      <p className="mt-2 break-keep text-[11px] font-bold text-ink-faint">{l({ ko: '입력한 정보는 저장되지 않고 이 화면에서만 쓰여요', en: 'Not saved — only used on this screen', ja: '入力内容は保存されず、この画面でのみ使われます' })}</p>
      <div className="mt-4">
        <Button disabled={!ok} onClick={() => ok && onDone({ name: name.trim(), birth })}>{l({ ko: '운세 보기', en: 'See my reading', ja: '占いを見る' })}</Button>
      </div>
    </Card>
  )
}

/** 잠긴 영역 — 흐린 가짜 줄(실제 문구는 DOM에 없다) + 가입 유도 */
export function LockedCard({ name, what }: { name?: string; what: string }) {
  const l = useL()
  const nav = useNavigate()
  const go = () => {
    if (name) {
      try {
        sessionStorage.setItem(PREFILL_KEY, name)
      } catch {
        /* 못 넘겨도 가입은 된다 */
      }
    }
    nav('/')
  }
  return (
    <div className="relative mt-3 overflow-hidden rounded-3xl bg-surface p-5 shadow-card" data-testid="locked-card">
      <div aria-hidden className="space-y-2.5 blur-[3px]">
        {[92, 78, 85, 64].map((w) => (
          <div key={w} className="h-3 rounded-full bg-line" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="mt-4 text-center">
        <p className="break-keep text-[13px] font-bold leading-relaxed text-ink-sub">{what}</p>
        <div className="mt-3">
          <Button onClick={go}>{l({ ko: '가입하고 전체 보기 (+100P)', en: 'Sign up to see it all (+100P)', ja: '登録してすべて見る（+100P）' })}</Button>
        </div>
      </div>
    </div>
  )
}
