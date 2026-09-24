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

/** 2026-09-25 게시 — 시행 2026-10-05(게시일로부터 10일) */
const PRIVACY_NOTICE = `누리 마인드 개인정보처리방침이 아래와 같이 바뀝니다.

· 공지일: 2026년 9월 25일
· 시행일: 2026년 10월 5일

주요 변경 내용
1. 수집 항목을 구체적으로 적었습니다: 커뮤니티 게시물(닉네임·글), AI 해석을 요청할 때 보내는 입력값(이름은 보내지 않음), 알림 구독 정보, 오류 기록. 심리검사 결과와 운세 입력값은 이용자 기기에만 저장되며 AI 해석을 요청할 때만 전송된다는 점을 밝혔습니다.
2. 처리를 맡기는 회사(수탁자)를 실제 이용 중인 곳으로 명시했습니다: Supabase, Vercel, 카카오, Anthropic 또는 Google(AI 해석), Sentry(오류 진단), Google(이용 통계·광고).
3. 국외 이전 사항(이전받는 자·국가·항목·목적·보유 기간·거부 방법)을 구체적으로 적었습니다.
4. 계정 삭제 시 즉시 삭제되는 정보와 절차를 추가했습니다.
5. 가입할 때 만 14세 이상임을 확인합니다.

시행일부터 개정 전문이 이 페이지에 게시되며, 기존 이용자께는 다시 동의를 요청드립니다.
문의: 개인정보 보호책임자(buffyfan9303@gmail.com)`

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
        {!isTerms && (
          // 개정 사전 공지(방침 제17조: 시행 7일 전부터 공지) — 시행일에 개정본이 배포되면 이 카드는 함께 사라진다
          <Card className="mt-3 border-2 border-mind-300">
            <h2 className="text-[15px] font-extrabold">개인정보처리방침 개정 안내</h2>
            <p className="mt-2 whitespace-pre-line text-[13px] font-medium leading-[1.8] text-ink-sub">{PRIVACY_NOTICE}</p>
          </Card>
        )}
        <Card className="mt-3">
          <p className="whitespace-pre-line text-[14px] font-medium leading-[1.85] text-ink">
            {isTerms ? TERMS : PRIVACY}
          </p>
        </Card>
      </main>
    </div>
  )
}
