import type { LikertItem } from './types'

/**
 * 회복탄력성 검사 — 20문항, 1~5 동의 척도
 *
 * 학술 기반: CD-RISC(Connor-Davidson Resilience Scale, 2003) + BRS(Brief Resilience Scale, Smith 2008)
 * 의 4개 하위 영역을 차용해 일상 시나리오로 독자 개발:
 *  BO(반등력 — 넘어져도 다시 일어남) / CT(통제감 — 내 삶을 내가 끈다)
 *  AD(유연함 — 변화 적응) / SU(관계 지지 — 기댈 곳)
 * 전 문항 긍정 진술(높을수록 건강). 점수↑ = 회복탄력성↑.
 */
export const RESILIENCE_ITEMS: LikertItem[] = [
  { id: 'rs01', sub: 'BO', text: {
    ko: '크게 실패해도, 시간이 지나면 결국 다시 일어선다',
    en: 'After a big failure, given time, I bounce back',
    ja: '大きく失敗しても、時間が経てば結局立ち直る' } },
  { id: 'rs02', sub: 'BO', text: {
    ko: '힘든 일을 겪어도 오래 무너져 있지 않는 편이다',
    en: 'After hard times I don\'t stay down for long',
    ja: 'つらいことがあっても長く沈み込まない方だ' } },
  { id: 'rs03', sub: 'BO', text: {
    ko: '스트레스 상황이 지나가면 빠르게 평소 컨디션을 되찾는다',
    en: 'Once stress passes, I quickly return to my normal self',
    ja: 'ストレス状況が過ぎれば素早く普段の調子に戻る' } },
  { id: 'rs04', sub: 'BO', text: {
    ko: '실수를 곱씹기보다, 다음에 어떻게 할지로 생각이 빨리 넘어간다',
    en: 'Rather than dwell on mistakes, I quickly move to "what next"',
    ja: 'ミスを引きずるより「次どうするか」へ早く切り替える' } },
  { id: 'rs05', sub: 'BO', text: {
    ko: '예상치 못한 나쁜 소식에도 곧 마음을 추스를 수 있다',
    en: 'Even with unexpected bad news, I can soon collect myself',
    ja: '予想外の悪い知らせにもすぐ気を取り直せる' } },
  { id: 'rs06', sub: 'CTL', text: {
    ko: '아무리 막막한 상황도 내가 할 수 있는 일부터 찾는다',
    en: 'However stuck I feel, I look for what I can do first',
    ja: 'どんなに行き詰まっても、まず自分にできることを探す' } },
  { id: 'rs07', sub: 'CTL', text: {
    ko: '내 인생의 방향은 결국 내가 정한다고 믿는다',
    en: 'I believe I ultimately steer my own life',
    ja: '自分の人生の方向は結局自分が決めると信じている' } },
  { id: 'rs08', sub: 'CTL', text: {
    ko: '압박을 받을 때 오히려 더 집중이 잘 되는 편이다',
    en: 'Under pressure I tend to focus even better',
    ja: 'プレッシャーがかかると、むしろ集中できる方だ' } },
  { id: 'rs09', sub: 'CTL', text: {
    ko: '문제가 생기면 감정에 휩쓸리기보다 해결책을 먼저 떠올린다',
    en: 'When problems arise, I reach for solutions before emotions',
    ja: '問題が起きると感情より先に解決策を思い浮かべる' } },
  { id: 'rs10', sub: 'CTL', text: {
    ko: '목표를 세우면 어지간한 방해에도 끝까지 밀고 간다',
    en: 'Once I set a goal, I push through most obstacles',
    ja: '目標を立てたら、多少の妨害でも最後までやり抜く' } },
  { id: 'rs11', sub: 'AD', text: {
    ko: '계획이 갑자기 틀어져도 금세 다른 방법을 찾아낸다',
    en: 'When plans suddenly fall apart, I soon find another way',
    ja: '計画が急に狂っても、すぐ別の方法を見つける' } },
  { id: 'rs12', sub: 'AD', text: {
    ko: '낯선 환경이나 변화가 두렵기보다 흥미로운 편이다',
    en: 'New environments and change feel more exciting than scary',
    ja: '不慣れな環境や変化は怖いより面白いと感じる方だ' } },
  { id: 'rs13', sub: 'AD', text: {
    ko: '뜻대로 안 되는 일도 "그럴 수 있지" 하고 받아들이는 편이다',
    en: 'When things don\'t go my way, I tend to accept "it happens"',
    ja: '思い通りにならないことも「そういうこともある」と受け入れる' } },
  { id: 'rs14', sub: 'AD', text: {
    ko: '힘든 경험에서도 배울 점을 찾으려 한다',
    en: 'Even in hard experiences, I look for the lesson',
    ja: 'つらい経験からも学べる点を探そうとする' } },
  { id: 'rs15', sub: 'AD', text: {
    ko: '한 가지 방법이 막히면 고집부리지 않고 방향을 바꾼다',
    en: 'If one approach is blocked, I switch direction without clinging',
    ja: '一つの方法が塞がれば、固執せず方向を変える' } },
  { id: 'rs16', sub: 'SU', text: {
    ko: '정말 힘들 때 기댈 수 있는 사람이 최소 한 명은 있다',
    en: 'When truly struggling, I have at least one person to lean on',
    ja: '本当に辛い時に頼れる人が少なくとも一人はいる' } },
  { id: 'rs17', sub: 'SU', text: {
    ko: '도움이 필요할 때 주저 없이 요청하는 편이다',
    en: 'When I need help, I ask without hesitation',
    ja: '助けが必要な時、ためらわず頼む方だ' } },
  { id: 'rs18', sub: 'SU', text: {
    ko: '내 곁에는 나를 있는 그대로 응원해 주는 사람이 있다',
    en: 'I have people who support me as I am',
    ja: 'ありのままの自分を応援してくれる人がそばにいる' } },
  { id: 'rs19', sub: 'SU', text: {
    ko: '고민을 혼자 끌어안기보다 누군가와 나누는 편이다',
    en: 'I share worries with someone rather than carry them alone',
    ja: '悩みを一人で抱えるより誰かと分かち合う方だ' } },
  { id: 'rs20', sub: 'SU', text: {
    ko: '내가 속한 모임(가족·친구·동료)에 소속감을 느낀다',
    en: 'I feel a sense of belonging in my groups (family, friends, work)',
    ja: '自分の属する集まり（家族・友人・同僚）に所属感を感じる' } },
]
