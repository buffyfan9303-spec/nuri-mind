import type { L } from './types'
import type { Persona } from '../i18n/animalTranslations'

/**
 * 성향 나침반(MBTI 스타일) 검사 — 24문항, 양극 서술문 쌍 5점 척도.
 *
 * 학술 기반:
 * - Jung(1921) 심리유형론의 E/I·S/N·T/F + Myers-Briggs의 J/P 조작화.
 * - 유형 점수는 쌍봉이 아닌 연속 단봉 분포(Bess & Harvey 2002; Pittenger 1993/2005)
 *   → 연속 %를 주 결과로, 16유형 코드는 보조 요약으로 표시(중앙 절단의 재검사 불안정 회피).
 * - MBTI 4축은 Big Five 4요인과 높은 상관(McCrae & Costa 1989: E/I↔외향성 r≈.7,
 *   S/N↔개방성 r≈.7, T/F↔우호성 r≈.45, J/P↔성실성 r≈.47).
 * - 형식은 OEJTS(openpsychometrics.org)의 양극쌍 5점 방식을 차용하되,
 *   OEJTS 문항은 CC BY-NC-SA(비영리) 라이선스이므로 문항 전량 자체 제작.
 * - 45~55% 구간은 '경계 선호'로 명시(재검사 시 유형 변동의 주 원인 구간).
 */

export type MbtiAxis = 'EI' | 'SN' | 'TF' | 'JP'

export interface MbtiItem {
  id: string
  axis: MbtiAxis
  /** false: 오른쪽(5점) 극이 E/N/T/P. true: 오른쪽 극이 I/S/F/J(역채점 x' = 6 - x) */
  reverse?: boolean
  left: L
  right: L
}

/** 축 표시 메타 — pct는 항상 첫 글자(E/N/T/P) 방향 % */
export const MBTI_AXES: { key: MbtiAxis; a: string; b: string; aLabel: L; bLabel: L; color: string }[] = [
  { key: 'EI', a: 'E', b: 'I', aLabel: { ko: '외향', en: 'Extraversion', ja: '外向' }, bLabel: { ko: '내향', en: 'Introversion', ja: '内向' }, color: '#F2913D' },
  { key: 'SN', a: 'N', b: 'S', aLabel: { ko: '직관', en: 'Intuition', ja: '直観' }, bLabel: { ko: '감각', en: 'Sensing', ja: '感覚' }, color: '#7C5CE0' },
  { key: 'TF', a: 'T', b: 'F', aLabel: { ko: '사고', en: 'Thinking', ja: '思考' }, bLabel: { ko: '감정', en: 'Feeling', ja: '感情' }, color: '#4A7DDF' },
  { key: 'JP', a: 'P', b: 'J', aLabel: { ko: '인식', en: 'Perceiving', ja: '知覚' }, bLabel: { ko: '판단', en: 'Judging', ja: '判断' }, color: '#10B981' },
]

