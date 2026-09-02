import { useEffect, useState } from 'react'
import { SPRING } from '../lib/motion'
import { AnimatePresence, motion } from 'framer-motion'
import { canInstall, onInstallable, promptInstall } from '../lib/pwa'
import { useL } from '../i18n/useT'

const DISMISS_KEY = 'nuri-pwa-dismissed'

/** '홈 화면에 앱 설치' 하단 배너 — 설치 가능 + 미해제일 때만. 한 번 닫으면 다시 안 띄움. */
export default function InstallPrompt() {
  const l = useL()
  const [installable, setInstallable] = useState(canInstall())
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => onInstallable(setInstallable), [])

  const close = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }
  const install = async () => {
    const ok = await promptInstall()
    if (ok) close()
    else setDismissed(true)
  }

  // 조기 return 대신 AnimatePresence 내부 조건부 — exit(슬라이드아웃) 애니메이션이 실제로 재생되도록
  return (
    <AnimatePresence>
      {installable && !dismissed && (
      <motion.div
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 90, opacity: 0 }}
        transition={SPRING.ui}
        className="fixed inset-x-3 bottom-[84px] z-50 mx-auto flex max-w-md items-center gap-3 rounded-3xl border border-line bg-surface px-4 py-3 shadow-pop"
      >
        <span className="text-[24px] leading-none">📲</span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold">{l({ ko: '홈 화면에 앱 설치', en: 'Install the app', ja: 'ホームに追加' })}</p>
          <p className="truncate text-[12px] font-medium text-ink-faint">{l({ ko: '바로 열리고, 오프라인에서도 돼요', en: 'One tap · works offline', ja: 'ワンタップ・オフラインOK' })}</p>
        </div>
        <button onClick={install} className="shrink-0 rounded-full bg-mind-500 px-4 py-2 text-[13px] font-semibold text-white">
          {l({ ko: '설치', en: 'Install', ja: '追加' })}
        </button>
        <button onClick={close} aria-label="close" className="-mr-2 inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-[17px] font-bold text-ink-faint">
          ✕
        </button>
      </motion.div>
      )}
    </AnimatePresence>
  )
}
