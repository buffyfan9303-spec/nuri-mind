import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Card, Chip, TopBar } from '../components/ui'
import { useT } from '../i18n/useT'
import { LEGAL_EFFECTIVE } from '../data/legal'
import { TERMS, PRIVACY } from '../data/legalDocs'

/**
 * 이용약관 / 개인정보처리방침 — 엔에이치홀딩스(누리 마인드) 정식본 (2026-06-23 개정 시행).
 * 사업자 정보·다이아 유료결제·프리미엄 정기결제(구독)·청약철회·미성년 보호·통계 제3자 제공(옵트인)·생년월일 민감성 조항 반영.
 * 통신판매업 신고 완료 후 신고번호를 본문/하단에 게시 예정. (워크플로 wk9i0dxi3 적대적 검토 반영)
 */

export default function Legal() {
  const { doc } = useParams<{ doc: string }>()
  const nav = useNavigate()
  const onboarded = useStore((st) => st.onboarded)
  const t = useT()
  if (doc !== 'terms' && doc !== 'privacy') return <Navigate to="/profile" replace />
  const isTerms = doc === 'terms'
  return (
    <div className="min-h-dvh pb-36">
      <TopBar back={onboarded ? '/profile' : () => nav(-1)} title={t(isTerms ? 'legal.terms' : 'legal.privacy')} />
      <main className="mx-auto max-w-md px-5">
        <Chip tone="mind">✅ {LEGAL_EFFECTIVE} 시행 · 엔에이치홀딩스</Chip>
        <Card className="mt-3">
          <p className="whitespace-pre-line text-[14px] font-medium leading-[1.85] text-ink">
            {isTerms ? TERMS : PRIVACY}
          </p>
        </Card>
      </main>
    </div>
  )
}
