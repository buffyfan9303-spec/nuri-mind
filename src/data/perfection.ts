import type { LikertItem } from './types'

/**
 * 완벽주의 검사 — 20문항, 1~5 동의 척도.
 *
 * 학술 기반: Frost Multidimensional Perfectionism Scale(Frost MPS, 1990)의 핵심 4개 차원을
 *  일상 진술로 차용:
 *   STD(개인적 기준 — 높은 목표, 적응적) / CM(실수에 대한 걱정 — 부적응적)
 *   DA(행동에 대한 의심 — 부적응적) / SOC(타인의 기대·평가 — 사회부과적)
 * 전 문항 긍정 진술(높을수록 완벽주의 성향↑). STD=적응 축, CM·DA·SOC=부적응 축.
 */
export const PERFECTION_ITEMS: LikertItem[] = [
  { id: 'pf01', sub: 'STD', text: {
    ko: '나는 무엇을 하든 남들보다 높은 기준을 세운다',
    en: 'Whatever I do, I set higher standards than others',
    ja: '何をするにも人より高い基準を立てる' } },
  { id: 'pf02', sub: 'STD', text: {
    ko: '\'이 정도면 됐어\'보다 \'더 잘할 수 있어\'가 먼저 떠오른다',
    en: '"I can do better" comes to mind before "this is fine"',
    ja: '「これで十分」より「もっとできる」が先に浮かぶ' } },
  { id: 'pf03', sub: 'STD', text: {
    ko: '평범한 결과로는 좀처럼 만족하지 못한다',
    en: 'I rarely feel satisfied with an average result',
    ja: '平凡な結果ではなかなか満足できない' } },
  { id: 'pf04', sub: 'STD', text: {
    ko: '목표는 늘 도전적으로 높게 잡는 편이다',
    en: 'I tend to set goals ambitiously high',
    ja: '目標はいつも挑戦的に高く設定する方だ' } },
  { id: 'pf05', sub: 'STD', text: {
    ko: '최고가 아니면 의미가 없다고 느낄 때가 있다',
    en: 'Sometimes it feels meaningless unless it\'s the best',
    ja: '最高でなければ意味がないと感じる時がある' } },
  { id: 'pf06', sub: 'CM', text: {
    ko: '작은 실수 하나도 크게 신경 쓰인다',
    en: 'Even a tiny mistake bothers me a lot',
    ja: '小さなミス一つも大きく気になる' } },
  { id: 'pf07', sub: 'CM', text: {
    ko: '실수하면 사람들이 나를 낮게 볼까 봐 두렵다',
    en: 'I fear people will think less of me if I slip up',
    ja: 'ミスすると人に低く見られそうで怖い' } },
  { id: 'pf08', sub: 'CM', text: {
    ko: '한 번의 실패가 전체를 망친 것처럼 느껴진다',
    en: 'One failure feels like it ruins the whole thing',
    ja: '一度の失敗が全体を台無しにした気がする' } },
  { id: 'pf09', sub: 'CM', text: {
    ko: '일을 끝내고도 틀린 곳이 없는지 계속 곱씹는다',
    en: 'Even after finishing, I keep replaying it for errors',
    ja: '終えた後も間違いがないか反芻し続ける' } },
  { id: 'pf10', sub: 'CM', text: {
    ko: '완벽하지 않으면 차라리 안 보여주고 싶다',
    en: 'If it isn\'t perfect, I\'d rather not show it at all',
    ja: '完璧でないならいっそ見せたくない' } },
  { id: 'pf11', sub: 'DA', text: {
    ko: '다 했는데도 \'제대로 한 게 맞나\' 자주 의심한다',
    en: 'Even when done, I often doubt "did I do it right?"',
    ja: 'やり終えても「ちゃんとできたか」とよく疑う' } },
  { id: 'pf12', sub: 'DA', text: {
    ko: '결정을 내린 뒤에도 옳았는지 오래 망설인다',
    en: 'After deciding, I waver for a long time over whether it was right',
    ja: '決めた後も正しかったか長く迷う' } },
  { id: 'pf13', sub: 'DA', text: {
    ko: '내가 한 일이 충분한지 확신이 잘 안 선다',
    en: 'I struggle to feel sure that my work is enough',
    ja: '自分のやった事が十分か確信が持てない' } },
  { id: 'pf14', sub: 'DA', text: {
    ko: '같은 일을 여러 번 점검하고 고쳐야 마음이 놓인다',
    en: 'I only feel at ease after checking and redoing things several times',
    ja: '同じ事を何度も点検し直さないと落ち着かない' } },
  { id: 'pf15', sub: 'DA', text: {
    ko: '시작하기도 전에 \'잘 못할 것 같다\'는 생각이 앞선다',
    en: 'Before I even start, "I\'ll probably do it poorly" comes first',
    ja: '始める前から「うまくできない気がする」が先立つ' } },
  { id: 'pf16', sub: 'SOC', text: {
    ko: '주변 사람들은 내게 높은 기준을 기대한다고 느낀다',
    en: 'I feel people around me expect high standards from me',
    ja: '周囲は私に高い基準を期待していると感じる' } },
  { id: 'pf17', sub: 'SOC', text: {
    ko: '기대에 못 미치면 사람들을 크게 실망시킬 것 같다',
    en: 'Falling short would deeply disappoint people',
    ja: '期待に届かないと人を大きく失望させる気がする' } },
  { id: 'pf18', sub: 'SOC', text: {
    ko: '남들이 내 결과를 어떻게 볼지 늘 의식한다',
    en: 'I\'m always aware of how others will judge my results',
    ja: '他人が私の結果をどう見るか常に意識する' } },
  { id: 'pf19', sub: 'SOC', text: {
    ko: '인정받으려면 완벽해야 한다고 느낀다',
    en: 'I feel I must be perfect to be accepted',
    ja: '認められるには完璧でなければと感じる' } },
  { id: 'pf20', sub: 'SOC', text: {
    ko: '칭찬보다 지적 한마디가 훨씬 오래 남는다',
    en: 'One word of criticism lingers far longer than praise',
    ja: '称賛より指摘の一言がずっと長く残る' } },
]
