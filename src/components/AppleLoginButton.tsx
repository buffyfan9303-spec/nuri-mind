import { APPLE_SIGNIN_ENABLED } from '../data/features'
import { signInWithApple } from '../lib/auth'
import { useL } from '../i18n/useT'

/**
 * Sign in with Apple — 카카오 로그인 버튼이 있는 모든 자리에 함께 둔다(Apple 4.8: 동등한 로그인 선택지).
 * 스위치(APPLE_SIGNIN_ENABLED)가 꺼져 있으면 아무것도 그리지 않는다.
 * Apple 가이드라인상 검은 바탕·흰 글자·Apple 로고 형태를 따른다.
 */
export default function AppleLoginButton({ className = '' }: { className?: string }) {
  const l = useL()
  if (!APPLE_SIGNIN_ENABLED) return null
  return (
    <button
      onClick={async () => {
        const r = await signInWithApple()
        if (!r.ok) alert(l({ ko: 'Apple 로그인을 준비 중이에요. 잠시 후 다시 시도해 주세요.', en: 'Sign in with Apple is being set up. Please try again later.', ja: 'Appleでサインインは準備中です。後ほどお試しください。' }))
      }}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-3.5 text-[15px] font-extrabold text-white shadow-card ${className}`}
    >
      <svg aria-hidden viewBox="0 0 384 512" className="h-[18px] w-[18px] fill-current">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
      </svg>
      {l({ ko: 'Apple로 계속하기', en: 'Continue with Apple', ja: 'Appleで続ける' })}
    </button>
  )
}
