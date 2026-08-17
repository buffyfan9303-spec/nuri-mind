import { useNavigate } from 'react-router-dom'
import { useL } from '../i18n/useT'

/**
 * 사이트 푸터 — 서비스 소개 + 법적 고지 + 사업자 정보.
 * AdSense/검색엔진이 보는 신뢰 시그널(운영 주체·연락처·정책 링크)이자 실질 콘텐츠.
 */
export default function Footer() {
  const l = useL()
  const nav = useNavigate()
  return (
    <footer className="mt-10 border-t border-line pb-4 pt-6 text-center">
      <p className="px-4 text-[12.5px] font-medium leading-relaxed text-ink-faint">
        {l({
          ko: '누리 마인드는 로젠버그 자존감 척도(RSES)·ASRS·CD-RISC 등 공개 심리 척도를 바탕으로 만든 자기이해 검사 12종과 심리 매거진, 리워드를 제공하는 심리 콘텐츠 서비스입니다. 모든 결과는 자기 성찰을 돕는 참고 자료이며 의학적 진단을 대신하지 않습니다.',
          en: 'Nuri Mind offers 12 self-understanding tests built on public psychological scales (RSES, ASRS, CD-RISC and more), a psychology magazine, and rewards. Results support self-reflection and are not a medical diagnosis.',
          ja: 'ヌリマインドはRSES・ASRS・CD-RISCなど公開心理尺度に基づく12種の自己理解検査と心理マガジン、リワードを提供します。結果は自己省察の参考であり医学的診断ではありません。',
        })}
      </p>
      <nav className="mt-4 flex items-center justify-center gap-4 text-[13px] font-extrabold text-ink-sub">
        <button onClick={() => nav('/legal/terms')}>{l({ ko: '이용약관', en: 'Terms', ja: '利用規約' })}</button>
        <span className="text-line">|</span>
        <button onClick={() => nav('/legal/privacy')}>{l({ ko: '개인정보처리방침', en: 'Privacy', ja: 'プライバシー' })}</button>
        <span className="text-line">|</span>
        <button onClick={() => nav('/magazine')}>{l({ ko: '심리 매거진', en: 'Magazine', ja: 'マガジン' })}</button>
      </nav>
      <p className="mt-4 px-4 text-[11px] font-medium leading-relaxed text-ink-faint">
        엔에이치홀딩스 · 대표 김윤혜 · 사업자등록번호 525-20-02937
        <br />
        경기도 남양주시 진건읍 사릉로372번길 25, 201동 1403호
        <br />
        문의 buffyfan9303@gmail.com · © {new Date().getFullYear()} NURI MIND
      </p>
    </footer>
  )
}
