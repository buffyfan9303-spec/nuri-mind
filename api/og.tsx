import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

// 결과 대결 동적 OG 이미지(1200×630). 한글 폰트 미로딩 이슈 회피용으로 영문+이모지+숫자만 사용.
const NAME: Record<string, string> = {
  iq: 'IQ', adhd: 'Focus', ego: 'Altruism', love: 'Attachment',
  burnout: 'Burnout', dopamine: 'Dopamine', resilience: 'Resilience', dark: 'Dark Triad',
  selfesteem: 'Self-Esteem', perfect: 'Perfectionism', efficacy: 'Self-Efficacy', socialanx: 'Social Anxiety',
  memory: 'Memory', focus: 'Focus', speed: 'Speed', spatial: 'Spatial',
}
const EMOJI: Record<string, string> = {
  iq: '🧠', adhd: '🎯', ego: '😇', love: '💘', burnout: '🔥', dopamine: '🍫',
  resilience: '🌱', dark: '🦊', selfesteem: '🪞', perfect: '💯', efficacy: '💪', socialanx: '😰', memory: '🧩', focus: '🎯', speed: '⚡', spatial: '🧭',
}

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url)
  const tid = searchParams.get('t') || ''
  const eParam = searchParams.get('e') // 퀵 대결: 이모지 직접 전달(한글 결과명은 메타에만)
  const unse = searchParams.get('k') === 'unse' // 띠별 오늘의 운세 랜딩용
  const name = eParam ? 'QUIZ' : NAME[tid] || 'Psych'
  const emoji = eParam || EMOJI[tid] || '🧠'
  const title = unse ? "TODAY'S FORTUNE 🔮" : `${name} DUEL 🆚`
  const pRaw = Number(searchParams.get('p'))
  const top = !unse && Number.isFinite(pRaw) ? Math.max(0.5, Math.round((100 - pRaw) * 10) / 10) : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg,#6E7BF2,#A88BF2)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 168 }}>{emoji}</div>
        <div style={{ display: 'flex', fontSize: 66, fontWeight: 800, marginTop: 8 }}>{title}</div>
        {top != null ? (
          <div style={{ display: 'flex', fontSize: 44, marginTop: 16, opacity: 0.92 }}>TOP {top}%</div>
        ) : null}
        <div style={{ display: 'flex', fontSize: 30, marginTop: 40, opacity: 0.82 }}>NURI MIND · nurimind.co.kr</div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
