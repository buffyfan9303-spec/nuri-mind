import { EMOJI_CODES, EMOJI_DIR } from '../data/emojiManifest'

/**
 * 이모지 → Fluent Flat SVG 주소(public/emoji/v1). 컴포넌트(<Emoji>)와 캔버스(공유 카드)가 함께 쓴다.
 * 목록은 scripts/emoji-sync.mjs 가 만든 data/emojiManifest.ts — 목록에 없으면 null(기기 글꼴로 그릴 것).
 */

/** 코드 → 파일명(손그림은 'custom-이름'). 첫 사용 때 한 번만 푼다 */
let TABLE: Map<string, string> | null = null
const table = () => {
  if (!TABLE) {
    TABLE = new Map()
    for (const tok of EMOJI_CODES.split(' ')) {
      const eq = tok.indexOf('=')
      if (eq < 0) TABLE.set(tok, tok)
      else TABLE.set(tok.slice(0, eq), tok.slice(eq + 1))
    }
  }
  return TABLE
}

/** 파일명 코드 — 코드포인트 소문자 16진수를 '-'로 잇고 FE0F/FE0E(표시 선택자)는 뺀다. ❤️ → '2764' */
export function emojiCode(e: string): string {
  const out: string[] = []
  for (const ch of e) {
    const cp = ch.codePointAt(0)!
    if (cp !== 0xfe0f && cp !== 0xfe0e) out.push(cp.toString(16))
  }
  return out.join('-')
}

/** 그 이모지의 SVG 주소 — 목록에 없으면 null(기기 글꼴로 그릴 것) */
export function emojiSrc(e: string): string | null {
  const f = table().get(emojiCode(e))
  return f ? `${EMOJI_DIR}${f}.svg` : null
}
