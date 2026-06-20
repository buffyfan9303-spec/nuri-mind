/** 결과 공유 카드 — 캔버스로 "심리 동물" 카드 PNG 생성 (바이럴 루프 핵심) */

export interface CardSpec {
  emoji: string
  name: string
  title: string
  topPercent: number
  testName: string
  grad: [string, string]
  iq?: number
  /** 정밀검사 지수 칩 (예: "MQ 114", "FQ 120") — iq처럼 상위%와 묶여 표시 */
  scoreChip?: string
  appName: string
  /** 페르소나 한 줄 태그라인 (따옴표 인용구) */
  subtitle?: string
  /** 결과 밴드 라벨 (예: "혼란 애착", "소진 고위험") */
  bandLabel?: string
  /** 칩 문구 오버라이드 (기본: "상위 X%") */
  chipText?: string
  /** 동물 위 라벨 오버라이드 (기본: "나의 심리 동물") — 퀵테스트 등 */
  heroLabel?: string
  /** 하단 CTA 1행 오버라이드 (기본: "너의 심리 동물은? 👀") */
  ctaTop?: string
  /** 하단 CTA 2행 오버라이드 (기본: "지금 누리 마인드에서 무료로 확인 →") */
  ctaSub?: string
  /** 이모지 대신 그릴 캐릭터 SVG(있으면 우선, 실패 시 이모지 폴백) */
  charSvg?: string
}

const FAM = 'Pretendard, Nunito, "Noto Sans JP", sans-serif'
const EMOJI_FAM = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'

/** 인라인 SVG 문자열 → 이미지(캔버스 drawImage용). 외부 참조 없는 SVG라 캔버스 오염 없음. */
function svgToImage(svg: string, size: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.width = size
    img.height = size
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** maxWidth에 맞을 때까지 폰트 크기를 줄여 반환 */
function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: number, maxSize: number, minSize: number, maxWidth: number): number {
  let size = maxSize
  while (size > minSize) {
    ctx.font = `${weight} ${size}px ${FAM}`
    if (ctx.measureText(text).width <= maxWidth) break
    size -= 2
  }
  return size
}

/** 공백 기준 줄바꿈 (태그라인용) */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur)
      cur = w
    } else {
      cur = test
    }
  }
  if (cur) lines.push(cur)
  return lines
}

/** 라운드 칩 그리기 → 다음 칩 시작 x 반환 */
function chip(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, h: number, bg: string, fg: string): number {
  ctx.font = `800 30px ${FAM}`
  const padX = 30
  const w = ctx.measureText(text).width + padX * 2
  roundRect(ctx, x, y - h / 2, w, h, h / 2)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.fillStyle = fg
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + w / 2, y + 1)
  return x + w
}