/* 24문항 = 4축 × 6 (축별 정방향 3 + 역방향 3), EI→SN→TF→JP 순환 배열 */
export const MBTI_ITEMS: MbtiItem[] = [
  // ── 1라운드 ──
  {
    id: 'm01', axis: 'EI',
    left: { ko: '모임이 끝나면 기운이 빠져 혼자 충전할 시간이 필요하다', en: 'After a gathering I feel drained and need alone time to recharge', ja: '集まりの後は消耗して、一人で充電する時間が要る' },
    right: { ko: '모임이 끝나도 기운이 남아 다음 약속을 잡고 싶다', en: 'After a gathering I still have energy and want to plan the next one', ja: '集まりの後も元気が残り、次の約束を入れたくなる' },
  },
  {
    id: 'm02', axis: 'SN',
    left: { ko: '설명서를 볼 때 순서대로 따라 하는 편이 마음 편하다', en: 'With instructions, I prefer following the steps in order', ja: '説明書は手順どおりに進めるほうが安心だ' },
    right: { ko: '설명서보다 전체 그림을 먼저 파악하고 건너뛰며 본다', en: 'I grasp the big picture first and skip around the manual', ja: '説明書より全体像を先につかみ、飛ばしながら読む' },
  },
  {
    id: 'm03', axis: 'TF',
    left: { ko: '친구의 고민엔 우선 해결책부터 찾아준다', en: "For a friend's problem, I look for solutions first", ja: '友人の悩みにはまず解決策を探す' },
    right: { ko: '친구의 고민엔 우선 마음부터 알아준다', en: "For a friend's problem, I acknowledge feelings first", ja: '友人の悩みにはまず気持ちに寄り添う' },
    reverse: true,
  },
  {
    id: 'm04', axis: 'JP',
    left: { ko: '여행은 그날 기분 따라 움직여야 즐겁다', en: 'A trip is fun when I go with the flow of the day', ja: '旅行はその日の気分で動いてこそ楽しい' },
    right: { ko: '여행은 일정표를 미리 짜야 즐겁다', en: 'A trip is fun when the itinerary is planned in advance', ja: '旅行は日程を前もって組んでこそ楽しい' },
    reverse: true,
  },
  // ── 2라운드 ──
  {
    id: 'm05', axis: 'EI',
    left: { ko: '생각이 정리된 뒤에 말하는 편이다', en: 'I speak after my thoughts are sorted out', ja: '考えがまとまってから話すほうだ' },
    right: { ko: '말하면서 생각이 정리되는 편이다', en: 'Talking is how I sort out my thoughts', ja: '話しながら考えがまとまるほうだ' },
  },
  {
    id: 'm06', axis: 'SN',
    left: { ko: '검증된 방법이 있으면 굳이 새 방법을 실험하지 않는다', en: "If a proven method exists, I don't experiment with new ones", ja: '実証済みの方法があれば、あえて新しい方法は試さない' },
    right: { ko: '검증된 방법이 있어도 더 나은 방식을 자꾸 상상한다', en: 'Even with a proven method, I keep imagining better ways', ja: '実証済みでも、より良いやり方をつい想像する' },
  },
  {
    id: 'm07', axis: 'TF',
    left: { ko: '피드백은 돌려 말하지 않고 정확하게 주는 게 낫다', en: 'Feedback should be precise, not sugar-coated', ja: 'フィードバックは遠回しにせず正確に伝えるべきだ' },
    right: { ko: '피드백은 상대가 상처받지 않게 부드럽게 주는 게 낫다', en: "Feedback should be softened so it doesn't hurt", ja: 'フィードバックは相手が傷つかないよう柔らかく伝えるべきだ' },
    reverse: true,
  },
  {
    id: 'm08', axis: 'JP',
    left: { ko: '마감보다 훨씬 일찍 끝내야 마음이 놓인다', en: 'I relax only when things are done well before the deadline', ja: '締切よりかなり早く終えないと落ち着かない' },
    right: { ko: '마감이 다가와야 몰입 스위치가 켜진다', en: 'The approaching deadline is what switches me on', ja: '締切が近づくと集中スイッチが入る' },
  },
  // ── 3라운드 ──
  {
    id: 'm09', axis: 'EI',
    left: { ko: '처음 보는 사람들 틈에서도 금방 대화를 시작한다', en: 'Among strangers, I strike up conversations quickly', ja: '初対面の人の中でもすぐ会話を始める' },
    right: { ko: '처음 보는 사람들 틈에선 누가 말을 걸어주길 기다린다', en: 'Among strangers, I wait for someone to approach me', ja: '初対面の人の中では話しかけられるのを待つ' },
    reverse: true,
  },
  {
    id: 'm10', axis: 'SN',
    left: { ko: '대화할 때 실제 있었던 일을 구체적으로 이야기한다', en: 'In conversation I talk about concrete things that happened', ja: '会話では実際にあった出来事を具体的に話す' },
    right: { ko: '대화할 때 아이디어나 가능성 이야기로 자주 빠진다', en: 'In conversation I drift into ideas and possibilities', ja: '会話ではアイデアや可能性の話に流れがちだ' },
  },
  {
    id: 'm11', axis: 'TF',
    left: { ko: '결정할 땐 관련된 사람들의 기분을 먼저 헤아린다', en: 'When deciding, I first weigh how people will feel', ja: '決めるときは関係者の気持ちをまず考える' },
    right: { ko: '결정할 땐 사실과 기준에 맞는지를 먼저 따진다', en: 'When deciding, I first check facts and criteria', ja: '決めるときは事実と基準に合うかをまず確かめる' },
  },
  {
    id: 'm12', axis: 'JP',
    left: { ko: '어수선해도 필요한 건 어디 있는지 다 안다', en: 'It may look messy, but I know where everything is', ja: '散らかっていても必要な物の場所は全部わかる' },
    right: { ko: '책상과 파일이 정돈되어 있어야 일이 시작된다', en: 'I can start working only when my desk and files are tidy', ja: '机とファイルが整っていないと仕事が始まらない' },
    reverse: true,
  },
  // ── 4라운드 ──
  {
    id: 'm13', axis: 'EI',
    left: { ko: '주말에 아무 약속이 없으면 오히려 홀가분하다', en: 'A weekend with no plans feels like a relief', ja: '週末に予定がないとむしろ気楽だ' },
    right: { ko: '주말에 아무 약속이 없으면 어딘가 허전하다', en: 'A weekend with no plans feels empty', ja: '週末に予定がないとどこか物足りない' },
  },
  {
    id: 'm14', axis: 'SN',
    left: { ko: '"만약에"로 시작하는 상상 대화가 즐겁다', en: 'I enjoy "what if" conversations', ja: '「もしも」で始まる想像の話が楽しい' },
    right: { ko: '"실제로"가 빠진 상상 대화는 붕 뜬 느낌이다', en: 'Talk without "in reality" feels ungrounded to me', ja: '「実際は」が抜けた想像話は地に足がつかない感じだ' },
    reverse: true,
  },
  {
    id: 'm15', axis: 'TF',
    left: { ko: '논쟁에서 분위기가 상할 것 같으면 한발 물러선다', en: 'If the mood might sour, I step back from the argument', ja: '雰囲気が悪くなりそうなら一歩引く' },
    right: { ko: '논쟁에서 논리가 맞다면 분위기가 어색해져도 말한다', en: 'If the logic is right, I say it even if it gets awkward', ja: '論理が正しければ、気まずくなっても言う' },
  },
  {
    id: 'm16', axis: 'JP',
    left: { ko: '할 일 목록에 체크 표시를 하는 순간이 좋다', en: 'I love the moment of checking items off my to-do list', ja: 'やることリストにチェックを入れる瞬間が好きだ' },
    right: { ko: '할 일 목록을 만들어도 결국 즉흥적으로 움직인다', en: 'Even with a to-do list, I end up acting on impulse', ja: 'リストを作っても結局は即興で動く' },
  },
  // ── 5라운드 ──
  {
    id: 'm17', axis: 'EI',
    left: { ko: '여럿이 하는 브레인스토밍에서 아이디어가 잘 나온다', en: 'My ideas flow best in group brainstorming', ja: '大勢のブレストでアイデアがよく出る' },
    right: { ko: '혼자 조용히 생각할 때 아이디어가 잘 나온다', en: 'My ideas flow best when thinking quietly alone', ja: '一人で静かに考えるときにアイデアがよく出る' },
    reverse: true,
  },
  {
    id: 'm18', axis: 'SN',
    left: { ko: '일을 배울 땐 원리와 이유부터 알아야 이해된다', en: 'I understand new work best from principles and reasons first', ja: '仕事を学ぶときは原理と理由から知ると理解できる' },
    right: { ko: '일을 배울 땐 실제 예시부터 보여줘야 이해된다', en: 'I understand new work best from concrete examples first', ja: '仕事を学ぶときは実例から見せてもらうと理解できる' },
    reverse: true,
  },
  {
    id: 'm19', axis: 'TF',
    left: { ko: '화합이 깨지는 게 공정함이 무너지는 것보다 싫다', en: 'Broken harmony bothers me more than broken fairness', ja: '和が乱れるのは、公正が崩れるより嫌だ' },
    right: { ko: '공정함이 무너지는 게 화합이 깨지는 것보다 싫다', en: 'Broken fairness bothers me more than broken harmony', ja: '公正が崩れるのは、和が乱れるより嫌だ' },
  },
  {
    id: 'm20', axis: 'JP',
    left: { ko: '계획이 갑자기 바뀌어도 오히려 재미있다', en: 'Sudden changes of plan can even be fun', ja: '計画が急に変わってもむしろ面白い' },
    right: { ko: '계획이 갑자기 바뀌면 스트레스를 받는다', en: 'Sudden changes of plan stress me out', ja: '計画が急に変わるとストレスを感じる' },
    reverse: true,
  },
  // ── 6라운드 ──
  {
    id: 'm21', axis: 'EI',
    left: { ko: '전화가 오면 반갑게 바로 받는 편이다', en: 'When the phone rings, I gladly pick up right away', ja: '電話が来たらすぐ喜んで出るほうだ' },
    right: { ko: '전화보다 문자·메시지가 편하다', en: 'I prefer texting over phone calls', ja: '電話よりメッセージのほうが気楽だ' },
    reverse: true,
  },
  {
    id: 'm22', axis: 'SN',
    left: { ko: '영화를 보면 숨은 의미와 메시지를 곱씹게 된다', en: 'After a movie, I chew on hidden meanings and messages', ja: '映画を観ると隠された意味やメッセージを反芻する' },
    right: { ko: '영화를 보면 줄거리와 장면 디테일이 기억에 남는다', en: 'After a movie, I remember the plot and scene details', ja: '映画を観るとあらすじや場面のディテールが記憶に残る' },
    reverse: true,
  },
  {
    id: 'm23', axis: 'TF',
    left: { ko: '일 잘하는 동료가 다정한 동료보다 같이 일하기 좋다', en: 'A competent colleague beats a warm one to work with', ja: '仕事ができる同僚のほうが、優しい同僚より組みやすい' },
    right: { ko: '다정한 동료가 일 잘하는 동료보다 같이 일하기 좋다', en: 'A warm colleague beats a competent one to work with', ja: '優しい同僚のほうが、仕事ができる同僚より組みやすい' },
    reverse: true,
  },
  {
    id: 'm24', axis: 'JP',
    left: { ko: '결론이 나야 마음이 놓인다 — 미정 상태가 불편하다', en: 'I need closure — open-ended situations bother me', ja: '結論が出ないと落ち着かない――未定の状態が苦手だ' },
    right: { ko: '결론을 서두르면 아깝다 — 가능성을 열어두고 싶다', en: 'Rushing to closure feels wasteful — I keep options open', ja: '結論を急ぐのはもったいない――可能性を開いておきたい' },
  },
]

