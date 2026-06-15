import type { LikertItem } from './types'

/**
 * 연애 애착유형 검사 — 20문항, 1~5 동의 척도
 *
 * 학술 기반: ECR-R (Experiences in Close Relationships-Revised, Fraley, Waller & Brennan 2000)
 * - 2축 구조: ANX(애착 불안 — 버림받음 공포·확인 욕구) 9문항 / AVO(애착 회피 — 친밀 불편·거리두기) 9문항(역채점 2)
 * - 4유형 분류는 Bartholomew & Horowitz(1991) 성인 애착 4범주 모델:
 *   안정(둘 다 낮음) / 불안집착(ANX↑) / 거부회피(AVO↑) / 공포회피(둘 다 높음)
 * - 사회적 바람직성 위장은 타당도 2문항(VAL)으로 탐지
 * - 카톡 읽씹·잠수·SNS 등 현대 연애 시나리오로 윤색 (백서 §1)
 */
export const LOVE_ITEMS: LikertItem[] = [
  { id: 'lv01', sub: 'ANX', text: {
    ko: '답장이 늦어지면, 머릿속에서 최악의 시나리오가 자동 재생된다',
    en: 'When replies are slow, worst-case scenarios auto-play in my head',
    ja: '返信が遅いと、頭の中で最悪のシナリオが自動再生される' } },
  { id: 'lv02', sub: 'ANX', text: {
    ko: '연인의 마음이 내 마음만큼 크지 않을까 봐 자주 두렵다',
    en: 'I often fear my partner doesn\'t love me as much as I love them',
    ja: '恋人の気持ちが自分ほど大きくないのではとよく怖くなる' } },
  { id: 'lv03', sub: 'ANX', text: {
    ko: '상대의 말투가 평소와 0.5도만 달라져도 바로 감지하고 불안해진다',
    en: 'A 0.5-degree shift in their tone — I catch it instantly and spiral',
    ja: '相手の口調が0.5度違うだけで即感知して不安になる' } },
  { id: 'lv04', sub: 'ANX', text: {
    ko: '관계가 좋을수록 "이게 언제 끝날까" 하는 생각이 스며든다',
    en: 'The better things get, the more "when will this end" creeps in',
    ja: '関係が良いほど「いつ終わるんだろう」という考えが染み込む' } },
  { id: 'lv05', sub: 'ANX', text: {
    ko: '연인이 나 없이 즐거워 보이는 사진을 보면 소외감이 먼저 든다',
    en: 'Photos of my partner having fun without me — exclusion hits first',
    ja: '恋人が自分抜きで楽しそうな写真を見ると疎外感が先に来る' } },
  { id: 'lv06', sub: 'ANX', text: {
    ko: '"우리 무슨 사이야?"를 묻고 싶은 충동을 자주 참는다',
    en: 'I often suppress the urge to ask "so what are we?"',
    ja: '「私たちどういう関係？」と聞きたい衝動をよく我慢する' } },
  { id: 'lv07', sub: 'ANX', text: {
    ko: '사랑한다는 말을 들어도, 돌아서면 다시 확인받고 싶어진다',
    en: 'Even after hearing "I love you," I soon need to hear it again',
    ja: '愛してると言われても、すぐまた確認したくなる' } },
  { id: 'lv08', sub: 'ANX', text: {
    ko: '상대가 거리를 두면 매달리거나 일부러 시험하는 행동이 튀어나온다',
    en: 'When they pull away, I cling — or start testing them',
    ja: '相手が距離を置くと、すがるか試す行動が飛び出す' } },
  { id: 'lv09', sub: 'ANX', text: {
    ko: '연애 중에도 "언젠가 버려질 수 있다"는 가정을 기본값으로 깔고 있다',
    en: 'Even mid-relationship, "I could be abandoned" runs as my default setting',
    ja: '交際中でも「いつか捨てられるかも」が初期設定になっている' } },
  { id: 'lv10', sub: 'AVO', text: {
    ko: '속마음을 보여주는 건 약점을 내주는 일처럼 느껴진다',
    en: 'Showing my true feelings feels like handing over a weakness',
    ja: '本心を見せるのは弱点を渡すことのように感じる' } },
  { id: 'lv11', sub: 'AVO', text: {
    ko: '연인이 너무 가까워지려 하면 숨이 막혀 거리를 벌리게 된다',
    en: 'When they get too close, I suffocate and make space',
    ja: '恋人が近づきすぎると息が詰まって距離を取ってしまう' } },
  { id: 'lv12', sub: 'AVO', text: {
    ko: '"의지하고 싶어"보다 "내가 알아서 할게"가 먼저 나온다',
    en: '"I\'ll handle it myself" comes out before "I want to lean on you"',
    ja: '「頼りたい」より「自分でやる」が先に出る' } },
  { id: 'lv13', sub: 'AVO', text: {
    ko: '갈등이 생기면 대화로 푸는 것보다 잠수가 편하다',
    en: 'When conflict hits, going silent feels easier than talking it out',
    ja: '揉めると話し合いより音信不通の方が楽だ' } },
  { id: 'lv14', sub: 'AVO', reverse: true, text: {
    ko: '연인에게 고민이나 약한 모습을 털어놓는 것이 어렵지 않다',
    en: 'Sharing worries and weaknesses with my partner comes easily',
    ja: '恋人に悩みや弱さを打ち明けるのは難しくない' } },
  { id: 'lv15', sub: 'AVO', text: {
    ko: '누군가 나에게 깊이 의지해 오면 고마움보다 부담이 먼저 온다',
    en: 'When someone leans on me deeply, burden arrives before gratitude',
    ja: '誰かに深く頼られると、感謝より負担が先に来る' } },
  { id: 'lv16', sub: 'AVO', text: {
    ko: '사랑받는 것보다 내 공간을 지키는 게 우선일 때가 많다',
    en: 'Protecting my space often outranks being loved',
    ja: '愛されることより自分の空間を守る方が優先なことが多い' } },
  { id: 'lv17', sub: 'AVO', reverse: true, text: {
    ko: '힘들 때 연인에게 기대는 것이 자연스럽다',
    en: 'Leaning on my partner in hard times feels natural',
    ja: '辛い時に恋人に頼るのは自然なことだ' } },
  { id: 'lv18', sub: 'AVO', text: {
    ko: '관계가 깊어질수록 편안함보다 탈출 욕구가 커진다',
    en: 'The deeper it gets, the more I crave the exit over the comfort',
    ja: '関係が深まるほど安らぎより脱出欲が大きくなる' } },
  { id: 'lv19', sub: 'VAL', validity: true, text: {
    ko: '나는 연애에서 단 한 번도 서운함을 느낀 적이 없다',
    en: 'I have never once felt hurt in any relationship',
    ja: '私は恋愛で一度も寂しさを感じたことがない' } },
  { id: 'lv20', sub: 'VAL', validity: true, text: {
    ko: '나는 어떤 연인에게도 단 한 번도 실망한 적이 없다',
    en: 'No partner has ever once disappointed me',
    ja: 'どんな恋人にも一度も失望したことがない' } },
]

/** 애착 유형별 케미 매칭 — 결과 페이지 공유 트리거 */
export const LOVE_CHEMI: Record<string, { best: string; worst: string }> = {
  secure: { best: 'koala', worst: 'penguin' }, // 안정형: 누구든 치유 가능, 환장 케미 없음 → worst는 동족(심심) 농담
  anxious: { best: 'penguin', worst: 'cat' },
  avoidant: { best: 'penguin', worst: 'koala' },
  fearful: { best: 'penguin', worst: 'hedgehog' },
}