export async function makeResultCard(spec: CardSpec): Promise<Blob> {
  try {
    await (document as any).fonts?.ready
  } catch {
    /* noop */
  }
  const W = 1080
  const H = 1350
  const cx = W / 2
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!

  /* 배경 그라데이션 (대각) */
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, spec.grad[0])
  bg.addColorStop(1, spec.grad[1])
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  /* 부드러운 광배 원 */
  ctx.globalAlpha = 0.10
  ctx.fillStyle = '#FFFFFF'
  ;[[160, 200, 260], [960, 1180, 320], [980, 120, 150]].forEach(([x, y, r]) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.globalAlpha = 1

  /* 반짝이 ✦ 흩뿌리기 */
  const sparkPos: [number, number, number, number][] = [
    [150, 360, 30, 0.55], [930, 430, 22, 0.45], [220, 720, 18, 0.4],
    [880, 760, 28, 0.5], [120, 980, 20, 0.4], [960, 980, 16, 0.35],
    [540, 150, 18, 0.4], [760, 250, 14, 0.35],
  ]
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  sparkPos.forEach(([x, y, s, a]) => {
    ctx.globalAlpha = a
    ctx.font = `${s}px ${FAM}`
    ctx.fillText('✦', x, y)
  })
  ctx.globalAlpha = 1

  /* 상단 브랜드 + 검사명 */
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = `800 36px ${FAM}`
  ctx.fillText(`🧠 ${spec.appName}`, cx, 96)
  // 검사명 칩
  ctx.font = `700 30px ${FAM}`
  const tnW = ctx.measureText(spec.testName).width + 56
  roundRect(ctx, cx - tnW / 2, 140, tnW, 56, 28)
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(spec.testName, cx, 170)

  /* ── 동물 히어로 ── */
  const heroY = 440
  // 점선 궤도 2겹
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = 4
  ctx.setLineDash([3, 16])
  ctx.lineCap = 'round'
  ctx.save()
  ctx.translate(cx, heroY)
  ctx.rotate(0.35)
  ctx.beginPath()
  ctx.ellipse(0, 0, 300, 150, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.rotate(-0.7)
  ctx.beginPath()
  ctx.ellipse(0, 0, 280, 170, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
  ctx.setLineDash([])

  // 글로우 광배
  const glow = ctx.createRadialGradient(cx, heroY, 20, cx, heroY, 240)
  glow.addColorStop(0, 'rgba(255,255,255,0.92)')
  glow.addColorStop(0.55, 'rgba(255,255,255,0.45)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx, heroY, 240, 0, Math.PI * 2)
  ctx.fill()

  // 캐릭터 아트(있으면) → 실패/미존재 시 이모지 폴백
  ctx.textBaseline = 'middle'
  if (spec.charSvg) {
    try {
      const cs = 360
      const cimg = await svgToImage(spec.charSvg, cs)
      ctx.drawImage(cimg, cx - cs / 2, heroY - cs / 2, cs, cs)
    } catch {
      ctx.font = `300px ${EMOJI_FAM}`
      ctx.fillText(spec.emoji, cx, heroY + 8)
    }
  } else {
    ctx.font = `300px ${EMOJI_FAM}`
    ctx.fillText(spec.emoji, cx, heroY + 8)
  }

  /* ── 텍스트 ── */
  ctx.textBaseline = 'alphabetic'
  // 라벨
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = `800 40px ${FAM}`
  ctx.fillText(spec.heroLabel ?? '나의 심리 동물', cx, 712)
  // 동물 이름 (자동 맞춤)
  ctx.shadowColor = 'rgba(0,0,0,0.18)'
  ctx.shadowBlur = 16
  ctx.shadowOffsetY = 4
  const nameSize = fitFont(ctx, spec.name, 800, 116, 64, W - 140)
  ctx.font = `800 ${nameSize}px ${FAM}`
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(spec.name, cx, 828)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
  // 타이틀(역할)
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  const titleSize = fitFont(ctx, spec.title, 700, 44, 28, W - 160)
  ctx.font = `700 ${titleSize}px ${FAM}`
  ctx.fillText(spec.title, cx, 892)
  // 태그라인 인용구 (줄바꿈)
  if (spec.subtitle) {
    ctx.font = `600 38px ${FAM}`
    const lines = wrap(ctx, `“${spec.subtitle}”`, W - 180).slice(0, 2)
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    lines.forEach((ln, i) => ctx.fillText(ln, cx, 956 + i * 52))
  }

  /* 칩 행: 밴드 + 퍼센타일/IQ — 중앙 정렬 그룹 */
  const idxChip = spec.scoreChip ?? (spec.iq != null ? `IQ ${spec.iq}` : null)
  const hasPct = spec.chipText != null || idxChip != null || (typeof spec.topPercent === 'number' && spec.topPercent > 0)
  const chipText = spec.chipText ?? (idxChip ? `${idxChip} · 상위 ${spec.topPercent}%` : `상위 ${spec.topPercent}%`)
  const chips: [string, string, string][] = []
  if (spec.bandLabel) chips.push([spec.bandLabel, 'rgba(255,255,255,0.25)', '#FFFFFF'])
  if (hasPct) chips.push([chipText, '#FFFFFF', spec.grad[0]])
  // 총 너비 계산
  const chipH = 64
  const gap = 16
  ctx.font = `800 30px ${FAM}`
  const widths = chips.map(([txt]) => ctx.measureText(txt).width + 60)
  const totalW = widths.reduce((a, b) => a + b, 0) + gap * (chips.length - 1)
  let cxStart = cx - totalW / 2
  const chipY = 1075
  chips.forEach(([txt, b, f], i) => {
    cxStart = chip(ctx, txt, cxStart, chipY, chipH, b, f) + gap
    void i
  })

  /* 하단 CTA */
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `800 40px ${FAM}`
  ctx.fillText(spec.ctaTop ?? '너의 심리 동물은? 👀', cx, 1212)
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = `700 32px ${FAM}`
  ctx.fillText(spec.ctaSub ?? '지금 누리 마인드에서 무료로 확인 →', cx, 1268)

  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas toBlob 실패'))), 'image/png'),
  )
}

/** 공유: Web Share(파일) → 실패 시 PNG 다운로드 */
export async function shareCardBlob(blob: Blob, text: string, filename = 'nuri-mind-result.png'): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: 'image/png' })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text })
      return 'shared'
    } catch {
      /* 취소 → 다운로드 폴백 */
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
  return 'downloaded'
}
