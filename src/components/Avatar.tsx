import type { Avatar as AvatarT } from '../data/types'
// ⚠️ 무거운 animalTranslations(185KB) 대신 경량 비주얼 모듈 — Avatar는 메인 번들에 포함되므로
import { PERSONA_VISUAL } from '../i18n/personaVisual'

/** 프로필 아바타 — 업로드 사진 / 동물 페르소나 / 기본(🧠) */
export default function Avatar({
  avatar,
  size = 64,
  emojiScale = 0.5,
  className = '',
}: {
  avatar: AvatarT
  size?: number
  emojiScale?: number
  className?: string
}) {
  const px = { width: size, height: size }

  if (avatar?.kind === 'photo') {
    return (
      <img
        src={avatar.dataUrl}
        alt=""
        decoding="async"
        loading="lazy"
        className={`shrink-0 rounded-full object-cover shadow-card ${className}`}
        style={px}
      />
    )
  }

  if (avatar?.kind === 'animal') {
    const p = PERSONA_VISUAL[avatar.persona] ?? { emoji: '🐾', grad: ['#9BC4B2', '#8FB8E8'] as [string, string] }
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full shadow-card ${className}`}
        style={{ ...px, background: `linear-gradient(135deg, ${p.grad[0]}, ${p.grad[1]})` }}
      >
        <span style={{ fontSize: size * emojiScale }}>{p.emoji}</span>
      </div>
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full shadow-card ${className}`}
      style={{ ...px, background: 'linear-gradient(135deg, #9BC4B2, #8FB8E8)' }}
    >
      <span style={{ fontSize: size * emojiScale }}>🧠</span>
    </div>
  )
}
