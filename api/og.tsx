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
  // 퀵 대결: 이모지 직접 전달(한글 결과명은 메타에만).
  // 글자 수 제한 — 안 자르면 우리 도메인 OG 이미지에 임의 문구를 168px로 찍어 주는 셈이다(사칭 공유 카드).
  const eRaw = searchParams.get('e')
  const eParam = eRaw ? Array.from(eRaw).slice(0, 8).join('') : null
  const name = eParam ? 'QUIZ' : NAME[tid] || 'Psych'
  const emoji = eParam || EMOJI[tid] || '🧠'
  // p가 없으면(퀵 대결) Number(null)=0 → 'TOP 100%'가 찍혔다. 없음은 없음으로, 범위는 0~100으로.
  const pStr = searchParams.get('p')
  const pRaw = pStr == null || pStr.trim() === '' ? NaN : Number(pStr)
  const top = Number.isFinite(pRaw) ? Math.max(0.5, Math.round((100 - Math.min(100, Math.max(0, pRaw))) * 10) / 10) : null

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
        <div style={{ display: 'flex', fontSize: 66, fontWeight: 800, marginTop: 8 }}>{name} DUEL 🆚</div>
        {top != null ? (
          <div style={{ display: 'flex', fontSize: 44, marginTop: 16, opacity: 0.92 }}>TOP {top}%</div>
        ) : null}
        <div style={{ display: 'flex', fontSize: 30, marginTop: 40, opacity: 0.82 }}>NURI MIND · nurimind.co.kr</div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
