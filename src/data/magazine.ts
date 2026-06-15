import type { L, TestId } from './types'

/** 심리 매거진 — 검사와 연계된 짧은 아티클. 앱 깊이 + SEO 유입. */
export interface Article {
  id: string
  emoji: string
  test?: TestId // 관련 검사(퍼널)
  title: L
  summary: L // 목록/메타 설명용 한 줄
  sections: { h: L; p: L }[]
  close: L
}

export const ARTICLES: Article[] = [
  {
    id: 'adhd-focus',
    emoji: '🎯',
    test: 'adhd',
    title: { ko: '집중력이 약한 게 아니라, 뇌가 다른 거예요', en: 'You\'re not weak at focus — your brain is wired differently', ja: '集中力が弱いのではなく、脳が違うだけ' },
    summary: { ko: 'ADHD 성향과 집중력의 진짜 작동 원리, 그리고 환경으로 의지를 대신하는 법', en: 'How ADHD-style attention really works, and replacing willpower with environment', ja: 'ADHD的注意の仕組みと、環境で意志を代替する方法' },
    sections: [
      { h: { ko: '의지의 문제가 아니다', en: 'It\'s not about willpower', ja: '意志の問題ではない' }, p: { ko: '주의력은 "끄고 켜는 스위치"가 아니라 흥미와 보상에 반응하는 시스템입니다. 재미없는 일에 집중이 안 되는 건 고장이 아니라 설계예요.', en: 'Attention isn\'t an on/off switch — it responds to interest and reward. Struggling with boring tasks isn\'t a defect, it\'s design.', ja: '注意はオンオフのスイッチではなく、興味と報酬に反応するシステム。退屈な作業に集中できないのは故障ではなく設計です。' } },
      { h: { ko: '환경이 의지를 대신한다', en: 'Let environment do the work', ja: '環境に意志を代行させる' }, p: { ko: '휴대폰을 다른 방에 두고, 할 일을 3개로 줄이고, 25분 타이머를 켜세요. 의지로 버티는 대신 환경을 바꾸면 성공률이 급상승합니다.', en: 'Phone in another room, 3 tasks max, a 25-minute timer. Change the environment instead of grinding on willpower.', ja: 'スマホは別室、やる事は3つ、25分タイマー。意志で耐えず環境を変えると成功率が跳ね上がります。' } },
      { h: { ko: '시작의 장벽을 낮춰라', en: 'Lower the start barrier', ja: '開始のハードルを下げる' }, p: { ko: '"딱 5분만" 규칙은 시작의 마찰을 줄여줍니다. 일단 시작하면 관성이 붙어요. 완벽하게가 아니라 일단 시작이 핵심.', en: 'The "just 5 minutes" rule cuts starting friction. Once you begin, momentum kicks in. Start beats perfect.', ja: '「まず5分」ルールで開始の摩擦を減らす。始めれば惰性がつく。完璧より着手。' } },
    ],
    close: { ko: '집중력은 타고난 한계가 아니라 설계할 수 있는 시스템입니다.', en: 'Focus isn\'t a fixed limit — it\'s a system you can design.', ja: '集中力は生まれつきの限界ではなく、設計できるシステムです。' },
  },
  {
    id: 'burnout-recover',
    emoji: '🌱',
    test: 'burnout',
    title: { ko: '번아웃은 의지박약이 아니라 신호입니다', en: 'Burnout isn\'t weakness — it\'s a signal', ja: '燃え尽きは弱さではなくサイン' },
    summary: { ko: '번아웃의 3가지 신호와, 무너지기 전에 회복하는 작은 습관들', en: 'The 3 signs of burnout and small habits to recover before you crash', ja: '燃え尽きの3つのサインと、崩れる前の回復習慣' },
    sections: [
      { h: { ko: '소진·냉소·무력의 3신호', en: 'Exhaustion, cynicism, inefficacy', ja: '消耗・冷笑・無力の3サイン' }, p: { ko: '번아웃은 게으름이 아니라 정서적 고갈입니다. 의욕이 사라지고, 모든 게 시큰둥하고, 뭘 해도 소용없게 느껴진다면 몸이 보내는 경고예요.', en: 'Burnout is emotional depletion, not laziness. Lost drive, cynicism, and "nothing matters" feelings are warnings.', ja: '燃え尽きは怠けではなく情緒的消耗。意欲喪失・冷笑・無力感は警告です。' } },
      { h: { ko: '거절이 회복의 시작', en: 'Saying no is recovery', ja: '断りが回復の始まり' }, p: { ko: '에너지가 새는 곳을 막아야 채워집니다. 오늘 한 가지 부탁을 거절하고, 할 일 하나를 내일로 미뤄보세요.', en: 'You refill only after you stop the leaks. Decline one request today, defer one task to tomorrow.', ja: '漏れを止めて初めて満ちる。今日一つ断り、一つ明日へ。' } },
      { h: { ko: '아무것도 안 하는 시간', en: 'Time doing nothing', ja: '何もしない時間' }, p: { ko: '쉼은 보상이 아니라 필수 정비입니다. 하루 20분, 생산성 없이 그냥 멈추는 시간을 일정에 넣으세요.', en: 'Rest is maintenance, not reward. Schedule 20 min a day of doing nothing.', ja: '休息はご褒美でなく必須整備。1日20分、何もしない時間を予定に。' } },
    ],
    close: { ko: '쉬는 것은 게으름이 아니라 다시 달리기 위한 충전입니다.', en: 'Rest isn\'t laziness — it\'s charging to run again.', ja: '休むのは怠けではなく、再び走るための充電です。' },
  },
  {
    id: 'attachment',
    emoji: '💞',
    test: 'love',
    title: { ko: '내 연애가 반복되는 이유, 애착유형', en: 'Why your relationships repeat: attachment styles', ja: '恋愛が繰り返す理由、愛着タイプ' },
    summary: { ko: '안정·불안·회피·혼란 4가지 애착유형과, 더 건강한 관계로 가는 법', en: 'The 4 attachment styles and a path to healthier relationships', ja: '4つの愛着タイプと、健全な関係への道' },
    sections: [
      { h: { ko: '애착은 어린 시절의 지도', en: 'Attachment is an early map', ja: '愛着は幼少期の地図' }, p: { ko: '우리가 사랑하는 방식은 어릴 적 형성된 관계의 지도를 따릅니다. 매달리거나 도망가는 패턴엔 이유가 있어요.', en: 'How we love follows a relationship map formed early. Clinging or fleeing patterns have roots.', ja: '愛し方は幼少期に形成された地図に従う。しがみつき・逃げには理由がある。' } },
      { h: { ko: '불안-회피의 덫', en: 'The anxious-avoidant trap', ja: '不安-回避の罠' }, p: { ko: '쫓는 불안형과 도망가는 회피형이 만나면 가장 끌리지만 가장 힘듭니다. 패턴을 알면 덜 휘둘려요.', en: 'Anxious-chases-avoidant is the most magnetic and most painful pairing. Naming it loosens its grip.', ja: '追う不安型と逃げる回避型は最も惹かれ最も辛い。パターンを知れば振り回されにくい。' } },
      { h: { ko: '유형은 바꿀 수 있다', en: 'Styles can change', ja: 'タイプは変えられる' }, p: { ko: '애착유형은 운명이 아닙니다. 안정적인 관계 경험과 자기 이해로 누구나 더 안정형에 가까워질 수 있어요.', en: 'Attachment isn\'t destiny. Secure experiences and self-awareness move anyone toward security.', ja: '愛着は運命ではない。安定した経験と自己理解で誰でも安定型に近づける。' } },
    ],
    close: { ko: '패턴을 이해하는 순간, 반복은 선택이 됩니다.', en: 'The moment you understand the pattern, repetition becomes a choice.', ja: 'パターンを理解した瞬間、繰り返しは選択になる。' },
  },
  {
    id: 'dopamine-detox',
    emoji: '🧘',
    test: 'dopamine',
    title: { ko: '도파민 디톡스, 진짜 효과 있을까?', en: 'Dopamine detox: does it actually work?', ja: 'ドーパミンデトックスは本当に効く？' },
    summary: { ko: '숏폼·SNS 과자극에서 벗어나 집중력과 만족감을 되찾는 현실적 방법', en: 'A realistic way to escape short-form overstimulation and regain focus', ja: 'ショート動画の過刺激から抜け集中を取り戻す現実的方法' },
    sections: [
      { h: { ko: '문제는 도파민이 아니다', en: 'Dopamine isn\'t the villain', ja: '問題はドーパミンではない' }, p: { ko: '도파민은 나쁜 게 아니라 동기의 연료입니다. 문제는 숏폼처럼 즉각적이고 강한 자극에 길들여지는 것.', en: 'Dopamine isn\'t bad — it\'s motivation\'s fuel. The issue is getting trained on instant, intense hits.', ja: 'ドーパミンは悪でなく動機の燃料。問題は即時・強烈な刺激に慣れること。' } },
      { h: { ko: '지루함을 견디는 연습', en: 'Practice tolerating boredom', ja: '退屈に耐える練習' }, p: { ko: '무료한 순간 바로 폰을 집는 습관을 끊어보세요. 지루함을 견디면 뇌의 보상 기준이 천천히 정상화됩니다.', en: 'Stop reaching for the phone the instant you\'re bored. Tolerating it resets your reward baseline.', ja: '退屈の瞬間すぐスマホを掴む癖を断つ。耐えると報酬基準が正常化する。' } },
      { h: { ko: '환경 설계가 핵심', en: 'Design the environment', ja: '環境設計が鍵' }, p: { ko: '아침 첫 30분 폰 멀리, 식사 중 폰 금지, 잘 때 폰 거실에. 의지보다 환경이 절제를 만듭니다.', en: 'No phone for the first 30 min, none at meals, none in the bedroom. Environment beats willpower.', ja: '起床30分・食事中・寝室でスマホ無し。意志より環境が節制を作る。' } },
    ],
    close: { ko: '절제는 참는 게 아니라, 자극의 기준을 되돌리는 일입니다.', en: 'Restraint isn\'t suffering — it\'s resetting your stimulation baseline.', ja: '節制は我慢でなく、刺激の基準を戻すこと。' },
  },
  {
    id: 'resilience',
    emoji: '🎋',
    test: 'resilience',
    title: { ko: '무너져도 다시 일어서는 사람들의 비밀', en: 'The secret of people who bounce back', ja: '崩れても立ち直る人の秘密' },
    summary: { ko: '회복탄력성은 타고나는 게 아니라 기를 수 있는 근육이라는 이야기', en: 'Resilience isn\'t born — it\'s a muscle you can train', ja: 'レジリエンスは生まれつきでなく鍛える筋肉' },
    sections: [
      { h: { ko: '단단함은 강함이 아니다', en: 'Resilience isn\'t toughness', ja: '強靭さは強さではない' }, p: { ko: '회복탄력성은 안 무너지는 게 아니라, 무너진 뒤 다시 일어서는 힘입니다. 감정을 억누르는 게 아니라 흘려보내는 능력이죠.', en: 'Resilience isn\'t never falling — it\'s rising after. Not suppressing emotion, but letting it flow through.', ja: 'レジリエンスは崩れない事でなく、崩れた後立ち直る力。感情を抑圧せず流す力。' } },
      { h: { ko: '통제 가능에 집중', en: 'Focus on what you control', ja: '制御可能に集中' }, p: { ko: '통제 불가능한 것에 쓰는 에너지를 줄이고, 지금 할 수 있는 작은 한 가지에 집중하세요. 작은 성취가 단단함을 쌓습니다.', en: 'Spend less on what you can\'t control; focus on one small doable thing. Small wins build strength.', ja: '制御不能への消耗を減らし、今できる小さな一つに集中。小さな達成が強さを積む。' } },
      { h: { ko: '연결이 회복을 만든다', en: 'Connection heals', ja: 'つながりが回復を生む' }, p: { ko: '혼자 버티는 게 강한 게 아닙니다. 믿는 사람에게 손 내미는 것이 회복탄력성의 핵심 자원이에요.', en: 'Toughing it out alone isn\'t strength. Reaching out to someone you trust is a core resource.', ja: '一人で耐えるのが強さではない。信頼する人に手を伸ばす事が核心資源。' } },
    ],
    close: { ko: '단단한 사람은 안 흔들리는 게 아니라, 흔들린 뒤 돌아올 줄 아는 사람입니다.', en: 'The resilient aren\'t unshakable — they know how to return after shaking.', ja: '強い人は揺れない人でなく、揺れた後戻れる人。' },
  },
]

export function articleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id)
}
