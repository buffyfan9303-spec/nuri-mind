import type { LikertItem } from './types'

/**
 * 사회불안 검사 — 15문항, 1~5 동의 척도.
 *
 * 학술 기반: Social Phobia Inventory(SPIN, Connor 2000) + LSAS의 3개 축을 일상 진술로 차용:
 *  FEAR(평가에 대한 두려움) / AVOID(회피) / PHYS(신체 증상).
 * 전 문항 긍정 진술(높을수록 사회불안↑).
 */
export const SOCIALANX_ITEMS: LikertItem[] = [
  { id: 'sa01', sub: 'FEAR', text: {
    ko: '사람들이 나를 어떻게 볼지 늘 신경 쓰인다',
    en: 'I\'m always aware of how people might see me',
    ja: '人にどう見られるか常に気になる' } },
  { id: 'sa02', sub: 'FEAR', text: {
    ko: '실수해서 창피당할까 봐 미리 걱정된다',
    en: 'I worry in advance about embarrassing myself',
    ja: 'ミスして恥をかかないか前もって心配になる' } },
  { id: 'sa03', sub: 'FEAR', text: {
    ko: '다른 사람 앞에서 말할 때 긴장되고 떨린다',
    en: 'I get nervous and shaky speaking in front of others',
    ja: '人前で話すと緊張して震える' } },
  { id: 'sa04', sub: 'FEAR', text: {
    ko: '내가 한 말이나 행동을 나중에 곱씹으며 후회한다',
    en: 'I replay what I said or did and regret it later',
    ja: '自分の言動を後で反芻して後悔する' } },
  { id: 'sa05', sub: 'FEAR', text: {
    ko: '모르는 사람과 대화를 시작하는 게 부담스럽다',
    en: 'Starting a conversation with a stranger feels heavy',
    ja: '知らない人と会話を始めるのが負担だ' } },
  { id: 'sa06', sub: 'AVOID', text: {
    ko: '사람이 많은 모임은 가능하면 피하고 싶다',
    en: 'I avoid crowded gatherings when I can',
    ja: '人の多い集まりはできれば避けたい' } },
  { id: 'sa07', sub: 'AVOID', text: {
    ko: '발표나 주목받는 자리를 되도록 피한다',
    en: 'I avoid presentations or being the center of attention',
    ja: '発表や注目される場をなるべく避ける' } },
  { id: 'sa08', sub: 'AVOID', text: {
    ko: '전화 통화보다 문자가 훨씬 편하다',
    en: 'Texting feels far more comfortable than calling',
    ja: '電話よりメッセージの方がずっと楽だ' } },
  { id: 'sa09', sub: 'AVOID', text: {
    ko: '새로운 사람을 만나는 약속이 잡히면 가기 싫어진다',
    en: 'When a meet-new-people plan comes up, I dread going',
    ja: '新しい人と会う予定が入ると行きたくなくなる' } },
  { id: 'sa10', sub: 'AVOID', text: {
    ko: '의견이 있어도 분위기 때문에 말하지 않고 넘어간다',
    en: 'I hold back my opinion to avoid disrupting the mood',
    ja: '意見があっても空気を読んで言わずに済ます' } },
  { id: 'sa11', sub: 'PHYS', text: {
    ko: '긴장하면 얼굴이 붉어지거나 땀이 난다',
    en: 'When nervous, I blush or sweat',
    ja: '緊張すると顔が赤くなったり汗が出る' } },
  { id: 'sa12', sub: 'PHYS', text: {
    ko: '사람들 앞에서 심장이 빨리 뛰거나 손이 떨린다',
    en: 'In front of people my heart races or hands tremble',
    ja: '人前で心臓が速くなったり手が震える' } },
  { id: 'sa13', sub: 'PHYS', text: {
    ko: '주목받으면 목소리가 떨리거나 말이 막힌다',
    en: 'Under attention my voice shakes or words get stuck',
    ja: '注目されると声が震えたり言葉に詰まる' } },
  { id: 'sa14', sub: 'PHYS', text: {
    ko: '사회적 상황을 앞두면 배가 아프거나 속이 불편하다',
    en: 'Before social situations my stomach hurts or feels off',
    ja: '社交の場の前にお腹が痛くなったり気分が悪くなる' } },
  { id: 'sa15', sub: 'PHYS', text: {
    ko: '긴장된 자리가 끝나면 진이 빠지고 피곤하다',
    en: 'After a tense social event I feel drained and exhausted',
    ja: '緊張する場が終わるとどっと疲れる' } },
]
