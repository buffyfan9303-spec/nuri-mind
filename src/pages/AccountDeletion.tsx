import { Link } from 'react-router-dom'
import { Card, TopBar } from '../components/ui'
import Footer from '../components/Footer'
import { COMPANY, CONTACT_EMAIL } from '../data/company'
import { useStore } from '../store/useStore'
import { useL } from '../i18n/useT'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * 계정·데이터 삭제 안내 — Google Play '데이터 삭제' URL과 App Store 심사 노트에 적는 공개 페이지.
 * 가입 없이 열린다(App PUBLIC_ROUTES). 앱을 지운 사람도 웹에서 같은 방법으로 삭제할 수 있어야 한다.
 * 삭제 범위는 supabase/functions/delete-account 와 일치시킬 것.
 */
export default function AccountDeletion() {
  const l = useL()
  const onboarded = useStore((s) => s.onboarded)
  usePageMeta({
    title: '계정 삭제 안내 | 누리 마인드',
    description: `${COMPANY.serviceName} 계정과 데이터를 삭제하는 방법, 삭제되는 정보와 보관 기간을 안내합니다.`,
    path: '/account-deletion',
  })

  const steps = [
    l({ ko: '앱 또는 웹(www.nurimind.co.kr)에서 카카오로 로그인합니다.', en: 'Sign in with Kakao in the app or on the web (www.nurimind.co.kr).', ja: 'アプリまたはウェブ（www.nurimind.co.kr）でカカオログインします。' }),
    l({ ko: '아래 탭의 [프로필]로 이동합니다.', en: 'Open the [Profile] tab.', ja: '下のタブの［プロフィール］を開きます。' }),
    l({ ko: '[계정 삭제]를 누르고 확인하면 즉시 삭제됩니다.', en: 'Tap [Delete account] and confirm — deletion is immediate.', ja: '［アカウント削除］を押して確認すると、すぐに削除されます。' }),
  ]

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back={onboarded ? '/profile' : '/'} title={l({ ko: '계정 삭제 안내', en: 'Account deletion', ja: 'アカウント削除のご案内' })} />
      <main className="mx-auto max-w-md space-y-4 px-5">
        <h1 className="mt-2 break-keep text-[24px] font-extrabold leading-tight tracking-tight">
          {l({ ko: `${COMPANY.serviceName} 계정 삭제`, en: 'Delete your Nuri Mind account', ja: 'ヌリマインドのアカウント削除' })}
        </h1>

        <Card>
          <h2 className="text-[17px] font-extrabold">{l({ ko: '삭제 방법', en: 'How to delete', ja: '削除方法' })}</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[14px] font-bold leading-relaxed text-ink-sub">
            {steps.map((s) => (
              <li key={s} className="break-keep">{s}</li>
            ))}
          </ol>
          <Link to="/profile" className="mt-3 inline-block text-[14px] font-extrabold text-mind-500">
            {l({ ko: '프로필로 가기 ›', en: 'Go to Profile ›', ja: 'プロフィールへ ›' })}
          </Link>
          {CONTACT_EMAIL && (
            <p className="mt-3 break-keep text-[13px] font-bold text-ink-faint">
              {l({ ko: '로그인할 수 없다면 다음 주소로 삭제를 요청해 주세요: ', en: 'If you cannot sign in, request deletion at: ', ja: 'ログインできない場合は次の宛先に削除をご依頼ください：' })}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-mind-500 underline underline-offset-2">{CONTACT_EMAIL}</a>
            </p>
          )}
        </Card>

        <Card>
          <h2 className="text-[17px] font-extrabold">{l({ ko: '삭제되는 정보', en: 'What is deleted', ja: '削除される情報' })}</h2>
          <p className="mt-2 break-keep text-[14px] font-bold leading-relaxed text-ink-sub">
            {l({
              ko: '카카오 로그인 계정 정보(닉네임), 프로필, 포인트·다이아 내역, 프리미엄 이용 기간, 우편함, 교환 신청 내역, 알림 구독, 초대 기록, AI 이용 횟수. 이 기기에 저장된 해당 계정의 검사 기록도 함께 지워집니다.',
              en: 'Kakao sign-in account (nickname), profile, points & diamond history, premium period, mailbox, redemption requests, push subscriptions, referral records and AI usage counts. That account’s test history stored on the device is removed too.',
              ja: 'カカオログインのアカウント情報（ニックネーム）、プロフィール、ポイント・ダイヤ履歴、プレミアム期間、メール、交換申請、通知購読、招待記録、AI利用回数。この端末に保存された当該アカウントの検査記録も削除されます。',
            })}
          </p>
          <p className="mt-2 break-keep text-[13px] font-bold leading-relaxed text-ink-faint">
            {l({
              ko: '삭제는 즉시 처리되며 되돌릴 수 없습니다. 남은 다이아·프리미엄 기간도 함께 사라집니다. 법령상 보관 의무가 있는 거래 기록이 생기는 경우 해당 기간 동안만 분리 보관합니다.',
              en: 'Deletion is immediate and cannot be undone. Remaining diamonds and premium time are lost. Transaction records that must legally be kept are stored separately only for the required period.',
              ja: '削除は即時に行われ、元に戻せません。残りのダイヤ・プレミアム期間も失われます。法令上保存義務のある取引記録は、その期間のみ分離保管します。',
            })}
          </p>
        </Card>

        <Card>
          <h2 className="text-[17px] font-extrabold">{l({ ko: '커뮤니티 글', en: 'Community posts', ja: 'コミュニティ投稿' })}</h2>
          <p className="mt-2 break-keep text-[14px] font-bold leading-relaxed text-ink-sub">
            {l({
              ko: '커뮤니티 글·댓글은 계정이 아니라 기기에 연결된 익명 글이라 계정 삭제로 함께 지워지지 않습니다. 계정을 삭제하기 전에 [커뮤니티]에서 내 글을 직접 삭제해 주세요.',
              en: 'Community posts and comments are anonymous and tied to the device, not the account, so account deletion does not remove them. Please delete your posts in [Community] first.',
              ja: 'コミュニティの投稿・コメントはアカウントではなく端末に紐づく匿名投稿のため、アカウント削除では消えません。先に［コミュニティ］でご自身の投稿を削除してください。',
            })}
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