/* ── 16유형 요약 메타 (이름·한줄 별칭) — 결과 보조 표시용 ── */
export const MBTI_TYPES: Record<string, { emoji: string; name: L; tagline: L }> = {
  INTJ: { emoji: '♟️', name: { ko: '전략 설계자', en: 'The Strategist', ja: '戦略設計者' }, tagline: { ko: '머릿속에 10수 앞의 설계도가 있다', en: 'Ten moves ahead, always', ja: '頭の中に10手先の設計図がある' } },
  INTP: { emoji: '🔭', name: { ko: '논리 탐구자', en: 'The Logician', ja: '論理探求者' }, tagline: { ko: '"왜?"가 멈추지 않는 뇌', en: 'A brain that never stops asking why', ja: '「なぜ？」が止まらない脳' } },
  ENTJ: { emoji: '🦁', name: { ko: '통솔 지휘관', en: 'The Commander', ja: '統率指揮官' }, tagline: { ko: '목표가 보이면 길을 만든다', en: 'Sees the goal, builds the road', ja: '目標が見えたら道を作る' } },
  ENTP: { emoji: '⚡', name: { ko: '발상 변론가', en: 'The Debater', ja: '発想弁論家' }, tagline: { ko: '토론은 스포츠, 발상은 취미', en: 'Debate is sport, ideas are hobby', ja: '討論はスポーツ、発想は趣味' } },
  INFJ: { emoji: '🌙', name: { ko: '통찰 조언자', en: 'The Counselor', ja: '洞察助言者' }, tagline: { ko: '조용히 사람의 결을 읽는다', en: 'Quietly reads the grain of people', ja: '静かに人の心の襞を読む' } },
  INFP: { emoji: '🕊️', name: { ko: '잔잔한 이상주의자', en: 'The Idealist', ja: '静かな理想主義者' }, tagline: { ko: '마음속에 자기만의 세계가 있다', en: 'Carries a world of their own inside', ja: '心の中に自分だけの世界がある' } },
  ENFJ: { emoji: '🌻', name: { ko: '따뜻한 지도자', en: 'The Mentor', ja: '温かな指導者' }, tagline: { ko: '사람을 자라게 하는 사람', en: 'Grows people, not just plans', ja: '人を育てる人' } },
  ENFP: { emoji: '🎈', name: { ko: '자유로운 불꽃', en: 'The Spark', ja: '自由な火花' }, tagline: { ko: '가능성만 보면 심장이 뛴다', en: 'A heartbeat for every possibility', ja: '可能性を見ると心が躍る' } },
  ISTJ: { emoji: '🗿', name: { ko: '원칙 관리자', en: 'The Inspector', ja: '原則管理者' }, tagline: { ko: '말보다 기록, 감보다 절차', en: 'Records over words, process over hunches', ja: '言葉より記録、勘より手順' } },
  ISFJ: { emoji: '🫖', name: { ko: '든든한 수호자', en: 'The Protector', ja: '頼れる守護者' }, tagline: { ko: '티 안 나게 모두를 챙긴다', en: 'Takes care of everyone, quietly', ja: 'さりげなく皆を気遣う' } },
  ESTJ: { emoji: '📊', name: { ko: '실행 관리자', en: 'The Executive', ja: '実行管理者' }, tagline: { ko: '오늘 할 일은 오늘 끝낸다', en: "Today's work ends today", ja: '今日の仕事は今日終える' } },
  ESFJ: { emoji: '🤝', name: { ko: '사교적 조력자', en: 'The Host', ja: '社交的な援助者' }, tagline: { ko: '모두가 편안한지 살피는 레이더', en: 'A radar for everyone’s comfort', ja: '皆が快適かを見守るレーダー' } },
  ISTP: { emoji: '🔧', name: { ko: '조용한 해결사', en: 'The Craftsman', ja: '静かな解決者' }, tagline: { ko: '말없이 고쳐놓고 사라진다', en: 'Fixes it silently, then vanishes', ja: '黙って直して去っていく' } },
  ISFP: { emoji: '🎨', name: { ko: '감성 장인', en: 'The Artist', ja: '感性の職人' }, tagline: { ko: '지금 이 순간의 아름다움에 산다', en: 'Lives in the beauty of now', ja: '今この瞬間の美しさに生きる' } },
  ESTP: { emoji: '🏄', name: { ko: '행동파 승부사', en: 'The Dynamo', ja: '行動派勝負師' }, tagline: { ko: '생각은 짧게, 행동은 빠르게', en: 'Think fast, move faster', ja: '考えは短く、行動は速く' } },
  ESFP: { emoji: '🎉', name: { ko: '무대 위 에너자이저', en: 'The Entertainer', ja: '舞台のエナジャイザー' }, tagline: { ko: '있는 곳이 곧 파티가 된다', en: 'Wherever they are becomes the party', ja: 'いる場所がパーティーになる' } },
}

