import { Link } from 'react-router-dom'
import { useL } from '../i18n/useT'
import BizInfo from './BizInfo'

/**
 * 사이트 푸터 — 서비스 소개 + 법적 고지 + 사업자 정보.
 * AdSense/검색엔진이 보는 신뢰 시그널(운영 주체·연락처·정책 링크)이자 실질 콘텐츠.
 */
export default function Footer() {
  const l = useL()
  return (
    <footer className="mt-10 border-t border-line pb-4 pt-6 text-center">
      <p className="px-4 text-[12px] font-bold leading-relaxed text-ink-faint">
        {l({
          ko: '누리 마인드는 로젠버그 자존감 척도(RSES)·ASRS·CD-RISC 등 공개 심리 척도를 바탕으로 만든 자기이해 검사 12종과 심리 매거진, 리워드를 제공하는 심리 콘텐츠 서비스입니다. 모든 결과는 자기 성찰을 돕는 참고 자료이며 의학적 진단을 대신하지 않습니다.',
          en: 'Nuri Mind offers 12 self-understanding tests built on public psychological scales (RSES, ASRS, CD-RISC and more), a psychology magazine, and rewards. Results support self-reflection and are not a medical diagnosis.',
          ja: 'ヌリマインドはRSES・ASRS・CD-RISCなど公開心理尺度に基づく12種の自己理解検査と心理マガジン、リワードを提供します。結果は自己省察の参考であり医学的診断ではありません。',
        })}
      </p>
      {/* 버튼이 아니라 <a href>(Link) — 크롤러는 버튼을 따라가지 않아 공개 페이지가 발견되지 않는다.
          링크 글자는 21px 높이뿐 — before로 위아래 12px씩 넓혀 44px 히트영역(줄 간격·모양은 그대로) */}
      <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 px-4 text-[13px] font-extrabold text-ink-sub">
        <Link to="/about" className="relative before:absolute before:-inset-x-1 before:-inset-y-3 before:content-['']">{l({ ko: '서비스 소개', en: 'About', ja: 'サービス紹介' })}</Link>
        <span className="text-line">|</span>
        <Link to="/legal/terms" className="relative before:absolute before:-inset-x-1 before:-inset-y-3 before:content-['']">{l({ ko: '이용약관', en: 'Terms', ja: '利用規約' })}</Link>
        <span className="text-line">|</span>
        <Link to="/legal/privacy" className="relative before:absolute before:-inset-x-1 before:-inset-y-3 before:content-['']">{l({ ko: '개인정보처리방침', en: 'Privacy', ja: 'プライバシー' })}</Link>
        <span className="text-line">|</span>
        <Link to="/magazine" className="relative before:absolute before:-inset-x-1 before:-inset-y-3 before:content-['']">{l({ ko: '심리 매거진', en: 'Magazine', ja: 'マガジン' })}</Link>
      </nav>
      <BizInfo className="mt-4 px-4" />
    </footer>
  )
}
