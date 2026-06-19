import type { LikertItem } from './types'

/**
 * 다크 트라이어드 검사 — 20문항, 1~5 동의 척도
 *
 * 학술 기반: SD3(Short Dark Triad, Jones & Paulhus 2014)의 3요인 구조를 차용해
 * 일상 시나리오로 독자 개발:
 *  MA(마키아벨리즘 — 전략·조종) / NA(나르시시즘 — 자기과시·특권의식)
 *  PS(사이코패시 — 냉담·충동·무모) + VAL(타당도) 2문항
 * 점수↑ = 어두운 성향↑. 재미·자기이해용이며 임상 진단이 아님.
 */
export const DARK_ITEMS: LikertItem[] = [
  { id: 'dk01', sub: 'MA', text: {
    ko: '원하는 걸 얻으려면 사람을 적절히 "다룰" 줄 알아야 한다',
    en: 'To get what you want, you must know how to "handle" people',
    ja: '欲しいものを得るには、人を適度に「操る」必要がある' } },
  { id: 'dk02', sub: 'MA', text: {
    ko: '내 진짜 의도는 가능하면 드러내지 않는 게 유리하다',
    en: 'It pays to keep my true intentions hidden when possible',
    ja: '本当の意図はできるだけ明かさない方が有利だ' } },
  { id: 'dk03', sub: 'MA', text: {
    ko: '상대의 약점을 알아두면 언젠가 쓸모가 있다',
    en: 'Knowing others\' weak spots comes in handy someday',
    ja: '相手の弱点を知っておくと、いつか役に立つ' } },
  { id: 'dk04', sub: 'MA', text: {
    ko: '중요한 정보는 굳이 다 공유하지 않고 쥐고 있는 편이다',
    en: 'I tend to hold key information rather than share it all',
    ja: '重要な情報はあえて全部共有せず握っておく方だ' } },
  { id: 'dk05', sub: 'MA', text: {
    ko: '목적을 위해서라면 약간의 아부나 연기는 할 수 있다',
    en: 'For a goal, I can manage some flattery or acting',
    ja: '目的のためなら多少のお世辞や演技はできる' } },
  { id: 'dk06', sub: 'MA', text: {
    ko: '사람들은 대개 이용당하기 전에 이용하려 든다고 생각한다',
    en: 'Most people will use you before you use them',
    ja: '人はたいてい利用される前に利用しようとすると思う' } },
  { id: 'dk07', sub: 'MA', text: {
    ko: '계획은 길게 보고, 지금의 손해도 다음 이득을 위해 감수한다',
    en: 'I plan long-term and accept losses now for later gains',
    ja: '計画は長く見て、今の損も次の得のため受け入れる' } },
  { id: 'dk08', sub: 'NA', text: {
    ko: '나는 특별한 사람이라, 남들과 똑같이 취급받으면 답답하다',
    en: 'I\'m special, so being treated like everyone else frustrates me',
    ja: '自分は特別なので、皆と同じ扱いだと物足りない' } },
  { id: 'dk09', sub: 'NA', text: {
    ko: '사람들의 관심과 인정이 내겐 꽤 중요하다',
    en: 'Attention and admiration matter a lot to me',
    ja: '人の注目や承認は自分にとってかなり重要だ' } },
  { id: 'dk10', sub: 'NA', text: {
    ko: '내 성취나 외모를 은근히(또는 대놓고) 드러내는 걸 즐긴다',
    en: 'I enjoy showing off my wins or looks, subtly or openly',
    ja: '自分の成果や外見をそれとなく（または堂々と）見せるのが好きだ' } },
  { id: 'dk11', sub: 'NA', text: {
    ko: '나는 보통 사람들보다 더 나은 대우를 받을 자격이 있다고 느낀다',
    en: 'I feel I deserve better treatment than most',
    ja: '自分は普通の人より良い扱いを受ける資格があると感じる' } },
  { id: 'dk12', sub: 'NA', text: {
    ko: '대화의 중심이 나일 때 가장 기분이 좋다',
    en: 'I feel best when I\'m the center of the conversation',
    ja: '会話の中心が自分の時が一番心地よい' } },
  { id: 'dk13', sub: 'NA', text: {
    ko: '비판을 들으면 인정하기보다 속으로 반박부터 하게 된다',
    en: 'Hearing criticism, I rebut inwardly before accepting it',
    ja: '批判を聞くと、認めるより先に内心で反論する' } },
  { id: 'dk14', sub: 'NA', text: {
    ko: '언젠가 내가 크게 인정받고 성공할 거라고 자주 상상한다',
    en: 'I often picture myself being widely recognized and successful',
    ja: 'いつか大きく認められ成功する自分をよく想像する' } },
  { id: 'dk15', sub: 'PS', text: {
    ko: '복수는 빠르고 확실하게 하는 게 맞다고 생각한다',
    en: 'Revenge is best served fast and sure',
    ja: '復讐は素早く確実にするのが正しいと思う' } },
  { id: 'dk16', sub: 'PS', text: {
    ko: '위험하거나 무모한 일에서 짜릿함을 느끼는 편이다',
    en: 'I get a thrill from risky or reckless things',
    ja: '危険・無謀なことにスリルを感じる方だ' } },
  { id: 'dk17', sub: 'PS', text: {
    ko: '남이 다치거나 곤란해져도 내 일이 아니면 별 감정이 없다',
    en: 'If others get hurt and it\'s not my problem, I feel little',
    ja: '他人が傷ついても自分事でなければ大して感じない' } },
  { id: 'dk18', sub: 'PS', text: {
    ko: '하고 싶은 말은 결과를 깊이 따지기 전에 내뱉는 편이다',
    en: 'I blurt out what I want to say before weighing consequences',
    ja: '言いたいことは結果を深く考える前に口に出す方だ' } },
  { id: 'dk19', sub: 'PS', text: {
    ko: '죄책감이라는 감정에 오래 시달리는 편은 아니다',
    en: 'I don\'t suffer from guilt for very long',
    ja: '罪悪感に長く苦しむ方ではない' } },
  { id: 'dk20', sub: 'VAL', validity: true, text: {
    ko: '나는 살면서 단 한 번도 누군가를 미워해 본 적이 없다',
    en: 'I have never once disliked anyone in my life',
    ja: '私は生きてきて一度も誰かを嫌ったことがない' } },
]
