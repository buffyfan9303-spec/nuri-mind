import type { LikertItem } from './types'

/**
 * 자존감 검사 — 10문항, 1~5 동의 척도.
 *
 * 학술 기반: Rosenberg Self-Esteem Scale(RSES, 1965) — 전 세계에서 가장 널리 쓰이는 자존감 척도.
 *  POS(긍정적 자기가치 5문항) + NEG(부정적 자기평가 5문항, 역채점).
 * 역채점 후 합산, 점수↑ = 자존감↑.
 */
export const SELFESTEEM_ITEMS: LikertItem[] = [
  { id: 'se01', sub: 'POS', text: {
    ko: '나는 내가 적어도 남들만큼은 가치 있는 사람이라고 느낀다',
    en: 'I feel I am a person of worth, at least equal to others',
    ja: '私は少なくとも他人と同じくらい価値ある人間だと感じる' } },
  { id: 'se02', sub: 'POS', text: {
    ko: '나는 좋은 장점을 꽤 많이 가지고 있다',
    en: 'I feel that I have a number of good qualities',
    ja: '私には良い長所がかなりあると思う' } },
  { id: 'se03', sub: 'POS', text: {
    ko: '나는 대체로 나 자신에게 만족하는 편이다',
    en: 'On the whole, I am satisfied with myself',
    ja: '概して私は自分に満足している方だ' } },
  { id: 'se04', sub: 'POS', text: {
    ko: '나는 나 자신을 긍정적으로 대하는 편이다',
    en: 'I take a positive attitude toward myself',
    ja: '私は自分に肯定的な態度をとる方だ' } },
  { id: 'se05', sub: 'POS', text: {
    ko: '나는 남들이 하는 만큼 무슨 일이든 잘 해낼 수 있다',
    en: 'I am able to do things as well as most other people',
    ja: '私は人並みに物事をうまくこなせる' } },
  { id: 'se06', sub: 'NEG', reverse: true, text: {
    ko: '가끔 나는 내가 전혀 쓸모없는 사람처럼 느껴진다',
    en: 'At times I think I am no good at all',
    ja: '時々、自分は全く役に立たない人間だと思う' } },
  { id: 'se07', sub: 'NEG', reverse: true, text: {
    ko: '나는 자랑할 만한 것이 별로 없다고 느낀다',
    en: 'I feel I do not have much to be proud of',
    ja: '私には誇れるものがあまりないと感じる' } },
  { id: 'se08', sub: 'NEG', reverse: true, text: {
    ko: '나는 가끔 내가 정말 형편없다고 느낀다',
    en: 'I certainly feel useless at times',
    ja: '時々、自分は本当にダメだと感じる' } },
  { id: 'se09', sub: 'NEG', reverse: true, text: {
    ko: '나는 나 자신을 더 존중할 수 있으면 좋겠다고 자주 생각한다',
    en: 'I wish I could have more respect for myself',
    ja: 'もっと自分を尊重できればと思うことが多い' } },
  { id: 'se10', sub: 'NEG', reverse: true, text: {
    ko: '결국 나는 내가 실패자라는 생각이 들 때가 있다',
    en: 'All in all, I am inclined to feel that I am a failure',
    ja: '結局、自分は失敗者だと感じることがある' } },
]
