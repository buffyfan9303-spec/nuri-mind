import { memo, useState, type CSSProperties } from 'react'
import { emojiSrc } from '../lib/emoji'

export { emojiCode, emojiSrc } from '../lib/emoji'

/**
 * 아이콘 이모지 — 기기 글꼴 대신 Fluent Emoji(Flat) SVG 파일로 그린다.
 *
 * 왜: 같은 🃏가 삼성·애플·윈도에서 전부 다르게 생겼고, 컬러 이모지 글꼴이 없는 기기(일부 리눅스·구형 PC)는
 * 흑백 윤곽선으로 나왔다. 아이콘은 앱의 얼굴이라 어느 기기에서나 같은 그림이어야 한다.
 *
 *  · 파일: public/emoji/v1/<코드>.svg — scripts/emoji-sync.mjs 가 src/에 적힌 이모지를 모아 받아 온다
 *  · 목록(emojiManifest)에 없는 이모지는 요청 자체를 하지 않고 기기 글꼴로 그린다(404 방지)
 *  · 파일이 있는데도 실패하면(오프라인 첫 방문 등) onError로 기기 글꼴에 되돌린다
 *  · 기본은 장식(alt="" + aria-hidden) — 옆 글자가 뜻을 말한다. 이모지 자체가 뜻이면 label을 준다
 *
 * ⚠️ 긴 본문·사용자 글(커뮤니티·매거진 본문) 속 이모지는 글자로 둔다 — 여기는 '아이콘'만.
 */

type Props = {
  /** 이모지 글자 한 개(결합 이모지 포함) */
  e: string
  /** px 숫자 또는 CSS 길이('1.2em' — 글자 크기를 따라가는 인라인 아이콘) */
  size?: number | string
  className?: string
  style?: CSSProperties
  /** 이모지 자체가 뜻일 때(버튼에 글자가 없을 때 등)만 — 대체 텍스트가 된다 */
  label?: string
  /**
   * 글줄 속 아이콘 — 글자 크기의 1.2배 + 한글 가운데 기준선(size를 주면 size가 우선) + 뒤 글자와 0.25em 간격.
   * 간격을 띄어쓰기(' ')가 아니라 여백으로 두는 이유: 부모가 flex면 아이콘 뒤 공백 글자가 줄 머리 공백으로 지워져
   * '⏱5분'처럼 붙는다. 그래서 inline 아이콘 뒤에는 띄어쓰기를 쓰지 않는다
   */
  inline?: boolean
}

function EmojiImpl({ e, size, className = '', style, label, inline }: Props) {
  if (size === undefined) size = inline ? '1.2em' : 20
  if (inline) className = `mr-[0.25em] align-[-0.22em] ${className}`
  const [failed, setFailed] = useState(false)
  const src = failed ? null : emojiSrc(e)
  const dim = typeof size === 'number' ? `${size}px` : size
  if (!src) {
    // 대체: 기기 글꼴 — 칸 크기는 같게 둬서 레이아웃이 흔들리지 않게
    return (
      <span
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        className={`inline-block shrink-0 text-center leading-none ${className}`}
        style={{ fontSize: dim, width: typeof size === 'number' ? dim : undefined, ...style }}
      >
        {e}
      </span>
    )
  }
  return (
    <img
      src={src}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      draggable={false}
      decoding="async"
      width={typeof size === 'number' ? size : undefined}
      height={typeof size === 'number' ? size : undefined}
      onError={() => setFailed(true)}
      className={`inline-block shrink-0 select-none ${className}`}
      style={{ width: dim, height: dim, ...style }}
    />
  )
}

const Emoji = memo(EmojiImpl)
export default Emoji

/** 이모지 한 덩어리(국기·키캡·ZWJ 결합·피부색) — scripts/emoji-sync.mjs 의 EMOJI_RE와 같다 */
const EMOJI_RE =
  /\p{Regional_Indicator}{2}|[#*0-9]️?⃣|\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?(?:‍\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?)*/gu

/**
 * 짧은 UI 문구 속 이모지를 아이콘으로 — "🥈 실버 ›", t('rank.next', { tier: '🥇 골드' }) 같은 한 줄 라벨용.
 * 글자 크기(1.2em)를 따라가고, 기준선은 한글 가운데에 맞춘다. 목록에 없는 이모지는 글자 그대로 둔다.
 * ⚠️ 긴 본문·사용자 글에는 쓰지 않는다(글 속 이모지는 글자다).
 */
export function EmojiText({ text, size = '1.2em' }: { text: string; size?: number | string }) {
  const parts: (string | JSX.Element)[] = []
  let last = 0
  let k = 0
  for (const m of text.matchAll(EMOJI_RE)) {
    const i = m.index ?? 0
    if (!emojiSrc(m[0])) continue
    // 아이콘 앞뒤 띄어쓰기는 여백으로 바꾼다(부모가 flex면 공백 글자가 지워져 붙는다 — Emoji inline 주석)
    let before = text.slice(last, i)
    const lead = before.endsWith(' ') && parts.length + before.length > 1
    if (lead) before = before.slice(0, -1)
    if (before) parts.push(before)
    let end = i + m[0].length
    const trail = text[end] === ' '
    if (trail) end++
    parts.push(<Emoji key={k++} e={m[0]} size={size} inline className={`${lead ? 'ml-[0.25em]' : ''} ${trail ? '' : '!mr-0'}`} />)
    last = end
  }
  if (!parts.length) return <>{text}</>
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}
