import { Link } from 'react-router-dom'
import { Card, TopBar } from '../components/ui'
import Footer from '../components/Footer'
import { TESTS } from '../data/tests'
import { ARTICLES } from '../data/magazine'
import { COMPANY, CONTACT_EMAIL, CONTACT_PHONE, MAIL_ORDER_NO } from '../data/company'
import { useStore } from '../store/useStore'
import { useT, useL } from '../i18n/useT'
import { usePageMeta } from '../hooks/usePageMeta'
import Emoji from '../components/Emoji'

/**
 * 서비스 소개(About) — 누가·무엇을·어떤 근거로 만드는지와 운영 주체·문의처.
 * 광고 심사·검색엔진이 '운영 주체가 분명한 사이트인가'를 보는 자리라 가입 없이 열린다(App PUBLIC_ROUTES).
 * ⚠️ 사실만 쓴다 — 수치는 전부 데이터에서 센다(검사 수·글 수). 수상·이용자 수 같은 주장은 넣지 않는다.
 * 광고 없음(정보·정책 성격의 화면).
 */
export default function About() {
  const t = useT()
  const l = useL()
  const onboarded = useStore((s) => s.onboarded)
  const selfTests = TESTS.filter((x) => !x.precision)
  const taskTests = TESTS.filter((x) => x.precision)

  usePageMeta({
    title: '서비스 소개 | 누리 마인드',
    description: `누리 마인드는 공개 심리 척도를 바탕으로 한 자기이해 검사 ${selfTests.length}종·직접 풀어 보는 인지 과제 ${taskTests.length}종과 심리 매거진을 제공합니다. 운영: ${COMPANY.name}.`,
    path: '/about',
  })

  // 항목 이름만 번역한다 — 값(상호·주소·업태)은 사업자등록증의 공식 표기라 원문 그대로 둔다
  const rows: [string, string][] = [
    [l({ ko: '상호', en: 'Company', ja: '商号' }), COMPANY.name],
    [l({ ko: '대표자', en: 'CEO', ja: '代表者' }), COMPANY.ceo],
    [l({ ko: '사업자등록번호', en: 'Business reg. no.', ja: '事業者登録番号' }), `${COMPANY.bizNo} (${COMPANY.taxType})`],
    [l({ ko: '사업장 소재지', en: 'Address', ja: '所在地' }), COMPANY.address],
    [l({ ko: '업태 / 종목', en: 'Business type', ja: '業態 / 種目' }), `${COMPANY.bizType} / ${COMPANY.bizItems}`],
    [l({ ko: '개업일', en: 'Founded', ja: '開業日' }), COMPANY.openedAt.replace(/-/g, '.')],
    ...(MAIL_ORDER_NO
      ? ([[l({ ko: '통신판매업 신고번호', en: 'Mail-order reg. no.', ja: '通信販売業届出番号' }), MAIL_ORDER_NO]] as [string, string][])
      : []),
    ...(CONTACT_PHONE ? ([[l({ ko: '전화', en: 'Phone', ja: '電話' }), CONTACT_PHONE]] as [string, string][]) : []),
  ]

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back={onboarded ? '/profile' : '/'} title={l({ ko: '서비스 소개', en: 'About', ja: 'サービス紹介' })} />
      <main className="mx-auto max-w-md px-5">
        <h1 className="mt-2 break-keep text-[24px] font-extrabold leading-tight tracking-tight">
          {l({ ko: '누리 마인드를 소개합니다', en: 'About Nuri Mind', ja: 'ヌリマインドのご紹介' })}
        </h1>
        <p className="mt-3 break-keep text-[15px] font-bold leading-[1.8] text-ink-sub">
          {l({
            ko: '누리 마인드는 학술적으로 공개된 심리 척도와 인지 과제를 바탕으로, 지금의 나를 이해하도록 돕는 심리 콘텐츠 서비스입니다. 검사 결과는 백분위와 함께 동물 캐릭터로 풀이되고, 강점·주의할 점·오늘 해 볼 수 있는 한 걸음을 함께 안내합니다.',
            en: 'Nuri Mind is a psychology content service that helps you understand yourself, built on published psychological scales and cognitive tasks. Results come with a percentile and an animal persona, plus strengths, cautions and one small step for today.',
            ja: 'ヌリマインドは公開された心理尺度と認知課題に基づき、今の自分を理解する手助けをする心理コンテンツサービスです。結果はパーセンタイルと動物キャラクターで解説し、強み・注意点・今日の一歩を案内します。',
          })}
        </p>

        {/* 제공하는 것 — 목록은 데이터에서 그대로 */}
        <Card className="mt-5">
          <h2 className="text-[17px] font-extrabold">{l({ ko: '자기이해 검사', en: 'Self-report tests', ja: '自己理解検査' })}</h2>
          <p className="mt-1 text-[13px] font-bold text-ink-faint">
            {l({ ko: `${selfTests.length}종 · 스스로 답하는 설문형`, en: `${selfTests.length} tests · self-report`, ja: `${selfTests.length}種・自己回答式` })}
          </p>
          <ul className="mt-3 space-y-3">
            {selfTests.map((x) => (
              <li key={x.id}>
                <Link to={`/test/${x.id}`} className="text-[15px] font-extrabold text-mind-700 underline-offset-2 hover:underline">
                  <Emoji e={x.emoji} inline />{t(`test.${x.id}.name`)}
                </Link>
                <p className="mt-0.5 break-keep text-[13px] font-bold leading-relaxed text-ink-sub">{t(`intro.${x.id}.basis`)}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="mt-4">
          <h2 className="text-[17px] font-extrabold">{l({ ko: '직접 풀어 보는 인지 과제', en: 'Cognitive tasks', ja: '認知課題' })}</h2>
          <p className="mt-1 text-[13px] font-bold text-ink-faint">
            {l({ ko: `${taskTests.length}종 · 정답이 있는 과제형`, en: `${taskTests.length} tasks · with right answers`, ja: `${taskTests.length}種・正解のある課題` })}
          </p>
          <ul className="mt-3 space-y-3">
            {taskTests.map((x) => (
              <li key={x.id}>
                <Link to={`/test/${x.id}`} className="text-[15px] font-extrabold text-mind-700 underline-offset-2 hover:underline">
                  <Emoji e={x.emoji} inline />{t(`test.${x.id}.name`)}
                </Link>
                <p className="mt-0.5 break-keep text-[13px] font-bold leading-relaxed text-ink-sub">{t(`intro.${x.id}.basis`)}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="mt-4">
          <h2 className="text-[17px] font-extrabold">{l({ ko: '심리 매거진', en: 'Psychology magazine', ja: '心理マガジン' })}</h2>
          <p className="mt-1 break-keep text-[13px] font-bold text-ink-faint">
            {l({
              ko: `집중력·번아웃·애착·자존감 같은 마음 상태를 짧게 풀어 쓴 글 ${ARTICLES.length}편`,
              en: `${ARTICLES.length} short reads on focus, burnout, attachment, self-esteem and more`,
              ja: `集中・燃え尽き・愛着・自尊心などを短く解説した記事${ARTICLES.length}本`,
            })}
          </p>
          <ul className="mt-3 space-y-2">
            {ARTICLES.map((a) => (
              <li key={a.id}>
                <Link to={`/magazine/${a.id}`} className="break-keep text-[14px] font-extrabold text-mind-700 underline-offset-2 hover:underline">
                  <Emoji e={a.emoji} inline />{l(a.title)}
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* 결과를 대하는 태도 + 도움 받을 곳 */}
        <Card className="mt-4">
          <h2 className="text-[17px] font-extrabold">{l({ ko: '결과를 볼 때 알아 둘 점', en: 'Before you read results', ja: '結果を見る前に' })}</h2>
          <p className="mt-2 break-keep text-[14px] font-bold leading-[1.8] text-ink-sub">
            {l({
              ko: '모든 검사는 자기 성찰을 돕는 참고 자료이며 의학적 진단을 대신하지 않습니다. 결과가 걱정되거나 일상이 힘들다면 정신건강의학과 전문의나 상담 전문가와 이야기해 보세요. 마음이 급하게 힘들 땐 자살예방 상담전화 109, 정신건강 위기상담전화 1577-0199에서 24시간 도움을 받을 수 있습니다.',
              en: 'All tests are for self-reflection and are not a medical diagnosis. If results worry you or daily life feels hard, please talk to a mental-health professional. In Korea, crisis lines 109 and 1577-0199 are available 24/7.',
              ja: 'すべての検査は自己省察のための参考資料であり、医学的診断ではありません。結果が心配な時や日常がつらい時は専門家に相談してください。韓国では危機相談電話109、1577-0199が24時間対応しています。',
            })}
          </p>
        </Card>

        {/* 운영 주체 — data/company.ts 한 곳에서 */}
        <Card className="mt-4">
          <h2 className="text-[17px] font-extrabold">{l({ ko: '운영 정보', en: 'Operator', ja: '運営情報' })}</h2>
          <dl className="mt-3 space-y-2">
            {rows.map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-[6.5rem] shrink-0 text-[13px] font-extrabold text-ink-faint">{k}</dt>
                <dd className="min-w-0 flex-1 break-keep text-[13px] font-bold leading-relaxed text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* 문의 — 전자우편이 비어 있으면 그 줄을 숨기고, 개인정보 문의처(처리방침의 보호책임자 안내)로 안내한다 */}
        <Card className="mt-4" >
          <h2 className="text-[17px] font-extrabold">{l({ ko: '문의', en: 'Contact', ja: 'お問い合わせ' })}</h2>
          {CONTACT_EMAIL && (
            <p className="mt-2 text-[14px] font-bold text-ink">
              {l({ ko: '전자우편', en: 'Email', ja: 'メール' })}{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-extrabold text-mind-700 underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>
            </p>
          )}
          <p className="mt-2 break-keep text-[14px] font-bold leading-relaxed text-ink-sub">
            {l({
              ko: '개인정보 관련 문의·열람·정정·삭제 요청은 개인정보처리방침의 ‘개인정보 보호책임자’ 안내를 참고해 주세요.',
              en: 'For privacy requests (access, correction, deletion), see the Privacy Officer section of our Privacy Policy.',
              ja: '個人情報に関するお問い合わせは、プライバシーポリシーの「個人情報保護責任者」をご参照ください。',
            })}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px] font-extrabold text-mind-700">
            <Link to="/legal/privacy" className="py-1">{l({ ko: '개인정보처리방침', en: 'Privacy', ja: 'プライバシー' })}</Link>
            <Link to="/legal/terms" className="py-1">{l({ ko: '이용약관', en: 'Terms', ja: '利用規約' })}</Link>
          </div>
        </Card>

        {/* 오픈소스 라이선스(아이콘 MIT·글꼴 OFL)는 화면 고지 의무가 없다 — 원문은 public/emoji·public/fonts의
            LICENSE 파일로 에셋과 함께 배포해 조건을 충족한다(운영자 결정: 화면 표기는 두지 않음) */}
        <Footer />
      </main>
    </div>
  )
}