/** 유형 코드 → 기질(Keirsey 4기질) 페르소나 키 */
export function temperamentOf(code: string): string {
  if (code.includes('N') && code.includes('T')) return 'mbtiNT'
  if (code.includes('N') && code.includes('F')) return 'mbtiNF'
  if (code.includes('S') && code.includes('J')) return 'mbtiSJ'
  return 'mbtiSP'
}

/* ── 4기질 페르소나 — 기존 동물 페르소나와 동일 구조(팩트폭행 톤 유지) ── */
export const MBTI_PERSONAS: Record<string, Persona> = {
  mbtiNT: {
    emoji: '🦉',
    grad: ['#7C5CE0', '#B39DF0'],
    name: { ko: '분석가 기질 (NT)', en: 'Analyst (NT)', ja: 'アナリスト気質 (NT)' },
    title: { ko: '이성 회로의 설계자', en: 'The Rational Architect', ja: '理性回路の設計者' },
    tagline: { ko: '세상을 시스템으로 읽는 뇌', en: 'A brain that reads the world as systems', ja: '世界をシステムとして読む脳' },
    desc: {
      ko: '당신은 현상 뒤의 구조를 봐야 직성이 풀리는 사람입니다. 남들이 "그냥 그런가 보다" 하고 넘기는 지점에서 당신의 사고는 시작됩니다. 문제는 사람이 시스템처럼 움직이지 않는다는 것 — 감정 변수 앞에서 당신의 모델은 자주 빗나갑니다.',
      en: "You need to see the structure behind things. Where others shrug, your thinking begins. The catch: people don't run like systems, and your models often miss the emotional variable.",
      ja: '現象の裏の構造を見ないと気が済まない人です。他人が「そういうものか」と流す地点からあなたの思考は始まります。問題は、人間がシステムのように動かないこと――感情という変数の前であなたのモデルはよく外れます。',
    },
    slap: {
      ko: '"비효율적이야"라는 말로 상대의 마음을 몇 번이나 닫게 했는지 세어본 적 있나요? 논리로 이겨도 관계에서 지면, 그 설계는 실패작입니다.',
      en: 'Ever counted how many hearts you closed with the word "inefficient"? Winning the logic while losing the person is a failed design.',
      ja: '「非効率だ」という言葉で相手の心を何度閉ざしたか数えたことは？論理で勝っても関係で負けたら、その設計は失敗作です。',
    },
    risks: [
      { ko: '감정 신호를 데이터 노이즈로 취급하다 신뢰를 잃음', en: 'Treating emotional signals as noise costs you trust', ja: '感情のシグナルをノイズ扱いして信頼を失う' },
      { ko: '완벽한 이론을 다듬느라 실행 타이밍을 놓침', en: 'Polishing the perfect theory until the window closes', ja: '完璧な理論を磨くうちに実行のタイミングを逃す' },
      { ko: '"내가 맞다"는 확신이 피드백 수신 안테나를 꺾음', en: 'Certainty of being right bends your feedback antenna', ja: '「自分が正しい」という確信がフィードバックの受信を妨げる' },
    ],
    solutions: [
      { ko: '반박하기 전에 상대의 말을 한 문장으로 요약해 되돌려주기', en: 'Before rebutting, mirror their point in one sentence', ja: '反論の前に相手の話を一文に要約して返す' },
      { ko: '70% 완성이면 일단 출시 — 세상이 나머지 30%를 알려줌', en: 'Ship at 70% — the world teaches you the rest', ja: '70%の完成度でまず出す――残り30%は世界が教えてくれる' },
      { ko: '주 1회, 논리가 아닌 감정 단어로 하루를 기록해보기', en: 'Once a week, journal the day in feeling-words, not logic', ja: '週1回、論理ではなく感情の言葉で一日を記録する' },
    ],
    strengths: [
      { ko: '복잡한 문제를 구조로 쪼개는 해부 능력', en: 'Dissecting complex problems into structure', ja: '複雑な問題を構造に分解する解剖力' },
      { ko: '유행에 흔들리지 않는 독립적 판단', en: 'Independent judgment immune to trends', ja: '流行に流されない独立した判断' },
    ],
  },
  mbtiNF: {
    emoji: '🕊️',
    grad: ['#4FA882', '#8FD4B4'],
    name: { ko: '이상가 기질 (NF)', en: 'Idealist (NF)', ja: '理想家気質 (NF)' },
    title: { ko: '의미 탐지기의 소유자', en: 'The Meaning Seeker', ja: '意味探知機の持ち主' },
    tagline: { ko: '"이 일이 무슨 의미가 있지?"가 기본 질문인 사람', en: 'Default question: "What does this mean?"', ja: '「これに何の意味が？」が基本設定の人' },
    desc: {
      ko: '당신은 사람과 일에서 의미와 진정성을 감지하는 센서가 유난히 발달했습니다. 겉과 속이 다른 것을 누구보다 빨리 알아채죠. 문제는 그 센서가 자신에게도 향한다는 것 — 이상과 현실의 간극이 남들보다 몇 배 아프게 느껴집니다.',
      en: 'Your sensor for meaning and authenticity is unusually sharp — you spot hollowness instantly. The catch: the sensor points inward too, and the gap between ideal and real hurts you more than most.',
      ja: '人と物事から意味と真正性を感知するセンサーが非常に発達しています。表と裏が違うものに誰より早く気づく。問題はそのセンサーが自分にも向くこと――理想と現実の溝が人より何倍も痛く感じられます。',
    },
    slap: {
      ko: '모두에게 이해받고 싶다는 소망은, 아무에게도 진짜 모습을 보여주지 않는 방식으로 실현되고 있진 않나요? 갈등 회피는 평화가 아니라 유예입니다.',
      en: "Is your wish to be understood by everyone being fulfilled by showing your real self to no one? Avoiding conflict isn't peace — it's postponement.",
      ja: '皆に理解されたいという願いが、誰にも本当の姿を見せないという形で実現されていませんか？衝突回避は平和ではなく先送りです。',
    },
    risks: [
      { ko: '갈등 회피가 쌓여 어느 날 관계를 통째로 끊어버림', en: 'Avoided conflicts pile up until you cut the whole relationship', ja: '回避した衝突が積もり、ある日関係ごと断ち切ってしまう' },
      { ko: '이상적 기준에 못 미치는 자신을 만성적으로 감점', en: 'Chronically docking points from a self below the ideal', ja: '理想に届かない自分を慢性的に減点する' },
      { ko: '타인의 감정을 흡수하다 자기 감정의 주인 자리를 잃음', en: "Absorbing others' feelings until you lose your own", ja: '他人の感情を吸収して自分の感情の主導権を失う' },
    ],
    solutions: [
      { ko: '불편함을 24시간 안에 "사실+감정+부탁" 3문장으로 말하기', en: 'Voice discomfort within 24h: fact + feeling + request', ja: '不快感は24時間以内に「事実＋感情＋お願い」の3文で伝える' },
      { ko: '"충분히 좋음"의 기준선을 미리 적어두고 거기서 멈추기', en: 'Pre-write the "good enough" line and stop there', ja: '「十分に良い」の基準を先に書き、そこで止まる' },
      { ko: '남의 감정을 들은 날엔 내 감정도 한 줄 기록하기', en: "On days you carry others' feelings, log one line of yours", ja: '他人の感情を聞いた日は自分の感情も一行記録する' },
    ],
    strengths: [
      { ko: '사람의 잠재력을 알아보고 끌어올리는 눈', en: 'An eye that spots and lifts human potential', ja: '人の潜在力を見抜き引き上げる目' },
      { ko: '진심이 담긴 말로 사람을 움직이는 힘', en: 'Moving people with words that carry heart', ja: '真心のこもった言葉で人を動かす力' },
    ],
  },
  mbtiSJ: {
    emoji: '🏛️',
    grad: ['#4A7DDF', '#8FB8E8'],
    name: { ko: '관리자 기질 (SJ)', en: 'Guardian (SJ)', ja: '管理者気質 (SJ)' },
    title: { ko: '신뢰라는 인프라의 건설자', en: 'The Builder of Trust', ja: '信頼というインフラの建設者' },
    tagline: { ko: '"내가 한다고 했으면 한다"의 화신', en: 'If they said they would, it gets done', ja: '「やると言ったらやる」の化身' },
    desc: {
      ko: '당신은 약속·기한·절차가 지켜질 때 세상이 제대로 돌아간다고 믿는 사람이고, 실제로 그 믿음대로 삽니다. 조직의 보이지 않는 뼈대는 대부분 당신 같은 사람이 지탱합니다. 문제는 변화가 필요한 순간에도 익숙한 절차부터 지키려 든다는 것.',
      en: "You believe the world works when promises, deadlines and procedures hold — and you live that way. Invisible backbones of organizations are held up by people like you. The catch: you defend familiar procedure even when change is due.",
      ja: '約束・期限・手順が守られてこそ世界は回ると信じ、実際そのとおりに生きる人です。組織の見えない骨格はあなたのような人が支えています。問題は、変化が必要な瞬間にも慣れた手順を守ろうとすること。',
    },
    slap: {
      ko: '"원래 이렇게 해왔어"는 근거가 아니라 습관의 다른 이름입니다. 당신이 지키는 절차 중 몇 개는, 이미 이유가 사라진 빈 껍데기일 수 있어요.',
      en: '"We\'ve always done it this way" is not a reason — it\'s a habit wearing a suit. Some procedures you guard are shells whose reasons left long ago.',
      ja: '「昔からこうしてきた」は根拠ではなく習慣の別名です。あなたが守る手順のいくつかは、理由がとうに消えた抜け殻かもしれません。',
    },
    risks: [
      { ko: '변화 제안을 위협으로 받아들여 성장 기회를 걷어참', en: 'Reading change proposals as threats, kicking away growth', ja: '変化の提案を脅威と受け取り成長の機会を蹴る' },
      { ko: '책임을 끌어안다 번아웃 — "내가 안 하면 누가 해"의 함정', en: 'Hoarding duty into burnout — the "if not me, who?" trap', ja: '責任を抱え込み燃え尽きる――「私がやらねば」の罠' },
      { ko: '규칙을 안 지키는 사람에 대한 평가가 관계를 경직시킴', en: 'Judging rule-breakers hardens your relationships', ja: 'ルールを守らない人への評価が関係を硬直させる' },
    ],
    solutions: [
      { ko: '절차마다 "이게 지금도 유효한 이유"를 1년에 한 번 재심사', en: 'Once a year, re-audit each procedure for a living reason', ja: '手順ごとに「今も有効な理由」を年1回再審査する' },
      { ko: '일의 20%는 의식적으로 위임 — 어설퍼도 개입 금지', en: 'Consciously delegate 20% — no rescuing, even if clumsy', ja: '仕事の20%は意識的に委任――拙くても介入禁止' },
      { ko: '새로운 방식은 "시험 운행 2주"로 낮은 부담으로 실험', en: 'Trial new ways as a low-stakes 2-week pilot', ja: '新しいやり方は「2週間の試験運行」で気軽に実験' },
    ],
    strengths: [
      { ko: '맡긴 일이 사라지지 않는다는 절대적 신뢰감', en: 'The absolute trust that nothing assigned to you vanishes', ja: '任せた仕事が消えないという絶対的信頼感' },
      { ko: '위기에서 빛나는 침착한 실무 처리력', en: 'Calm operational competence that shines in crisis', ja: '危機で光る冷静な実務処理能力' },
    ],
  },
  mbtiSP: {
    emoji: '🏄',
    grad: ['#F2913D', '#FFC372'],
    name: { ko: '탐험가 기질 (SP)', en: 'Explorer (SP)', ja: '探検家気質 (SP)' },
    title: { ko: '현재진행형 인간', en: 'The Present-Tense Human', ja: '現在進行形の人間' },
    tagline: { ko: '지금 이 순간을 사는 데 천재적인 사람', en: 'A genius at living right now', ja: '今この瞬間を生きる天才' },
    desc: {
      ko: '당신은 몸으로 부딪히며 배우는 사람입니다. 매뉴얼을 읽는 대신 일단 만져보고, 회의하는 대신 일단 시도합니다. 위기 대응 속도는 타의 추종을 불허하죠. 문제는 "지금"에 최적화된 뇌가 "3년 뒤"를 자꾸 남의 일처럼 취급한다는 것.',
      en: "You learn by touching, not reading; by trying, not meeting. Your crisis reflexes are unmatched. The catch: a brain optimized for now keeps treating three-years-from-now as someone else's problem.",
      ja: '体でぶつかって学ぶ人です。マニュアルを読む代わりにまず触り、会議の代わりにまず試す。危機対応の速さは追随を許しません。問題は「今」に最適化された脳が「3年後」を他人事のように扱うこと。',
    },
    slap: {
      ko: '"그때 가서 생각하지"가 통하지 않는 유일한 상대가 시간입니다. 지금의 자유는 미래의 당신이 할부로 갚고 있는 중일지도 몰라요.',
      en: '"I\'ll figure it out then" works on everything except time. Today\'s freedom may be an installment plan your future self is paying.',
      ja: '「その時になって考える」が通用しない唯一の相手が時間です。今の自由は、未来のあなたが分割払いで返済中かもしれません。',
    },
    risks: [
      { ko: '지루함을 못 견뎌 축적이 필요한 일을 중도 하차', en: 'Boredom intolerance makes you quit compounding work midway', ja: '退屈に耐えられず、積み上げが要る仕事を途中下車' },
      { ko: '충동 선택(지출·이직·관계)이 장기 옵션을 잠식', en: 'Impulse choices eat away your long-term options', ja: '衝動的な選択（支出・転職・関係）が長期の選択肢を蝕む' },
      { ko: '"재미없으면 의미없다"가 유일한 필터가 되는 것', en: '"No fun, no point" becoming your only filter', ja: '「面白くなければ意味がない」が唯一のフィルターになる' },
    ],
    solutions: [
      { ko: '큰 목표는 2주 단위 미니게임으로 쪼개 지루함을 우회', en: 'Split long goals into 2-week minigames to dodge boredom', ja: '大きな目標は2週間のミニゲームに割って退屈を回避' },
      { ko: '수입의 일정 비율 자동이체 — 의지 말고 시스템에 맡기기', en: 'Auto-transfer a fixed % of income — trust systems, not will', ja: '収入の一定割合を自動振替――意志でなく仕組みに任せる' },
      { ko: '큰 결정은 "24시간 보류" 규칙 — 내일도 하고 싶으면 진짜', en: "Big decisions get a 24h hold — if you still want it tomorrow, it's real", ja: '大きな決定は「24時間保留」――明日もやりたければ本物' },
    ],
    strengths: [
      { ko: '계획이 무너진 현장에서 가장 침착한 사람', en: 'The calmest person when the plan collapses', ja: '計画が崩れた現場で最も冷静な人' },
      { ko: '이론가 열 명 몫의 실전 감각과 손끝 재능', en: 'Hands-on instinct worth ten theorists', ja: '理論家10人分の実戦感覚と手先の才能' },
    ],
  },
}

/* ── 결과 고지문(윤리) — Pittenger(2005)·Myers & Briggs 재단 권고 반영 ── */
export const MBTI_DISCLAIMER: L = {
  ko: '이 결과는 고정된 유형이 아니라 오늘의 자기보고를 요약한 것으로, 재검사 시 달라질 수 있어요(특히 경계 축). 능력이나 우열을 측정하지 않으며, 채용·선발 판단에 사용해서는 안 됩니다. 각 축은 성격심리학의 Big Five 요인과 상당 부분 겹치는 연속 선호입니다.',
  en: 'This is a summary of today\'s self-report, not a fixed type — retests can differ (especially on borderline axes). It measures no ability or worth and must not be used for hiring decisions. Each axis is a continuous preference overlapping Big Five factors.',
  ja: 'この結果は固定された類型ではなく今日の自己報告の要約で、再検査では変わり得ます（特に境界の軸）。能力や優劣は測定せず、採用・選抜の判断に使ってはいけません。各軸はビッグファイブと大きく重なる連続的な選好です。',
}
