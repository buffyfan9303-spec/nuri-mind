import type { LikertItem } from './types'

/**
 * 자기효능감 검사 — 10문항, 1~5 동의 척도.
 *
 * 학술 기반: General Self-Efficacy Scale(GSE, Schwarzer & Jerusalem 1995) — 전 세계 25개 언어 표준화.
 *  단일 차원(EFF): "나는 해낼 수 있다"는 능력에 대한 일반적 믿음. 전 문항 긍정(높을수록 효능감↑).
 *  ※ 자존감(가치)·완벽주의(기준)와 달리 효능감은 '능력에 대한 자신감'을 본다.
 */
export const EFFICACY_ITEMS: LikertItem[] = [
  { id: 'ef01', sub: 'EFF', text: {
    ko: '충분히 노력하면 어려운 문제도 해결할 수 있다',
    en: 'I can solve difficult problems if I try hard enough',
    ja: '十分に努力すれば難しい問題も解決できる' } },
  { id: 'ef02', sub: 'EFF', text: {
    ko: '누가 반대하더라도, 내가 원하는 것을 얻을 방법을 찾아낸다',
    en: 'If someone opposes me, I can find a way to get what I want',
    ja: '誰かが反対しても、望むものを得る方法を見つけられる' } },
  { id: 'ef03', sub: 'EFF', text: {
    ko: '목표를 정하면 그것을 이루어내는 일은 어렵지 않다',
    en: 'It is easy for me to stick to my aims and accomplish my goals',
    ja: '目標を決めれば、それを成し遂げるのは難しくない' } },
  { id: 'ef04', sub: 'EFF', text: {
    ko: '예상치 못한 일이 생겨도 잘 대처할 자신이 있다',
    en: 'I am confident I could deal efficiently with unexpected events',
    ja: '予想外の出来事にもうまく対処できる自信がある' } },
  { id: 'ef05', sub: 'EFF', text: {
    ko: '갑작스러운 상황에서도 어떻게 대처해야 할지 안다',
    en: 'I know how to handle unforeseen situations',
    ja: '突然の状況でもどう対処すべきか分かる' } },
  { id: 'ef06', sub: 'EFF', text: {
    ko: '필요한 노력만 들이면 대부분의 문제를 풀 수 있다',
    en: 'I can solve most problems if I invest the necessary effort',
    ja: '必要な努力さえすれば大抵の問題は解ける' } },
  { id: 'ef07', sub: 'EFF', text: {
    ko: '어려움이 닥쳐도 침착함을 잃지 않고 대응한다',
    en: 'I can remain calm facing difficulties because I can rely on my coping',
    ja: '困難が来ても落ち着いて対応できる' } },
  { id: 'ef08', sub: 'EFF', text: {
    ko: '문제에 부딪히면 여러 가지 해결책을 떠올릴 수 있다',
    en: 'When faced with a problem, I can find several solutions',
    ja: '問題にぶつかれば複数の解決策を思いつける' } },
  { id: 'ef09', sub: 'EFF', text: {
    ko: '곤경에 빠져도 빠져나갈 방법을 대개 생각해낸다',
    en: 'If I am in trouble, I can usually think of a way out',
    ja: '苦境に陥っても抜け出す方法を大抵思いつく' } },
  { id: 'ef10', sub: 'EFF', text: {
    ko: '무슨 일이 닥치든 나는 대체로 감당해낼 수 있다',
    en: 'Whatever comes my way, I am usually able to handle it',
    ja: '何が起きても大抵は乗り越えられる' } },
]
