import type { LikertItem } from './types'

/**
 * 본심 이타성 검사 (이기주의·개인주의 성향) — 20문항, 1~5 동의 척도
 *
 * 학술 기반:
 * - LSRP (Levenson, Kiehl & Fitzpatrick 1995, J. Personality & Social Psychology)
 *   : 1차(자기이익·냉담 SELF) / 2차(충동·회피 AVD 변형) 구조 차용
 * - SVO (Social Value Orientation, Murphy et al. 2011) : 협력-개인-경쟁 가치 지향
 * - Mach-IV (Christie & Geis 1970) : 전략적 관계 운용 STR 축
 * - Batson의 공감-이타성 가설(1991) : EMP(진성 이타) 축, 역채점
 * - 사회적 바람직성 위장은 Marlowe-Crowne(1960) 방식의 타당도 문항(VAL)으로 탐지
 * - 극적 상황 시나리오(조별과제·회식·게임·양보)로 윤색해 방어적 응답 차단 (백서 §1)
 */
export const EGO_ITEMS: LikertItem[] = [
  {
    id: 'e01',
    sub: 'SELF',
    text: {
      ko: '조별 과제에서 내 학점만 지킬 수 있다면, 무임승차도 하나의 전략이라고 생각한다',
      en: 'In group projects, if my grade is safe, free-riding is just another strategy',
      ja: 'グループ課題で自分の成績さえ守れるなら、タダ乗りも一つの戦略だと思う',
    },
  },
  {
    id: 'e02',
    sub: 'SELF',
    text: {
      ko: '손해를 감수하는 착함은, 결국 어리석음의 다른 이름이라고 믿는다',
      en: 'Kindness that accepts losses is, in the end, another name for foolishness',
      ja: '損を受け入れる優しさは、結局のところ愚かさの別名だと信じている',
    },
  },
  {
    id: 'e03',
    sub: 'SELF',
    text: {
      ko: '내 커리어에 중요한 기회가 생기면, 친구와의 선약쯤은 미룰 수 있다',
      en: 'If a career-critical chance appears, a prior promise with a friend can wait',
      ja: 'キャリアに重要なチャンスが来たら、友人との先約くらいは後回しにできる',
    },
  },
  {
    id: 'e04',
    sub: 'SELF',
    text: {
      ko: '누군가의 부탁을 들어주기 전에, 먼저 "나에게 남는 것"부터 계산하게 된다',
      en: 'Before granting a favor, I first calculate what\'s in it for me',
      ja: '誰かの頼みを聞く前に、まず「自分に残るもの」から計算してしまう',
    },
  },
  {
    id: 'e05',
    sub: 'STR',
    text: {
      ko: '모임이든 회사든, 결국 판의 주도권은 내가 쥐어야 직성이 풀린다',
      en: 'Club or company — I\'m only satisfied when I hold the steering wheel of the game',
      ja: 'サークルでも会社でも、結局主導権は自分が握らないと気が済まない',
    },
  },
  {
    id: 'e06',
    sub: 'STR',
    text: {
      ko: '경쟁에서 2등은 의미가 없다. 판을 새로 설계해서라도 1등을 차지하고 싶다',
      en: 'Second place means nothing. I\'d rather redesign the board to take first',
      ja: '競争で2位には意味がない。盤面を作り直してでも1位を取りたい',
    },
  },
  {
    id: 'e07',
    sub: 'STR',
    text: {
      ko: '칭찬과 정보는 사람을 움직이는 "카드"이므로, 아껴 두었다가 필요할 때 쓴다',
      en: 'Praise and information are cards that move people — I save them for the right moment',
      ja: '称賛と情報は人を動かす「カード」なので、取っておいて必要な時に使う',
    },
  },
  {
    id: 'e08',
    sub: 'STR',
    text: {
      ko: '협상 중 상대의 약점을 알게 되면, 활용하는 쪽이 합리적이라고 본다',
      en: 'If I learn an opponent\'s weakness mid-negotiation, using it is simply rational',
      ja: '交渉中に相手の弱点を知ったら、活用する方が合理的だと思う',
    },
  },
  {
    id: 'e09',
    sub: 'EMP',
    reverse: true,
    text: {
      ko: '친구의 안 좋은 소식을 들으면, 내 일처럼 마음이 한참 동안 무겁다',
      en: 'When a friend shares bad news, my heart stays heavy as if it were my own',
      ja: '友人の悪い知らせを聞くと、自分のことのように長く心が重い',
    },
  },
  {
    id: 'e10',
    sub: 'EMP',
    reverse: true,
    text: {
      ko: '지하철에서 힘들어 보이는 사람을 보면, 망설이다가도 결국 자리를 양보하게 된다',
      en: 'On the subway, seeing someone struggling, I may hesitate — but I end up giving my seat',
      ja: '電車でつらそうな人を見ると、ためらっても結局席を譲ってしまう',
    },
  },
  {
    id: 'e11',
    sub: 'EMP',
    reverse: true,
    text: {
      ko: '내 시간을 빼앗기더라도, 동료의 급한 부탁을 외면하기는 어렵다',
      en: 'Even at the cost of my own time, ignoring a colleague\'s urgent request is hard for me',
      ja: '自分の時間が削られても、同僚の急な頼みを見過ごすのは難しい',
    },
  },
  {
    id: 'e12',
    sub: 'EMP',
    reverse: true,
    text: {
      ko: '기부나 봉사는 보여주기가 아니라, 하고 난 뒤의 내 만족 때문에 한다',
      en: 'I donate or volunteer not for show, but for how it genuinely satisfies me afterward',
      ja: '寄付やボランティアは見せるためではなく、した後の自分の満足のためにする',
    },
  },
  {
    id: 'e13',
    sub: 'AVD',
    text: {
      ko: '거절하면 미움받을까 봐 일단 "알겠다"고 해 놓고, 돌아서서 후회한다',
      en: 'Fearing dislike, I say "sure" first — then turn around and regret it',
      ja: '断ったら嫌われそうで、とりあえず「わかった」と言ってから振り返って後悔する',
    },
  },
  {
    id: 'e14',
    sub: 'AVD',
    text: {
      ko: '갈등이 벌어질 바엔, 차라리 내가 손해를 보고 조용히 끝내는 편이 마음 편하다',
      en: 'Rather than face a conflict, I\'d quietly absorb the loss — it feels easier',
      ja: '揉めるくらいなら、いっそ自分が損をして静かに終わらせる方が気楽だ',
    },
  },
  {
    id: 'e15',
    sub: 'AVD',
    text: {
      ko: '회식 메뉴나 여행 일정을 정할 때, 내 의견은 거의 꺼내지 않고 따라간다',
      en: 'Choosing the team dinner or trip plans, I rarely voice my preference — I just follow',
      ja: '会食のメニューや旅行日程を決めるとき、自分の意見はほぼ出さずに従う',
    },
  },
  {
    id: 'e16',
    sub: 'SELF',
    text: {
      ko: '단체의 성과보다, 내 지분과 이름이 또렷하게 남는 일을 고르는 편이다',
      en: 'Over team outcomes, I pick work where my share and my name stay clearly visible',
      ja: '団体の成果よりも、自分の持ち分と名前がはっきり残る仕事を選ぶ方だ',
    },
  },
  {
    id: 'e17',
    sub: 'STR',
    text: {
      ko: '양보는 미덕이 아니라, 다음 판을 위한 포석일 때만 가치가 있다',
      en: 'Concession isn\'t a virtue — it only has value as an opening for the next game',
      ja: '譲歩は美徳ではなく、次の局面への布石である時だけ価値がある',
    },
  },
  {
    id: 'e18',
    sub: 'EMP',
    reverse: true,
    text: {
      ko: '게임에서 내가 이기는 것보다, 함께한 사람들이 즐거웠는지가 더 중요하다',
      en: 'More than winning the game, what matters is whether everyone had fun',
      ja: 'ゲームで自分が勝つことより、一緒にやった人たちが楽しかったかの方が大事だ',
    },
  },
  {
    id: 'e19',
    sub: 'VAL',
    validity: true,
    text: {
      ko: '나는 태어나서 지금까지, 단 한 번도 거짓말을 한 적이 없다',
      en: 'I have never once told a lie in my entire life',
      ja: '私は生まれてから今まで、ただの一度も嘘をついたことがない',
    },
  },
  {
    id: 'e20',
    sub: 'VAL',
    validity: true,
    text: {
      ko: '나는 어떤 상황에서도, 다른 사람을 부러워하거나 질투한 적이 전혀 없다',
      en: 'In no situation have I ever felt envy or jealousy toward anyone',
      ja: '私はどんな状況でも、他人を羨んだり嫉妬したことが全くない',
    },
  },
]
