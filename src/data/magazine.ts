import type { L, TestId } from './types'

/** 심리 매거진 — 검사와 연계된 아티클. 듀오링고식 카드 레슨 + 중간 광고 + 정독 보상. */
export interface ArticleSection {
  h: L
  p: L
  key?: L // 한 줄 핵심(카드 상단 칩)
  tip?: L // 💡 오늘 바로 실천(콜아웃)
}
export interface Article {
  id: string
  emoji: string
  test?: TestId // 관련 검사(퍼널)
  tag: L // 카테고리 칩
  readMin: number // 읽는 시간(분)
  title: L
  summary: L // 목록/메타 설명용 한 줄
  intro: L // 도입 훅(공감 한 문단)
  sections: ArticleSection[]
  takeaways: L[] // 핵심 요약 체크리스트
  close: L
}

export const ARTICLES: Article[] = [
  {
    id: 'adhd-focus',
    emoji: '🎯',
    test: 'adhd',
    tag: { ko: '집중·ADHD', en: 'Focus·ADHD', ja: '集中·ADHD' },
    readMin: 4,
    title: { ko: '집중력이 약한 게 아니라, 뇌가 다른 거예요', en: 'You\'re not weak at focus — your brain is wired differently', ja: '集中力が弱いのではなく、脳が違うだけ' },
    summary: { ko: 'ADHD 성향과 집중력의 진짜 작동 원리, 그리고 환경으로 의지를 대신하는 법', en: 'How ADHD-style attention really works, and replacing willpower with environment', ja: 'ADHD的注意の仕組みと、環境で意志を代替する方法' },
    intro: { ko: '"왜 나는 마음먹은 일도 못 끝낼까?" 스스로를 게으르다고 탓해본 적 있다면, 잠깐 멈춰보세요. 문제는 의지가 아니라 뇌가 보상에 반응하는 방식일 수 있어요.', en: '"Why can\'t I finish even what I decided to do?" If you\'ve blamed yourself for being lazy, pause. The issue may not be willpower but how your brain responds to reward.', ja: '「決めた事すら終えられないのはなぜ?」自分を怠けと責めた事があるなら、少し止まって。問題は意志でなく脳の報酬反応かもしれません。' },
    sections: [
      {
        h: { ko: '의지의 문제가 아니다', en: 'It\'s not about willpower', ja: '意志の問題ではない' },
        key: { ko: '주의력 = 흥미·보상에 반응하는 시스템', en: 'Attention reacts to interest & reward', ja: '注意は興味·報酬に反応' },
        p: { ko: '주의력은 "끄고 켜는 스위치"가 아니라 흥미와 보상에 반응하는 시스템입니다. 재미있는 일엔 몇 시간씩 몰입(과집중)하면서 지루한 일엔 5분도 못 버티는 건, 의지가 약해서가 아니라 뇌가 그렇게 설계됐기 때문이에요. 자책 대신 "내 뇌는 보상에 민감하구나"라고 이해하는 게 첫걸음입니다.', en: 'Attention isn\'t an on/off switch — it responds to interest and reward. Hyper-focusing for hours on something fun yet failing at boring tasks isn\'t weakness; it\'s how the brain is built. The first step is understanding "my brain is reward-sensitive" instead of self-blame.', ja: '注意はオンオフのスイッチでなく、興味と報酬に反応するシステム。楽しい事に何時間も没頭(過集中)し退屈な事に5分も持たないのは、意志でなく脳の設計。自責でなく「報酬に敏感な脳だ」と理解する事が第一歩。' },
        tip: { ko: '지루한 일에 점수·타이머·작은 보상을 붙여 "게임"으로 바꿔보세요.', en: 'Add points, a timer, or a small reward to turn boring tasks into a "game".', ja: '退屈な作業に点数·タイマー·小さな報酬を付け「ゲーム化」を。' },
      },
      {
        h: { ko: '환경이 의지를 대신한다', en: 'Let environment do the work', ja: '環境に意志を代行させる' },
        key: { ko: '의지로 버티지 말고 환경을 설계', en: 'Design the room, not the willpower', ja: '意志でなく環境を設計' },
        p: { ko: '의지력은 한정된 배터리예요. 같은 양으로 더 멀리 가려면 마찰을 줄여야 합니다. 휴대폰을 눈에 안 보이는 다른 방에 두고, 오늘 할 일을 딱 3개로 줄이고, 25분 집중 + 5분 휴식 타이머(뽀모도로)를 켜보세요. 유혹을 "참는" 게 아니라 애초에 손이 닿지 않게 치우는 것이 핵심입니다.', en: 'Willpower is a limited battery. To go further on the same charge, cut friction. Put your phone out of sight in another room, shrink today\'s list to just 3 items, and run a 25-min focus + 5-min break timer (Pomodoro). Don\'t "resist" temptation — remove it from reach.', ja: '意志力は有限のバッテリー。同じ量で遠くへ行くには摩擦を減らす。スマホは別室、今日のやる事は3つ、25分集中+5分休憩タイマー(ポモドーロ)。誘惑を「我慢」でなく手の届かぬ所へ片付けるのが核心。' },
        tip: { ko: '지금 휴대폰을 화면이 안 보이게 다른 방·가방에 넣어보세요.', en: 'Put your phone face-down in another room or bag right now.', ja: '今スマホを画面が見えない別室·カバンへ。' },
      },
      {
        h: { ko: '시작의 장벽을 낮춰라', en: 'Lower the start barrier', ja: '開始のハードルを下げる' },
        key: { ko: '"딱 5분만" — 완벽보다 착수', en: '"Just 5 minutes" — start beats perfect', ja: '「まず5分」着手＞完璧' },
        p: { ko: 'ADHD 성향의 가장 큰 적은 "시작"입니다. 일이 거대하게 느껴질수록 뇌는 회피를 택해요. "딱 5분만 하자"라고 작게 쪼개면 시작의 마찰이 확 줄고, 일단 시작하면 관성이 붙어 계속하게 됩니다. 완벽하게 하려다 영영 시작 못 하느니, 엉성하게라도 시작하는 편이 항상 낫습니다.', en: 'For ADHD-style brains the biggest enemy is starting. The bigger a task feels, the more the brain avoids it. Shrinking it to "just 5 minutes" slashes the friction, and once you begin, momentum carries you. A messy start always beats a perfect non-start.', ja: 'ADHD的脳の最大の敵は「開始」。課題が巨大に感じるほど脳は回避する。「まず5分」と小さく刻めば摩擦が激減し、始めれば惰性で続く。完璧を狙い永遠に始めぬより、雑でも着手が常に勝る。' },
        tip: { ko: '할 일을 "5분 안에 끝낼 첫 한 조각"으로 쪼개 적어보세요.', en: 'Break the task into "the first piece you can finish in 5 minutes".', ja: 'タスクを「5分で終わる最初の一片」に刻んで書く。' },
      },
      {
        h: { ko: '뇌의 리듬을 존중하라', en: 'Respect your brain\'s rhythm', ja: '脳のリズムを尊重' },
        key: { ko: '잘 되는 시간대에 중요한 일 배치', en: 'Do hard work at your peak hours', ja: '冴える時間に重要な事を' },
        p: { ko: '집중력은 하루 종일 일정하지 않습니다. 사람마다 머리가 가장 맑은 "골든타임"이 있어요. 그 시간에 가장 어려운 일을 배치하고, 에너지가 떨어지는 시간엔 단순 작업을 두면 같은 노력으로 훨씬 많은 걸 해냅니다. 수면 부족은 ADHD 성향을 그대로 증폭하니, 잘 자는 것 자체가 집중력 훈련이에요.', en: 'Focus isn\'t constant all day — everyone has a "golden hour" when the mind is clearest. Put your hardest task there and save routine work for low-energy windows; same effort, far more output. Sleep deprivation amplifies ADHD traits, so sleeping well is itself focus training.', ja: '集中力は一日中一定ではなく、人それぞれ頭が冴える「ゴールデンタイム」がある。そこに最難の仕事を、低エネルギー時間に単純作業を置けば同じ労力で成果倍増。睡眠不足はADHD傾向を増幅するので、よく眠る事自体が集中訓練。' },
        tip: { ko: '오늘 가장 머리가 맑았던 시간을 메모해, 내일 중요한 일을 그때로 옮겨보세요.', en: 'Note when you felt sharpest today, and move tomorrow\'s key task there.', ja: '今日最も冴えた時間をメモし、明日の重要事をそこへ。' },
      },
    ],
    takeaways: [
      { ko: '집중 안 됨 = 고장이 아니라 보상에 민감한 설계', en: 'Trouble focusing = reward-sensitive design, not a defect', ja: '集中困難＝故障でなく報酬敏感な設計' },
      { ko: '유혹은 "참기"보다 "치우기"', en: 'Remove temptation rather than resisting it', ja: '誘惑は「我慢」より「片付け」' },
      { ko: '"딱 5분"으로 시작 장벽 낮추기', en: 'Use "just 5 minutes" to lower the start barrier', ja: '「まず5分」で開始ハードルを下げる' },
    ],
    close: { ko: '집중력은 타고난 한계가 아니라, 설계할 수 있는 시스템입니다.', en: 'Focus isn\'t a fixed limit — it\'s a system you can design.', ja: '集中力は生まれつきの限界でなく、設計できるシステムです。' },
  },
  {
    id: 'burnout-recover',
    emoji: '🌱',
    test: 'burnout',
    tag: { ko: '번아웃·회복', en: 'Burnout·Recovery', ja: '燃え尽き·回復' },
    readMin: 4,
    title: { ko: '번아웃은 의지박약이 아니라 신호입니다', en: 'Burnout isn\'t weakness — it\'s a signal', ja: '燃え尽きは弱さではなくサイン' },
    summary: { ko: '번아웃의 3가지 신호와, 무너지기 전에 회복하는 작은 습관들', en: 'The 3 signs of burnout and small habits to recover before you crash', ja: '燃え尽きの3つのサインと、崩れる前の回復習慣' },
    intro: { ko: '아침에 눈을 떠도 이미 지쳐 있고, 좋아하던 일조차 시큰둥하다면 — 당신이 약해진 게 아닙니다. 몸과 마음이 "이대로는 안 된다"고 보내는 정직한 신호일 수 있어요.', en: 'If you wake up already exhausted and even what you loved feels flat — you haven\'t gotten weaker. It may be an honest signal that something has to change.', ja: '朝起きても既に疲れ、好きだった事すら色褪せる — それは弱くなったのでなく、心身の正直なサインかもしれません。' },
    sections: [
      {
        h: { ko: '소진·냉소·무력의 3신호', en: 'Exhaustion, cynicism, inefficacy', ja: '消耗·冷笑·無力の3サイン' },
        key: { ko: '게으름 아님 — 정서적 고갈', en: 'Not laziness — emotional depletion', ja: '怠けでなく情緒的消耗' },
        p: { ko: '번아웃은 게으름이 아니라 정서적 연료가 바닥난 상태입니다. 학계는 세 가지 신호로 봐요: ① 충전해도 안 가시는 소진감, ② 사람·일에 시큰둥해지는 냉소, ③ "뭘 해도 소용없다"는 무력감. 이 셋이 함께 온다면 의지를 더 짜내기보다 회복 모드로 전환할 때입니다.', en: 'Burnout isn\'t laziness — it\'s an empty emotional tank. Research names three signs: ① exhaustion that rest won\'t fix, ② cynicism toward people and work, ③ a sense that "nothing I do matters." When all three show up together, it\'s time to switch to recovery, not squeeze out more willpower.', ja: '燃え尽きは怠けでなく情緒的燃料切れ。研究は3サインを挙げる：①休んでも取れぬ消耗、②人·仕事への冷笑、③「何をしても無駄」の無力感。3つ揃えば意志を絞るより回復モードへ。' },
        tip: { ko: '지금 내 상태가 셋 중 몇 개인지 손가락으로 세어보세요.', en: 'Count on your fingers how many of the three you feel now.', ja: '今、3つのうち幾つ当てはまるか指で数えて。' },
      },
      {
        h: { ko: '거절이 회복의 시작', en: 'Saying no is recovery', ja: '断りが回復の始まり' },
        key: { ko: '새는 곳을 막아야 채워진다', en: 'You refill only after stopping the leaks', ja: '漏れを止めて初めて満ちる' },
        p: { ko: '컵에 물을 부어도 바닥에 구멍이 있으면 차지 않습니다. 회복도 마찬가지예요 — 에너지가 새는 곳을 먼저 막아야 합니다. 모든 부탁을 다 받는 "착한 사람" 모드가 번아웃의 흔한 원인이에요. 오늘 딱 한 가지 부탁을 정중히 거절하고, 급하지 않은 일 하나를 내일로 미뤄보세요.', en: 'Pouring water into a cup with a hole at the bottom never fills it — recovery works the same: stop the leaks first. The "nice person" mode of accepting every request is a classic burnout driver. Today, politely decline one request and push one non-urgent task to tomorrow.', ja: '底に穴のあるコップは水を注いでも満ちない。回復も同じで漏れを先に止める。全ての頼みを受ける「良い人」モードは燃え尽きの典型原因。今日一つ丁寧に断り、急がぬ事を一つ明日へ。' },
        tip: { ko: '오늘 거절할 부탁 하나를 미리 정해두세요.', en: 'Pick in advance one request you\'ll say no to today.', ja: '今日断る頼みを一つ先に決めておく。' },
      },
      {
        h: { ko: '아무것도 안 하는 시간', en: 'Time doing nothing', ja: '何もしない時間' },
        key: { ko: '쉼은 보상이 아니라 정비', en: 'Rest is maintenance, not a reward', ja: '休息はご褒美でなく整備' },
        p: { ko: '많은 사람이 "할 일을 다 끝내면 쉬어야지"라고 하지만, 그날은 오지 않습니다. 쉼은 성과에 대한 보상이 아니라, 계속 달리기 위한 필수 정비예요. 하루 20분, 생산성을 완전히 내려놓고 그냥 멈추는 시간을 일정에 "약속"처럼 넣어두세요. 멍때리기, 산책, 음악 — 목적 없는 시간이 뇌를 회복시킵니다.', en: 'Many say "I\'ll rest once everything is done," but that day never comes. Rest isn\'t a reward for output — it\'s required maintenance to keep running. Schedule 20 minutes a day of doing nothing, like an appointment you can\'t skip. Spacing out, a walk, music — purposeless time is what restores the brain.', ja: '多くが「全部終えたら休む」と言うが、その日は来ない。休息は成果のご褒美でなく走り続ける為の必須整備。1日20分、生産性を完全に手放し止まる時間を予定に「約束」として入れる。ぼんやり·散歩·音楽 — 目的なき時間が脳を回復させる。' },
        tip: { ko: '내일 달력에 "아무것도 안 하기 20분"을 일정으로 추가하세요.', en: 'Add "20 min of nothing" to tomorrow\'s calendar.', ja: '明日のカレンダーに「何もしない20分」を追加。' },
      },
      {
        h: { ko: '작은 회복이 먼저다', en: 'Small recovery comes first', ja: '小さな回復が先' },
        key: { ko: '큰 변화 전, 잠·끼니·햇빛부터', en: 'Before big change: sleep, meals, sunlight', ja: '大改革前に睡眠·食事·日光' },
        p: { ko: '번아웃일 때 "퇴사해야 하나, 다 바꿔야 하나" 같은 큰 결정에 매달리기 쉽지만, 고갈된 상태에선 좋은 판단이 안 나옵니다. 거대한 변화보다 기본기 회복이 먼저예요: 같은 시간에 자기, 끼니 거르지 않기, 낮에 햇빛 10분 쬐기. 몸의 연료가 조금 차오른 뒤에야 인생의 큰 그림이 다시 보입니다.', en: 'In burnout it\'s tempting to fixate on big decisions like quitting or overhauling everything, but a depleted mind makes poor calls. Restore the basics before any big move: sleep on schedule, don\'t skip meals, get 10 minutes of daylight. Only after your fuel refills does the big picture come back into focus.', ja: '燃え尽き時は「辞めるべきか、全部変えるか」と大決断に囚われがちだが、枯渇状態では良い判断は出ない。大改革より基本回復が先：同じ時刻に寝る·食事を抜かない·昼に日光10分。燃料が少し満ちて初めて人生の全体像が再び見える。' },
        tip: { ko: '오늘 밤, 평소보다 30분 일찍 누워보세요.', en: 'Tonight, lie down 30 minutes earlier than usual.', ja: '今夜、いつもより30分早く横になる。' },
      },
    ],
    takeaways: [
      { ko: '소진·냉소·무력 = 회복으로 전환하라는 신호', en: 'Exhaustion·cynicism·inefficacy = switch to recovery', ja: '消耗·冷笑·無力＝回復への合図' },
      { ko: '거절로 에너지가 새는 곳부터 막기', en: 'Stop energy leaks by saying no', ja: '断りでエネルギー漏れを止める' },
      { ko: '쉼은 정비 — 20분 멈춤을 일정에', en: 'Rest is maintenance — schedule a 20-min pause', ja: '休息は整備 — 20分の停止を予定に' },
    ],
    close: { ko: '쉬는 것은 게으름이 아니라, 다시 달리기 위한 충전입니다.', en: 'Rest isn\'t laziness — it\'s charging to run again.', ja: '休むのは怠けでなく、再び走る為の充電です。' },
  },
  {
    id: 'attachment',
    emoji: '💞',
    test: 'love',
    tag: { ko: '관계·애착', en: 'Relationship·Attachment', ja: '関係·愛着' },
    readMin: 5,
    title: { ko: '내 연애가 반복되는 이유, 애착유형', en: 'Why your relationships repeat: attachment styles', ja: '恋愛が繰り返す理由、愛着タイプ' },
    summary: { ko: '안정·불안·회피·혼란 4가지 애착유형과, 더 건강한 관계로 가는 법', en: 'The 4 attachment styles and a path to healthier relationships', ja: '4つの愛着タイプと、健全な関係への道' },
    intro: { ko: '매번 다른 사람을 만나는데 이상하게 끝은 비슷하지 않나요? 그건 운이 나빠서가 아니라, 우리 안에 새겨진 "관계의 지도"를 따라 움직이기 때문일 수 있어요.', en: 'You date different people, yet the endings feel oddly similar? That may not be bad luck — you might be following a "relationship map" wired inside you.', ja: '相手は毎回違うのに終わりは妙に似ていませんか?それは運でなく、心に刻まれた「関係の地図」をなぞっているからかも。' },
    sections: [
      {
        h: { ko: '애착은 어린 시절의 지도', en: 'Attachment is an early map', ja: '愛着は幼少期の地図' },
        key: { ko: '사랑하는 방식엔 뿌리가 있다', en: 'How you love has roots', ja: '愛し方には根がある' },
        p: { ko: '애착유형은 어릴 적 양육자와의 경험에서 만들어진, "가까운 사람을 어떻게 대할지"에 대한 무의식의 지도입니다. 크게 안정형, 불안형(매달림), 회피형(거리 둠), 혼란형(둘 사이 오감)으로 나뉘어요. 어떤 유형이든 옳고 그름이 아니라, 살아남기 위해 익힌 전략이라는 점을 기억하세요.', en: 'Attachment style is an unconscious map of "how to treat people close to me," shaped by early caregiver experiences. Broadly: secure, anxious (clings), avoidant (keeps distance), and disorganized (swings between). No style is right or wrong — each is a survival strategy you once learned.', ja: '愛着タイプは幼少期の養育者経験で作られた「近い人への接し方」の無意識の地図。安定·不安(しがみつく)·回避(距離を置く)·混乱(両極を行き来)に大別。優劣でなく、生き延びる為に身につけた戦略と覚えて。' },
        tip: { ko: '갈등 상황에서 나는 매달리는 편인지, 거리를 두는 편인지 떠올려보세요.', en: 'In conflict, do you tend to cling or to pull away? Recall a moment.', ja: '対立時、しがみつく方か距離を置く方か思い出して。' },
      },
      {
        h: { ko: '불안-회피의 덫', en: 'The anxious-avoidant trap', ja: '不安-回避の罠' },
        key: { ko: '가장 끌리고 가장 힘든 조합', en: 'The most magnetic, most painful pairing', ja: '最も惹かれ最も辛い組合せ' },
        p: { ko: '쫓아가는 불안형과 도망가는 회피형이 만나면 강하게 끌리지만 가장 고통스러운 패턴이 됩니다. 불안형이 다가갈수록 회피형은 물러나고, 그럴수록 불안형은 더 매달려요 — 쫓고 쫓기는 악순환이죠. 이건 사랑이 부족해서가 아니라 두 지도가 충돌하는 것이고, 패턴을 이름 붙여 알아차리는 것만으로도 휘둘림이 줄어듭니다.', en: 'When the anxious (who chases) meets the avoidant (who flees), the pull is intense but the pattern is the most painful. The closer the anxious gets, the more the avoidant withdraws — and the more the anxious clings: a chase-and-retreat loop. It isn\'t a lack of love but two maps clashing, and simply naming the pattern loosens its grip.', ja: '追う不安型と逃げる回避型が出会うと強く惹かれるが最も辛いパターンに。不安型が近づくほど回避型は退き、不安型は更にしがみつく追走の悪循環。愛不足でなく二つの地図の衝突で、パターンに名前を付け気づくだけで振り回されにくくなる。' },
        tip: { ko: '다툴 때 "지금 우리 쫓고-도망 패턴이네"라고 속으로 이름 붙여보세요.', en: 'In a fight, silently label it: "this is our chase-and-flee pattern."', ja: '喧嘩時「今、追走パターンだ」と心で名付ける。' },
      },
      {
        h: { ko: '유형은 바꿀 수 있다', en: 'Styles can change', ja: 'タイプは変えられる' },
        key: { ko: '애착은 운명이 아니다', en: 'Attachment isn\'t destiny', ja: '愛着は運命ではない' },
        p: { ko: '가장 희망적인 사실은, 애착유형이 고정된 운명이 아니라는 거예요. 안정적인 사람과의 관계 경험, 자기 패턴에 대한 이해, 그리고 필요하면 상담을 통해 누구나 점점 "안정형"에 가까워질 수 있습니다. 핵심은 자기 패턴을 부끄러워하지 않고, 호기심을 갖고 관찰하는 태도예요.', en: 'The most hopeful fact: attachment isn\'t a fixed fate. Through relationships with secure people, understanding your own patterns, and counseling when needed, anyone can drift toward "secure" over time. The key is observing your patterns with curiosity instead of shame.', ja: '最も希望的な事実は、愛着が固定の運命でない事。安定した人との関係経験·自己パターンの理解·必要なら相談で、誰でも次第に「安定型」へ近づける。鍵は自分のパターンを恥じず好奇心で観察する姿勢。' },
        tip: { ko: '안정적이라 느끼는 사람과의 대화 한 번을 이번 주에 만들어보세요.', en: 'Plan one conversation this week with someone who feels secure.', ja: '今週、安定を感じる人との会話を一回作る。' },
      },
      {
        h: { ko: '관계의 신호등 세우기', en: 'Put up relationship traffic lights', ja: '関係の信号を立てる' },
        key: { ko: '필요를 말로 표현하기', en: 'Put your needs into words', ja: '必要を言葉にする' },
        p: { ko: '건강한 관계의 비결은 마음을 읽어주길 기대하는 대신, 필요를 말로 표현하는 것입니다. "나 지금 좀 불안해, 연락 한 번만 해줄래?"처럼 비난 없이 요청하면 상대가 반응할 여지가 생겨요. 또 나에게 안정감을 주는 것과 불안하게 하는 것이 무엇인지 스스로 알아두면, 관계에서 무엇을 지키고 무엇을 말할지가 분명해집니다.', en: 'The secret to healthy relationships is voicing your needs instead of expecting mind-reading. A blame-free request like "I feel anxious right now — could you check in?" gives the other person room to respond. Knowing what gives you security versus what unsettles you makes it clear what to protect and what to ask for.', ja: '健全な関係の秘訣は、察してもらう期待でなく必要を言葉にする事。「今少し不安、一度連絡くれる?」と非難なく頼めば相手に応じる余地が生まれる。何が安心で何が不安かを自分で知れば、守るべき事と伝えるべき事が明確になる。' },
        tip: { ko: '나를 안심시키는 것 1가지를 적어, 가까운 사람에게 알려주세요.', en: 'Write one thing that reassures you and tell someone close.', ja: '安心する事を1つ書き、近い人に伝える。' },
      },
    ],
    takeaways: [
      { ko: '애착유형 = 살아남기 위해 익힌 관계 전략', en: 'Attachment = a relationship survival strategy', ja: '愛着＝生き延びる為の関係戦略' },
      { ko: '불안-회피 악순환은 이름 붙이면 약해진다', en: 'Naming the anxious-avoidant loop weakens it', ja: '不安-回避の悪循環は名付けると弱まる' },
      { ko: '필요는 비난 없이 "말"로 표현하기', en: 'Express needs in words, without blame', ja: '必要は非難なく「言葉」で' },
    ],
    close: { ko: '패턴을 이해하는 순간, 반복은 선택이 됩니다.', en: 'The moment you understand the pattern, repetition becomes a choice.', ja: 'パターンを理解した瞬間、繰り返しは選択になる。' },
  },
  {
    id: 'dopamine-detox',
    emoji: '🧘',
    test: 'dopamine',
    tag: { ko: '디지털·도파민', en: 'Digital·Dopamine', ja: 'デジタル·ドーパミン' },
    readMin: 4,
    title: { ko: '도파민 디톡스, 진짜 효과 있을까?', en: 'Dopamine detox: does it actually work?', ja: 'ドーパミンデトックスは本当に効く?' },
    summary: { ko: '숏폼·SNS 과자극에서 벗어나 집중력과 만족감을 되찾는 현실적 방법', en: 'A realistic way to escape short-form overstimulation and regain focus', ja: 'ショート動画の過刺激から抜け集中を取り戻す現実的方法' },
    intro: { ko: '"5분만 봐야지" 하고 켠 숏폼이 어느새 한 시간. 그리고 남는 건 묘한 허전함. 우리 뇌에서 무슨 일이 일어나는 걸까요?', en: '"Just 5 minutes" of short videos somehow becomes an hour — leaving an odd emptiness. What\'s happening in your brain?', ja: '「5分だけ」のショート動画がいつの間にか一時間。残るのは妙な虚しさ。脳で何が起きているのでしょう?' },
    sections: [
      {
        h: { ko: '문제는 도파민이 아니다', en: 'Dopamine isn\'t the villain', ja: '問題はドーパミンではない' },
        key: { ko: '도파민 = 나쁜 게 아니라 동기의 연료', en: 'Dopamine isn\'t bad — it\'s motivation\'s fuel', ja: 'ドーパミンは悪でなく動機の燃料' },
        p: { ko: '"도파민 디톡스"라는 말 때문에 도파민이 나쁜 물질처럼 느껴지지만, 사실 도파민은 우리를 움직이게 하는 동기의 연료입니다. 진짜 문제는 숏폼·게임·알림처럼 즉각적이고 강한 자극에 뇌가 길들여지는 것이에요. 그러면 책 읽기나 산책처럼 잔잔한 보상은 "심심하게" 느껴지게 됩니다.', en: 'The phrase "dopamine detox" makes dopamine sound toxic, but it\'s actually the fuel of motivation. The real problem is the brain getting trained on instant, intense hits — short videos, games, notifications. Then quiet rewards like reading or a walk start to feel "boring."', ja: '「ドーパミンデトックス」の語感でドーパミンが悪物質に思えるが、実は動機の燃料。真の問題はショート·ゲーム·通知の即時·強刺激に脳が慣れる事。すると読書や散歩等の穏やかな報酬が「退屈」に感じられる。' },
        tip: { ko: '오늘 숏폼을 본 총 시간을 화면 사용시간에서 확인해보세요.', en: 'Check your screen-time report for total short-video minutes today.', ja: 'スクリーンタイムで今日のショート視聴総時間を確認。' },
      },
      {
        h: { ko: '지루함을 견디는 연습', en: 'Practice tolerating boredom', ja: '退屈に耐える練習' },
        key: { ko: '심심함을 견디면 보상 기준이 회복', en: 'Sitting with boredom resets your baseline', ja: '退屈に耐えると報酬基準が回復' },
        p: { ko: '신호 대기, 엘리베이터, 잠깐의 정적 — 무료한 순간 즉시 폰을 집는 습관이 뇌의 자극 기준을 계속 끌어올립니다. 그 순간 폰을 집지 않고 그냥 멍하니 있어 보세요. 처음엔 불편하지만, 지루함을 견디는 연습을 반복하면 뇌의 보상 기준이 천천히 정상으로 돌아옵니다.', en: 'Waiting at a light, in an elevator, a brief silence — grabbing the phone the instant you\'re bored keeps raising your stimulation baseline. In that moment, don\'t reach for it; just sit and space out. It\'s uncomfortable at first, but repeatedly tolerating boredom slowly returns your reward baseline to normal.', ja: '信号待ち·エレベーター·僅かな静寂 — 退屈の瞬間すぐスマホを掴む癖が刺激基準を上げ続ける。その時掴まずぼんやりしてみる。最初は不快だが退屈に耐える練習を繰り返すと報酬基準が徐々に正常へ戻る。' },
        tip: { ko: '다음에 줄 설 때, 폰 대신 주변을 5초만 관찰해보세요.', en: 'Next time you wait in line, observe your surroundings for 5 seconds instead of the phone.', ja: '次に並ぶ時、スマホでなく周囲を5秒観察。' },
      },
      {
        h: { ko: '환경 설계가 핵심', en: 'Design the environment', ja: '環境設計が鍵' },
        key: { ko: '의지보다 마찰을 늘리는 설정', en: 'Add friction instead of relying on willpower', ja: '意志より摩擦を足す設定' },
        p: { ko: '완전한 단식 같은 극단적 디톡스는 며칠 못 가 반동이 옵니다. 더 현실적인 건 "마찰"을 늘리는 거예요: 중독성 앱은 폴더 깊숙이 숨기고 홈 화면을 비우기, 알림 끄기, 흑백 화면 모드 켜기, 잘 때 폰을 침실 밖에 두기. 손이 한 번 더 가게 만들수록 무의식적 사용이 확 줄어듭니다.', en: 'Extreme "total fasting" detoxes usually rebound within days. A more realistic move is adding friction: bury addictive apps deep in a folder and clear your home screen, turn off notifications, switch to grayscale, and keep your phone out of the bedroom at night. Every extra tap you add sharply cuts mindless use.', ja: '完全断食のような極端デトックスは数日で反動が来る。現実的なのは「摩擦」を足す事：中毒アプリはフォルダ奥に隠しホーム画面を空に·通知オフ·白黒モード·就寝時は寝室外へ。一手間増やすほど無意識の使用が激減する。' },
        tip: { ko: '가장 오래 보는 앱 1개를 홈 화면에서 폴더 안으로 옮기세요.', en: 'Move your most-used app off the home screen into a folder.', ja: '最も長く見るアプリをホームからフォルダへ移す。' },
      },
      {
        h: { ko: '느린 보상으로 갈아타기', en: 'Switch to slow rewards', ja: '遅い報酬へ乗り換え' },
        key: { ko: '빈자리를 잔잔한 활동으로 채우기', en: 'Fill the gap with calm activities', ja: '空白を穏やかな活動で埋める' },
        p: { ko: '자극을 줄이기만 하면 그 빈자리가 허전해서 다시 폰을 찾게 됩니다. 그래서 줄이는 동시에 "느린 보상" 활동으로 갈아타는 게 중요해요: 운동, 악기, 요리, 산책, 손글씨처럼 효과가 천천히 오는 활동들 말이죠. 처음엔 밋밋해도, 이런 활동이 주는 깊고 오래가는 만족감을 뇌가 다시 기억해냅니다.', en: 'Just cutting stimulation leaves an emptiness that pulls you back to the phone. So while you reduce, switch to "slow reward" activities: exercise, an instrument, cooking, walking, handwriting — things whose payoff comes gradually. Bland at first, but your brain re-remembers the deep, lasting satisfaction they bring.', ja: '刺激を減らすだけでは空白が虚しく再びスマホへ。減らすと同時に「遅い報酬」活動へ乗り換える事が重要：運動·楽器·料理·散歩·手書き等、効果が徐々に来る活動。最初は地味でも、その深く長い満足を脳が再び思い出す。' },
        tip: { ko: '폰을 집고 싶을 때 대신 할 "느린 활동" 1개를 미리 정해두세요.', en: 'Pre-pick one "slow activity" to do instead when you reach for the phone.', ja: 'スマホを掴みたい時にする「遅い活動」を一つ決めておく。' },
      },
    ],
    takeaways: [
      { ko: '도파민은 적이 아니라 동기의 연료', en: 'Dopamine is fuel, not the enemy', ja: 'ドーパミンは敵でなく燃料' },
      { ko: '지루함 견디기 = 보상 기준 리셋 훈련', en: 'Tolerating boredom retrains your baseline', ja: '退屈に耐える＝基準リセット訓練' },
      { ko: '의지 대신 "마찰"을 늘리는 환경 설계', en: 'Add friction instead of relying on willpower', ja: '意志より「摩擦」を足す環境設計' },
    ],
    close: { ko: '절제는 참는 게 아니라, 자극의 기준을 되돌리는 일입니다.', en: 'Restraint isn\'t suffering — it\'s resetting your stimulation baseline.', ja: '節制は我慢でなく、刺激の基準を戻す事。' },
  },
  {
    id: 'resilience',
    emoji: '🎋',
    test: 'resilience',
    tag: { ko: '회복탄력성', en: 'Resilience', ja: 'レジリエンス' },
    readMin: 4,
    title: { ko: '무너져도 다시 일어서는 사람들의 비밀', en: 'The secret of people who bounce back', ja: '崩れても立ち直る人の秘密' },
    summary: { ko: '회복탄력성은 타고나는 게 아니라 기를 수 있는 근육이라는 이야기', en: 'Resilience isn\'t born — it\'s a muscle you can train', ja: 'レジリエンスは生まれつきでなく鍛える筋肉' },
    intro: { ko: '같은 시련을 겪고도 누구는 무너지고 누구는 다시 일어섭니다. 그 차이는 타고난 강철 멘탈이 아니라, 연습으로 키운 "회복하는 힘"에 있어요.', en: 'Facing the same hardship, some crumble and some rise again. The difference isn\'t a born steel mind but a "recovery muscle" built through practice.', ja: '同じ試練でも崩れる人と立ち直る人がいる。差は生まれつきの鋼メンタルでなく、練習で育てた「回復する力」にある。' },
    sections: [
      {
        h: { ko: '단단함은 강함이 아니다', en: 'Resilience isn\'t toughness', ja: '強靭さは強さではない' },
        key: { ko: '안 무너지는 게 아니라 다시 일어서는 힘', en: 'Not never-falling, but rising again', ja: '崩れぬ事でなく立ち直る力' },
        p: { ko: '회복탄력성은 절대 안 흔들리는 강철 멘탈이 아닙니다. 오히려 흔들리고 무너진 뒤에 다시 일어서는 힘이에요. 그 핵심은 감정을 억누르는 게 아니라, 슬픔·분노·불안을 충분히 느끼고 흘려보내는 능력입니다. 울어도 되고 힘들다고 말해도 되는 사람이, 사실은 더 빨리 회복합니다.', en: 'Resilience isn\'t a steel mind that never shakes — it\'s the power to rise after shaking and falling. Its core isn\'t suppressing emotion but fully feeling sadness, anger, and fear, then letting them pass through. The person who can cry and admit "this is hard" actually recovers faster.', ja: 'レジリエンスは決して揺れぬ鋼メンタルでなく、揺れ崩れた後立ち直る力。核心は感情を抑圧せず、悲しみ·怒り·不安を十分感じ流す力。泣いてよく辛いと言える人ほど、実は早く回復する。' },
        tip: { ko: '지금 느끼는 감정에 이름을 하나 붙여보세요(예: "서운함").', en: 'Name one emotion you feel right now (e.g., "let down").', ja: '今の感情に名前を一つ付ける(例「寂しさ」)。' },
      },
      {
        h: { ko: '통제 가능에 집중', en: 'Focus on what you control', ja: '制御可能に集中' },
        key: { ko: '바꿀 수 있는 한 가지에 에너지', en: 'Spend energy on one changeable thing', ja: '変えられる一つに集中' },
        p: { ko: '시련 앞에서 무력해지는 가장 큰 이유는, 바꿀 수 없는 것에 모든 에너지를 쏟기 때문이에요. 회복이 빠른 사람들은 "내가 어쩔 수 없는 것"과 "지금 할 수 있는 것"을 빠르게 나눕니다. 그리고 통제 가능한 작은 한 가지에 집중하죠. 그 작은 성취 하나가 "나는 아직 영향력이 있다"는 감각을 되살립니다.', en: 'The biggest reason hardship leaves us helpless is pouring all our energy into what we can\'t change. People who recover fast quickly separate "what I can\'t control" from "what I can do now," then focus on one small controllable thing. That one small win revives the sense that "I still have agency."', ja: '試練で無力になる最大の理由は、変えられぬ事に全エネルギーを注ぐから。回復が早い人は「どうにもならぬ事」と「今できる事」を素早く分け、制御可能な小さな一つに集中する。その小さな達成が「自分にはまだ影響力がある」感覚を蘇らせる。' },
        tip: { ko: '지금 상황에서 "내가 바꿀 수 있는 한 가지"를 적어보세요.', en: 'Write one thing you can change in your current situation.', ja: '今の状況で「変えられる一つ」を書く。' },
      },
      {
        h: { ko: '연결이 회복을 만든다', en: 'Connection heals', ja: 'つながりが回復を生む' },
        key: { ko: '손 내미는 것이 강함이다', en: 'Reaching out is strength', ja: '手を伸ばす事が強さ' },
        p: { ko: '혼자 다 버티는 게 강한 거라는 생각은 오해입니다. 연구에서 회복탄력성을 가장 잘 예측하는 요인 중 하나가 바로 "기댈 사람이 있는가"예요. 힘들 때 믿는 사람에게 손을 내미는 것은 약함이 아니라 가장 현명한 생존 전략입니다. 거창한 위로가 아니라, 그냥 "나 요즘 좀 힘들어"라고 말하는 것에서 회복이 시작돼요.', en: 'The idea that toughing everything out alone is strength is a myth. One of the best predictors of resilience in research is simply "having someone to lean on." Reaching out to someone you trust when you\'re struggling isn\'t weakness — it\'s the wisest survival strategy. Recovery often starts not with grand comfort but with a plain "I\'ve been having a hard time."', ja: '一人で全て耐えるのが強さという考えは誤解。研究でレジリエンスを最もよく予測する要因の一つが「頼れる人がいるか」。辛い時信頼する人に手を伸ばすのは弱さでなく最も賢い生存戦略。大層な慰めでなく「最近少し辛い」と言う事から回復は始まる。' },
        tip: { ko: '믿는 사람 한 명에게 "요즘 좀 힘들어" 메시지를 보내보세요.', en: 'Text one trusted person: "I\'ve been having a hard time."', ja: '信頼する人に「最近少し辛い」と送ってみる。' },
      },
      {
        h: { ko: '의미를 다시 쓰기', en: 'Rewrite the meaning', ja: '意味を書き直す' },
        key: { ko: '"왜 나에게" → "여기서 뭘 배울까"', en: '"Why me" → "what can I learn"', ja: '「なぜ私に」→「何を学べるか」' },
        p: { ko: '같은 사건도 "왜 나에게 이런 일이"라고 보면 무너지지만, "이 일이 나에게 무엇을 가르쳐줄까"라고 보면 다시 일어설 길이 생깁니다. 이건 억지 긍정이 아니라, 시련에서 의미를 발견하는 능력이에요. 고통을 부정하지 않으면서도 그 안에서 한 줄기 배움이나 방향을 찾을 때, 회복탄력성은 가장 단단해집니다.', en: 'The same event crushes you when seen as "why is this happening to me," but opens a path when reframed as "what can this teach me." This isn\'t forced positivity — it\'s the ability to find meaning in hardship. Resilience grows strongest when you find a thread of learning or direction without denying the pain.', ja: '同じ出来事も「なぜ私に」と見れば崩れ、「これが何を教えるか」と捉え直せば立ち直る道が生まれる。無理な前向きでなく、試練に意味を見出す力。痛みを否定せずその中に一筋の学びや方向を見つける時、レジリエンスは最も強くなる。' },
        tip: { ko: '최근의 힘든 일에서 배운 점 한 가지를 적어보세요.', en: 'Write one thing you learned from a recent hardship.', ja: '最近の辛い事から学んだ事を一つ書く。' },
      },
    ],
    takeaways: [
      { ko: '회복탄력성 = 무너진 뒤 다시 일어서는 근육', en: 'Resilience = the muscle of rising after falling', ja: 'レジリエンス＝崩れた後立ち直る筋肉' },
      { ko: '통제 가능한 작은 한 가지에 집중', en: 'Focus on one small controllable thing', ja: '制御可能な小さな一つに集中' },
      { ko: '손 내밀기 + 의미 다시 쓰기', en: 'Reach out + reframe the meaning', ja: '手を伸ばす＋意味を書き直す' },
    ],
    close: { ko: '단단한 사람은 안 흔들리는 게 아니라, 흔들린 뒤 돌아올 줄 아는 사람입니다.', en: 'The resilient aren\'t unshakable — they know how to return after shaking.', ja: '強い人は揺れない人でなく、揺れた後戻れる人。' },
  },
  {
    id: 'selfesteem-grow',
    emoji: '🪞',
    test: 'selfesteem',
    tag: { ko: '자존감', en: 'Self-esteem', ja: '自尊心' },
    readMin: 4,
    title: { ko: '자존감은 "잘나서" 생기는 게 아니에요', en: 'Self-esteem doesn\'t come from being great', ja: '自尊心は「優秀さ」から生まれない' },
    summary: { ko: '조건부 자존감의 함정과, 실수한 나를 대하는 말투부터 바꾸는 자기 존중 연습', en: 'The trap of conditional self-worth, and practicing self-respect starting with self-talk', ja: '条件付き自尊心の罠と、自分への口調から変える自己尊重の練習' },
    intro: { ko: '"이번 시험만 잘 보면, 살만 빠지면, 취업만 되면 나를 좋아할 수 있을 것 같아." 이런 생각을 해본 적 있나요? 조건이 채워지면 자존감이 생길 것 같지만, 심리학이 발견한 진실은 반대에 가깝습니다.', en: '"If I ace this exam, lose the weight, land the job — then I could like myself." Sound familiar? It feels like self-esteem will come once conditions are met, but psychology finds nearly the opposite.', ja: '「試験さえ、痩せさえ、就職さえすれば自分を好きになれる」。そう思った事は？条件が満たされれば自尊心が生まれそうですが、心理学の発見はほぼ逆です。' },
    sections: [
      {
        h: { ko: '조건부 자존감의 함정', en: 'The conditional self-worth trap', ja: '条件付き自尊心の罠' },
        key: { ko: '성취로 쌓은 자존감은 성취와 함께 무너진다', en: 'Worth built on wins collapses with losses', ja: '成果で築いた自尊心は成果と共に崩れる' },
        p: { ko: '심리학자 크로커(Crocker)의 연구에 따르면, 외모·성적·타인의 인정 같은 "조건"에 자존감을 거는 사람일수록 우울과 불안에 취약했습니다. 조건은 언젠가 반드시 흔들리기 때문이에요. 시험을 잘 봐도 다음 시험이 오고, 칭찬을 받아도 다음 평가가 옵니다. 성취는 기쁨을 주지만, 자존감의 "기초 공사"로는 쓸 수 없어요. 기초는 조건이 아니라 태도 — 나를 대하는 방식에 있습니다.', en: 'Psychologist Jennifer Crocker found that people who stake their worth on "conditions" — looks, grades, others\' approval — are more vulnerable to depression and anxiety, because conditions always eventually wobble. Ace one exam and the next arrives; win praise and the next review looms. Achievement brings joy, but it can\'t be the foundation. The foundation is not a condition but an attitude — how you treat yourself.', ja: '心理学者クロッカーの研究では、外見・成績・承認など「条件」に自尊心を賭ける人ほど鬱と不安に脆弱でした。条件は必ずいつか揺らぐから。試験に受かっても次が来て、称賛されても次の評価が来る。成果は喜びをくれますが、自尊心の「基礎工事」には使えません。基礎は条件でなく態度 — 自分の扱い方にあります。' },
        tip: { ko: '오늘 "~하면 괜찮은 사람"이라는 생각이 들면, 조건 부분을 지우고 읽어보세요.', en: 'When "I\'m OK if..." appears today, delete the "if" clause and reread it.', ja: '今日「〜なら価値がある」と思ったら、条件部分を消して読んで。' },
      },
      {
        h: { ko: '자기비난은 채찍이 아니라 브레이크', en: 'Self-blame is a brake, not a whip', ja: '自己批判は鞭でなくブレーキ' },
        key: { ko: '자책은 동기를 높이지 않는다 — 회피를 높인다', en: 'Self-blame fuels avoidance, not motivation', ja: '自責は動機でなく回避を増やす' },
        p: { ko: '"나를 몰아붙여야 발전한다"는 믿음은 널리 퍼져 있지만, 연구 결과는 다릅니다. 자기비난이 심할수록 실패 후 재도전율이 낮아지고 미루기가 늘어요. 뇌는 비난받을 일을 "위협"으로 분류해 아예 피하게 만들기 때문입니다. 반대로 실수를 인정하되 자신을 다그치지 않는 사람(자기자비)이 더 빨리 다시 시도하고, 장기적으로 더 많이 성장했습니다. 나에게 관대한 건 나태가 아니라 전략이에요.', en: 'The belief "I must push myself hard to improve" is widespread, but research says otherwise. The harsher the self-blame, the lower the retry rate after failure and the greater the procrastination — the brain files blame-worthy tasks as "threats" and avoids them. People who acknowledge mistakes without flogging themselves (self-compassion) retry sooner and grow more over time. Being kind to yourself isn\'t laziness; it\'s strategy.', ja: '「自分を追い込めば成長する」という信念は広く浸透していますが、研究は逆を示します。自己批判が強いほど失敗後の再挑戦率が下がり先延ばしが増える。脳は責められる事を「脅威」に分類し回避させるから。逆にミスを認めつつ責めない人(セルフコンパッション)がより早く再挑戦し、長期的に成長しました。自分への寛容は怠惰でなく戦略です。' },
        tip: { ko: '실수했을 때 "또 이러네" 대신 "누구나 그래, 다음엔 이렇게"로 문장을 바꿔보세요.', en: 'After a slip, swap "again?!" for "happens to everyone — next time I\'ll...".', ja: 'ミスした時「またか」でなく「誰でもある、次はこうしよう」に言い換えを。' },
      },
      {
        h: { ko: '친구에게 하듯 나에게', en: 'Talk to yourself like a friend', ja: '友達に話すように自分へ' },
        key: { ko: '자기 대화의 톤 = 자존감의 온도', en: 'Your self-talk tone = your self-worth temperature', ja: '自己対話のトーン＝自尊心の温度' },
        p: { ko: '친한 친구가 시험에 떨어졌다면 뭐라고 말해줄 건가요? "네가 그럼 그렇지"라고 할 사람은 없을 겁니다. 그런데 우리는 자신에게 매일 그렇게 말해요. 심리학자 크리스틴 네프(Neff)는 이 간극을 좁히는 것이 자존감 회복의 핵심이라고 말합니다. 방법은 단순해요. 힘든 순간에 ① "지금 힘들구나"라고 알아차리고 ② "나만 그런 게 아니야"라고 연결하고 ③ 친구에게 건넬 말을 나에게 건네는 것. 이 세 단계를 반복하면 자기 대화의 기본 톤이 바뀝니다.', en: 'What would you say to a close friend who failed an exam? Nobody would say "typical you." Yet we say that to ourselves daily. Psychologist Kristin Neff argues that closing this gap is the core of rebuilding self-worth. The method is simple: in a hard moment, (1) notice "this is hard right now," (2) connect — "I\'m not the only one," (3) offer yourself the words you\'d offer a friend. Repeat, and your default self-talk tone shifts.', ja: '親友が試験に落ちたら何と言いますか？「やっぱりね」と言う人はいない。なのに私たちは自分に毎日そう言います。心理学者ネフはこの差を縮める事が自尊心回復の核心だと言います。方法は単純。辛い瞬間に①「今辛いんだな」と気づき②「自分だけじゃない」と繋がり③友に掛ける言葉を自分に掛ける。繰り返せば自己対話の基本トーンが変わります。' },
        tip: { ko: '지금 걱정거리 하나를 두고, 친구에게 보낼 위로 문자를 나에게 써보세요.', en: 'Take one current worry and write yourself the comfort text you\'d send a friend.', ja: '今の心配事一つに、友へ送る慰めの文を自分宛てに書いて。' },
      },
      {
        h: { ko: '기록이 감정을 이긴다', en: 'Records beat feelings', ja: '記録が感情に勝つ' },
        key: { ko: '"잘한 일 1개" 기록 = 자기 인정의 증거 수집', en: 'Logging one win a day = collecting evidence', ja: '「良かった事1つ」の記録＝証拠集め' },
        p: { ko: '자존감이 낮을 때 뇌는 부정적인 기억만 선택적으로 재생합니다. 잘한 일 아홉 개는 잊고 실수 한 개만 곱씹죠. 이 편향을 이기는 가장 검증된 도구가 "기록"입니다. 매일 밤 오늘 잘한 일을 딱 한 가지만 적어보세요. 거창할 필요 없어요 — "미루던 설거지를 했다"면 충분합니다. 몇 주치가 쌓이면, 기분이 바닥일 때 감정이 아닌 "증거"를 다시 읽을 수 있게 됩니다. 자존감은 느낌이 아니라 누적된 사실 위에 다시 세울 수 있어요.', en: 'When self-worth is low, the brain selectively replays only the negatives — nine wins forgotten, one mistake on loop. The best-validated tool against this bias is recording. Each night, write down just one thing you did well. It needn\'t be grand — "finally did the dishes" counts. After a few weeks, on rock-bottom days you can reread evidence instead of trusting feelings. Self-esteem can be rebuilt on accumulated facts, not moods.', ja: '自尊心が低い時、脳は否定的記憶だけ選択再生します。九つの善行を忘れ一つのミスを反芻する。この偏りに勝つ最も検証された道具が「記録」。毎晩、今日良くできた事を一つだけ書く。大層な事は不要 —「後回しの皿洗いをした」で十分。数週間分溜まれば、どん底の日に感情でなく「証拠」を読み返せます。自尊心は気分でなく累積した事実の上に再建できます。' },
        tip: { ko: '오늘 밤, 휴대폰 메모에 "오늘 잘한 일 1개"를 적는 것부터 시작해 보세요.', en: 'Tonight, start by noting "one thing I did well today" in your phone.', ja: '今夜、スマホのメモに「今日良くできた事1つ」から始めて。' },
      },
    ],
    takeaways: [
      { ko: '조건("~하면")에 건 자존감은 반드시 흔들린다', en: 'Worth staked on conditions always wobbles', ja: '条件に賭けた自尊心は必ず揺れる' },
      { ko: '자기비난은 동기가 아니라 회피를 만든다', en: 'Self-blame breeds avoidance, not drive', ja: '自己批判は回避を生む' },
      { ko: '친구에게 하듯 말하기 + 잘한 일 1개 기록', en: 'Friend-talk to yourself + log one daily win', ja: '友への言葉＋良かった事1つの記録' },
    ],
    close: { ko: '자존감은 "잘난 나"를 찾는 일이 아니라, "있는 그대로의 나"를 대하는 방식을 바꾸는 일입니다.', en: 'Self-esteem isn\'t about finding a better you — it\'s about changing how you treat the you that\'s here.', ja: '自尊心は「優れた自分」探しでなく、「そのままの自分」への接し方を変える事です。' },
  },
  {
    id: 'socialanx-ease',
    emoji: '😰',
    test: 'socialanx',
    tag: { ko: '사회불안', en: 'Social anxiety', ja: '社交不安' },
    readMin: 4,
    title: { ko: '사람들 앞에서 떨리는 건, 고장이 아니에요', en: 'Trembling in front of people isn\'t a malfunction', ja: '人前で震えるのは故障ではない' },
    summary: { ko: '사회불안의 작동 원리(스포트라이트 착각·회피의 역설)와 조금씩 편해지는 검증된 연습', en: 'How social anxiety works (spotlight illusion, the avoidance paradox) and proven ways to ease it', ja: '社交不安の仕組み(スポットライト錯覚・回避の逆説)と楽になる練習' },
    intro: { ko: '발표 전날 잠이 안 오고, 모임 약속이 다가올수록 취소하고 싶어지고, 말 한마디 하고 밤새 곱씹은 적이 있나요? 사회불안은 성격 결함이 아니라, 아주 흔하고 — 무엇보다 잘 좋아지는 마음의 패턴입니다.', en: 'Sleepless before a presentation, itching to cancel as the gathering nears, replaying one remark all night? Social anxiety isn\'t a character flaw — it\'s very common, and above all, very improvable.', ja: '発表前夜に眠れず、集まりが近づくほどキャンセルしたくなり、一言を夜通し反芻した事は？社交不安は性格の欠陥でなく、とても一般的で — 何より良くなりやすい心のパターンです。' },
    sections: [
      {
        h: { ko: '스포트라이트 착각', en: 'The spotlight illusion', ja: 'スポットライト錯覚' },
        key: { ko: '남들은 나를 생각보다 훨씬 덜 본다', en: 'People notice you far less than you think', ja: '他人は思うよりずっと見ていない' },
        p: { ko: '심리학자 길로비치(Gilovich)의 유명한 실험에서, 민망한 티셔츠를 입고 파티에 들어간 참가자는 "절반은 봤을 것"이라 예상했지만 실제로 알아챈 사람은 23%뿐이었습니다. 우리는 자신에게 쏟아지는 스포트라이트를 크게 과대평가해요. 당신이 어제 곱씹은 그 말실수를 기억하는 사람은, 냉정하게 말해 거의 없습니다. 모두가 각자 자신의 스포트라이트를 걱정하느라 바쁘거든요.', en: 'In Gilovich\'s famous experiment, participants who entered a party in an embarrassing T-shirt guessed half the room would notice — only 23% did. We massively overestimate the spotlight on us. That slip you replayed last night? Frankly, almost nobody remembers it. Everyone is too busy worrying about their own spotlight.', ja: 'ギロヴィッチの有名な実験で、恥ずかしいTシャツでパーティーに入った参加者は「半分は見た」と予想しましたが、実際に気づいたのは23%だけ。私たちは自分へのスポットライトを大きく過大評価します。昨夜反芻したあの失言を覚えている人は、正直ほぼいません。皆それぞれ自分のスポットライトを心配するのに忙しいのです。' },
        tip: { ko: '"지난주 남이 한 말실수"를 하나라도 떠올려보세요 — 안 떠오른다면, 남들도 마찬가지예요.', en: 'Try recalling one slip someone else made last week — can\'t? Neither can they about yours.', ja: '「先週他人がした失言」を一つ思い出してみて — 出てこないなら、相手も同じです。' },
      },
      {
        h: { ko: '회피의 역설', en: 'The avoidance paradox', ja: '回避の逆説' },
        key: { ko: '피하면 잠깐 편하고, 불안은 자란다', en: 'Avoiding soothes now and grows the fear', ja: '回避は今楽で、不安を育てる' },
        p: { ko: '모임을 취소하면 그 순간엔 안도감이 밀려옵니다. 문제는 뇌가 이 안도감을 "봐, 피하니까 살았지?"라는 학습으로 저장한다는 거예요. 다음번엔 같은 상황이 더 위험하게 느껴지고, 회피는 점점 넓어집니다. 발표 → 회식 → 전화 → 카페 주문까지. 사회불안 치료의 핵심이 "노출"인 이유가 여기 있습니다. 불안을 느끼면서도 그 자리에 머물러 "생각보다 괜찮네"를 몸으로 경험하면, 뇌의 위험 예측이 조금씩 수정돼요.', en: 'Cancel the gathering and relief washes in. The problem: the brain stores that relief as a lesson — "see, avoiding saved you." Next time the same situation feels more dangerous, and avoidance spreads: presentations → dinners → phone calls → even ordering coffee. This is why exposure is the core of treatment. Staying put while anxious and bodily experiencing "that was more OK than expected" gradually revises the brain\'s threat forecast.', ja: '集まりをキャンセルすると安堵が押し寄せます。問題は脳がこの安堵を「ほら、避けたから助かった」と学習保存する事。次は同じ状況がより危険に感じ、回避は広がります。発表→会食→電話→カフェの注文まで。社交不安治療の核心が「曝露」である理由です。不安を感じつつその場に留まり「思ったより大丈夫」を体で経験すれば、脳の危険予測が少しずつ修正されます。' },
        tip: { ko: '이번 주, 살짝 불편한 자리 하나만 "취소하지 않고" 가보세요. 목표는 잘하기가 아니라 머물기.', en: 'This week, attend one mildly uncomfortable event without canceling. The goal is staying, not shining.', ja: '今週、少し気まずい場一つを「キャンセルせず」行ってみて。目標は上手くやる事でなく留まる事。' },
      },
      {
        h: { ko: '몸부터 진정시키기', en: 'Calm the body first', ja: 'まず体を鎮める' },
        key: { ko: '4초 들숨, 6초 날숨 — 마음은 몸을 따라온다', en: 'In 4s, out 6s — the mind follows the body', ja: '4秒吸い6秒吐く — 心は体に続く' },
        p: { ko: '긴장하면 심장이 뛰고 손이 떨리는 건 편도체가 울린 가짜 화재경보입니다. 이때 "떨지 말자"고 생각으로 싸우면 대개 집니다 — 생각보다 몸이 빠르거든요. 순서를 바꿔보세요. 날숨을 들숨보다 길게(4초 들이쉬고 6초 내쉬기) 하면 심박을 늦추는 부교감신경이 켜지며 몸이 먼저 가라앉습니다. 발표 직전 화장실에서 1분이면 충분해요. 손이 떨리는 채로도 말할 수 있다는 것 — 그게 몸이 가르쳐주는 자신감입니다.', en: 'A racing heart and shaking hands are a false fire alarm from the amygdala. Fighting it with thoughts ("stop shaking!") usually fails — the body is faster than thought. Reverse the order: exhale longer than you inhale (in 4s, out 6s) and the parasympathetic brake slows your heart; the body settles first. One minute in the restroom before a talk is enough. You can speak even with trembling hands — that is the confidence the body teaches.', ja: '緊張で心臓が跳ね手が震えるのは扁桃体の誤報です。「震えるな」と思考で戦えば大抵負けます — 思考より体が速いから。順序を変えて。吐く息を吸う息より長く(4秒吸い6秒吐く)すれば副交感神経が心拍を落とし、体が先に鎮まります。発表直前、化粧室で1分で十分。手が震えたままでも話せる — それが体が教える自信です。' },
        tip: { ko: '지금 바로 한 번: 4초 들이쉬고, 6초에 걸쳐 천천히 내쉬어 보세요. 5회면 변화가 느껴져요.', en: 'Try now: in for 4, slowly out for 6. Five rounds and you\'ll feel the shift.', ja: '今すぐ一度: 4秒吸って6秒かけて吐く。5回で変化を感じます。' },
      },
      {
        h: { ko: '도움받는 것은 현명한 선택', en: 'Getting help is the smart move', ja: '助けを求めるのは賢明な選択' },
        key: { ko: '사회불안은 상담 효과가 가장 좋은 영역 중 하나', en: 'Social anxiety responds especially well to therapy', ja: '社交不安は相談の効果が高い領域' },
        p: { ko: '혼자 버티는 게 미덕처럼 여겨지지만, 사회불안은 인지행동치료(CBT)의 효과가 가장 잘 입증된 영역 중 하나입니다. 여러 연구에서 치료를 받은 사람의 다수가 뚜렷한 호전을 보였어요. 회피가 일·관계·기회를 좁히고 있다면, 그건 "의지 부족"이 아니라 "도구가 필요한 상태"입니다. 전문가를 찾는 건 약함의 고백이 아니라, 자기 삶을 되찾는 가장 빠른 경로예요. 검사 결과가 높게 나왔다면 그 신호를 무시하지 마세요.', en: 'Toughing it out alone is treated as a virtue, but social anxiety is among the best-proven targets of CBT — across studies, most people who get treatment improve markedly. If avoidance is narrowing your work, relationships, and chances, that\'s not "weak will"; it\'s a state that needs tools. Seeing a professional isn\'t a confession of weakness — it\'s the fastest route back to your life. If your test score came out high, don\'t ignore the signal.', ja: '一人で耐えるのが美徳とされがちですが、社交不安は認知行動療法(CBT)の効果が最も実証された領域の一つ。多くの研究で治療を受けた人の大半が明確に改善しました。回避が仕事・関係・機会を狭めているなら、それは「意志不足」でなく「道具が要る状態」。専門家を訪ねるのは弱さの告白でなく、人生を取り戻す最速の経路です。検査結果が高かったなら、その信号を無視しないで。' },
        tip: { ko: '불안이 일상을 제한하고 있다면, 이번 주 상담 기관 한 곳만 검색해 보세요. 예약까지 안 해도 됩니다.', en: 'If anxiety limits your days, just search one counseling option this week — no need to book yet.', ja: '不安が日常を制限しているなら、今週相談機関を一つ検索だけしてみて。予約までは不要。' },
      },
    ],
    takeaways: [
      { ko: '남들은 내 실수를 거의 기억하지 않는다(스포트라이트 착각)', en: 'People barely remember your slips (spotlight illusion)', ja: '他人はミスをほぼ覚えていない(スポットライト錯覚)' },
      { ko: '회피는 불안을 키운다 — 작게 머무는 연습부터', en: 'Avoidance grows anxiety — practice staying, small', ja: '回避は不安を育てる — 小さく留まる練習を' },
      { ko: '4-6 호흡으로 몸 먼저 진정 + 필요하면 상담(CBT)', en: 'Calm the body with 4-6 breathing + CBT if needed', ja: '4-6呼吸で体を鎮め＋必要なら相談(CBT)' },
    ],
    close: { ko: '용기는 떨리지 않는 게 아니라, 떨리는 채로 그 자리에 있는 것입니다.', en: 'Courage isn\'t the absence of trembling — it\'s staying while you tremble.', ja: '勇気は震えない事でなく、震えたままそこに居る事です。' },
  },
  {
    id: 'sleep-phone',
    emoji: '🌙',
    test: 'dopamine',
    tag: { ko: '수면·도파민', en: 'Sleep·Dopamine', ja: '睡眠·ドーパミン' },
    readMin: 4,
    title: { ko: '잠들기 전 스마트폰이 잠을 훔치는 법', en: 'How your phone steals sleep at bedtime', ja: '寝る前のスマホが眠りを盗む仕組み' },
    summary: { ko: '"딱 5분만"이 새벽 1시가 되는 이유(보복성 취침 미루기)와 뇌과학적으로 검증된 수면 루틴', en: 'Why "just 5 minutes" becomes 1 a.m. (revenge bedtime procrastination) and science-backed sleep routines', ja: '「あと5分」が深夜1時になる理由(報復性就寝先延ばし)と検証済み睡眠ルーティン' },
    intro: { ko: '분명 피곤한데, 이불 속에서 휴대폰을 놓지 못한 채 새벽을 맞아본 적 있나요? 그건 의지가 약해서가 아니라, 뇌의 보상 회로와 하루의 구조가 함께 만든 패턴이에요.', en: 'Exhausted, yet greeting dawn with the phone still in hand under the covers? That isn\'t weak will — it\'s a pattern built jointly by your brain\'s reward loop and the shape of your day.', ja: '確かに疲れているのに、布団の中でスマホを手放せず朝を迎えた事は？それは意志の弱さでなく、脳の報酬回路と一日の構造が作ったパターンです。' },
    sections: [
      {
        h: { ko: '"내 시간"을 되찾으려는 반란', en: 'A rebellion to reclaim "my time"', ja: '「自分の時間」を取り戻す反乱' },
        key: { ko: '보복성 취침 미루기 = 낮에 뺏긴 자유의 보상', en: 'Revenge bedtime procrastination = payback for a stolen day', ja: '報復性就寝先延ばし＝奪われた昼の補償' },
        p: { ko: '심리학은 이 현상에 "보복성 취침 미루기(revenge bedtime procrastination)"라는 이름을 붙였어요. 낮이 일·공부·타인에게 완전히 점령당한 사람일수록, 밤에 "온전한 내 시간"을 포기하지 못해 잠을 미룹니다. 즉 밤의 스마트폰은 게으름이 아니라 자율성 회복 시도예요. 문제는 그 대가를 내일의 내가 수면 부족으로 치른다는 것이죠.', en: 'Psychology named this "revenge bedtime procrastination." The more your day is fully occupied by work, study, and other people, the harder it is to surrender the night — your only "own time" — so you postpone sleep. The bedtime phone isn\'t laziness; it\'s an attempt to reclaim autonomy. The catch: tomorrow-you pays the bill in sleep debt.', ja: '心理学はこれを「報復性就寝先延ばし」と名付けました。昼が仕事・勉強・他人に完全に占領された人ほど、夜の「自分だけの時間」を手放せず眠りを先延ばしします。夜のスマホは怠惰でなく自律性回復の試み。問題はその代償を明日の自分が睡眠不足で払う事です。', },
        tip: { ko: '낮에 10분이라도 "온전한 내 시간"을 미리 확보하면, 밤의 보복 욕구가 줄어요.', en: 'Carve out even 10 minutes of true "my time" during the day — the night\'s revenge urge shrinks.', ja: '昼に10分でも「自分の時間」を先に確保すると夜の報復欲求が減ります。' },
      },
      {
        h: { ko: '무한 스크롤은 잠들 틈을 안 준다', en: 'Infinite scroll never offers a stopping point', ja: '無限スクロールは眠る隙を与えない' },
        key: { ko: '변동 보상 = 뇌가 멈출 신호를 못 받음', en: 'Variable rewards give the brain no stop signal', ja: '変動報酬＝脳に停止信号が来ない' },
        p: { ko: '책은 챕터가 끝나면 "여기서 멈출까?"라는 자연스러운 정지 신호를 줍니다. 반면 피드는 끝이 없고, 다음 콘텐츠가 재미있을지 없을지 모르는 "변동 보상" 구조라 도파민 회로가 계속 "한 번만 더"를 외치게 만들어요. 슬롯머신과 같은 원리입니다. 멈추지 못하는 건 당신 탓이 아니라 설계 탓 — 그래서 대응도 의지가 아니라 설계로 해야 해요.', en: 'A book gives a natural stop cue at each chapter\'s end. Feeds never end, and their "variable reward" structure — you never know if the next item will be good — keeps the dopamine loop shouting "one more." It\'s the slot-machine principle. Not stopping isn\'t your fault; it\'s the design. So the counter-move must be design, not willpower.', ja: '本は章の終わりに「ここでやめようか」という自然な停止信号をくれます。フィードには終わりがなく、次が面白いか分からない「変動報酬」構造がドーパミン回路に「もう一回」と叫ばせ続ける。スロットマシンと同じ原理。止められないのはあなたのせいでなく設計のせい — だから対策も意志でなく設計で。', },
        tip: { ko: '자기 전 콘텐츠는 "끝이 있는 것"(에피소드 1개·챕터 1개)으로 바꿔보세요.', en: 'Switch bedtime content to things with an end — one episode, one chapter.', ja: '寝る前は「終わりがあるもの」(1話・1章)に切り替えを。' },
      },
      {
        h: { ko: '빛과 각성의 이중 공격', en: 'The double hit: light and arousal', ja: '光と覚醒のダブル攻撃' },
        key: { ko: '블루라이트↓멜라토닌 + 자극 콘텐츠↑각성', en: 'Blue light cuts melatonin; hot content raises arousal', ja: 'ブルーライト↓メラトニン＋刺激↑覚醒' },
        p: { ko: '화면의 청색광은 수면 호르몬 멜라토닌 분비를 늦춰 "졸린 시점" 자체를 뒤로 미룹니다. 여기에 자극적인 영상·SNS 논쟁·업무 알림은 교감신경을 깨워 몸을 "전투 모드"로 되돌려요. 빛과 각성이 동시에 작동하니, 휴대폰을 내려놓은 뒤에도 잠들기까지 한참 걸리는 거예요. 반대로 조명을 낮추고 지루한 콘텐츠로 바꾸는 것만으로 입면 시간은 눈에 띄게 짧아집니다.', en: 'Screen blue light delays melatonin, pushing back the very moment you feel sleepy. Add stimulating videos, SNS arguments, and work alerts, and your sympathetic nervous system flips back to combat mode. Light and arousal strike together — which is why sleep takes ages even after you put the phone down. Dim the lights and switch to boring content, and sleep latency shortens noticeably.', ja: '画面のブルーライトはメラトニン分泌を遅らせ「眠くなる時点」自体を後ろへ押します。さらに刺激的な動画・SNS論争・仕事の通知が交感神経を起こし体を「戦闘モード」に戻す。光と覚醒が同時に働くから、スマホを置いた後もなかなか眠れないのです。逆に照明を落とし退屈な内容に変えるだけで入眠時間は目に見えて短くなります。', },
        tip: { ko: '취침 1시간 전 화면 밝기 최저 + 다크모드, 침실 조명은 주황빛으로.', en: 'An hour before bed: lowest brightness + dark mode, and warm orange room light.', ja: '就寝1時間前は画面輝度最低＋ダークモード、寝室は橙色の照明に。' },
      },
      {
        h: { ko: '침대를 "잠의 장소"로 되돌리기', en: 'Give the bed back to sleep', ja: 'ベッドを「眠りの場所」に戻す' },
        key: { ko: '자극 통제 + 충전기 위치 바꾸기 = 가장 검증된 처방', en: 'Stimulus control + moving the charger = best-proven fix', ja: '刺激統制＋充電場所の変更＝最も検証された処方' },
        p: { ko: '수면의학의 1차 처방인 "자극 통제"는 단순합니다: 침대에서는 잠만 자기. 뇌가 침대=수면으로 다시 연결되면 눕는 것만으로 졸음이 오기 시작해요. 실행법도 단순합니다 — 충전기를 침실 밖(또는 손이 안 닿는 곳)에 두는 것. 알람이 걱정되면 저렴한 알람시계 하나면 충분해요. 2주만 지켜도 "눕자마자 스크롤"의 고리가 눈에 띄게 약해집니다.', en: 'Sleep medicine\'s first-line "stimulus control" is simple: the bed is for sleep only. Once the brain re-links bed=sleep, lying down itself starts to trigger drowsiness. Execution is simple too — charge your phone outside the bedroom (or out of reach). Worried about alarms? A cheap alarm clock covers it. Keep it two weeks and the lie-down-and-scroll loop visibly weakens.', ja: '睡眠医学の第一処方「刺激統制」は単純：ベッドでは眠るだけ。脳がベッド＝睡眠と再連結されれば、横になるだけで眠気が来始めます。実行も単純 — 充電器を寝室の外(または手の届かない場所)へ。アラームが心配なら安い目覚まし時計で十分。2週間守れば「横になって即スクロール」の輪が目に見えて弱まります。', },
        tip: { ko: '오늘 밤부터 충전기를 침실 밖으로 — 이 한 가지가 이 글의 전부예요.', en: 'Starting tonight, charge outside the bedroom — this one move is the whole article.', ja: '今夜から充電は寝室の外へ — この一つがこの記事の全てです。' },
      },
    ],
    takeaways: [
      { ko: '밤샘 스크롤 = 게으름이 아니라 뺏긴 낮의 보복', en: 'Night scrolling = revenge for a stolen day, not laziness', ja: '夜更かしスクロール＝怠惰でなく奪われた昼の報復' },
      { ko: '멈추지 못하는 건 변동 보상 설계 탓 — 끝이 있는 콘텐츠로', en: 'Blame variable-reward design — switch to content with an end', ja: '止まれないのは変動報酬設計のせい — 終わりある内容へ' },
      { ko: '충전기를 침실 밖으로(자극 통제) — 가장 검증된 한 수', en: 'Charger out of the bedroom (stimulus control) — the proven move', ja: '充電器を寝室の外へ(刺激統制) — 最も検証された一手' },
    ],
    close: { ko: '좋은 아침은 전날 밤, 휴대폰을 내려놓는 그 순간에 시작됩니다.', en: 'A good morning begins the night before — the moment you put the phone down.', ja: '良い朝は前夜、スマホを置くその瞬間に始まります。' },
  },
  {
    id: 'perfect-procrastination',
    emoji: '⏳',
    test: 'perfect',
    tag: { ko: '완벽주의·미루기', en: 'Perfectionism·Procrastination', ja: '完璧主義·先延ばし' },
    readMin: 4,
    title: { ko: '완벽주의자가 가장 많이 미루는 이유', en: 'Why perfectionists procrastinate the most', ja: '完璧主義者が最も先延ばしする理由' },
    summary: { ko: '미루기는 게으름이 아니라 감정 문제 — 완벽주의가 시작을 막는 회로와, 형편없는 초안의 심리학', en: 'Procrastination is emotion, not laziness — how perfectionism blocks starting, and the psychology of the rough first draft', ja: '先延ばしは怠惰でなく感情の問題 — 完璧主義が着手を阻む回路と、雑な初稿の心理学' },
    intro: { ko: '해야 할 일을 앞에 두고 책상 정리부터 시작해 본 적 있나요? 이상하게도, 잘하고 싶은 마음이 클수록 시작은 더 늦어집니다. 미루기의 반대말은 성실함이 아니라 "시작"이고, 그 시작을 막는 범인은 게으름이 아닐 때가 많아요.', en: 'Ever started cleaning your desk instead of the task in front of you? Strangely, the more you want to do it well, the later you start. The opposite of procrastination isn\'t diligence — it\'s starting. And what blocks starting is usually not laziness.', ja: 'やるべき事を前に机の整理から始めた事は？不思議な事に、上手くやりたい気持ちが大きいほど着手は遅れます。先延ばしの反対は勤勉でなく「開始」。それを阻む犯人は怠惰でない事が多いのです。' },
    sections: [
      {
        h: { ko: '미루기는 시간 문제가 아니라 감정 문제', en: 'It\'s about feelings, not time', ja: '時間でなく感情の問題' },
        key: { ko: '미루기 = 불편한 감정을 피하는 즉효 진통제', en: 'Procrastination = instant painkiller for bad feelings', ja: '先延ばし＝不快感情の即効鎮痛剤' },
        p: { ko: '미루기 연구의 결론은 의외로 일관됩니다: 미루기는 시간 관리 실패가 아니라 감정 조절 전략이라는 것. 과제를 떠올릴 때 올라오는 불안·지루함·부담감을 피하려고 뇌가 "일단 다른 걸 하자"를 택하는 거예요. 스크롤 몇 번이면 불편함이 사라지니 즉효약이죠. 문제는 진통제일 뿐 치료제가 아니라서, 과제는 그대로이고 불안엔 죄책감까지 얹힌다는 것. 그래서 "계획을 더 잘 세우자"는 처방이 잘 안 듣는 겁니다 — 달래야 할 것은 일정표가 아니라 감정이에요.', en: 'Procrastination research is surprisingly consistent: it\'s not a time-management failure but an emotion-regulation strategy. To dodge the anxiety, boredom, or pressure a task stirs up, the brain picks "let\'s do something else first." A few scrolls and the discomfort fades — instant relief. But it\'s a painkiller, not a cure: the task remains, now with guilt stacked on top. That\'s why "plan better" rarely works — what needs soothing isn\'t your calendar, it\'s your feelings.', ja: '先延ばし研究の結論は意外に一貫しています：時間管理の失敗でなく感情調節の戦略だという事。課題が呼び起こす不安・退屈・負担を避けるため脳が「まず別の事を」と選ぶのです。数回のスクロールで不快感は消える即効薬。しかし鎮痛剤であって治療薬ではなく、課題は残り不安に罪悪感まで積もる。だから「もっと計画を」という処方が効かないのです — なだめるべきは予定表でなく感情。' },
        tip: { ko: '미루고 싶어질 때 "지금 내가 피하려는 감정은 뭐지?"라고 한 번만 물어보세요. 이름을 붙이면 절반은 풀려요.', en: 'When the urge hits, ask once: "what feeling am I dodging right now?" Naming it defuses half of it.', ja: '先延ばししたくなったら「今避けている感情は何？」と一度だけ問う。名付ければ半分は解けます。' },
      },
      {
        h: { ko: '완벽주의가 시작을 막는 회로', en: 'How perfectionism blocks the start', ja: '完璧主義が着手を阻む回路' },
        key: { ko: '"완벽 아니면 실패" → 시작 자체가 위협이 됨', en: '"Perfect or failure" turns starting into a threat', ja: '「完璧か失敗か」で着手自体が脅威に' },
        p: { ko: '완벽주의자의 머릿속 기준은 처음부터 완성본입니다. 그 기준과 비교하면 어떤 첫 시도도 초라해 보이니, 시작하는 순간 "부족한 나"를 확인하게 될 것 같은 두려움이 생겨요. 게다가 결과를 자기 가치와 동일시하면("이 결과가 곧 나"), 과제는 할 일이 아니라 나에 대한 심판이 됩니다. 심판대에 서고 싶은 사람은 없죠 — 그래서 미룹니다. 역설적이게도 "잘하고 싶은 마음"이 "잘할 기회"를 갉아먹는 구조예요. 당신이 게을러서가 아니라, 기준이 시작을 처벌하고 있는 겁니다.', en: 'A perfectionist\'s mental benchmark is the finished masterpiece from minute one. Against that, any first attempt looks shabby — so starting threatens to expose "the inadequate me." Worse, if outcomes equal self-worth ("this result is me"), the task becomes not work but a verdict. Nobody volunteers for the witness stand — so we stall. Paradoxically, the desire to do well eats the chance to do well. You\'re not lazy; your standard is punishing the act of starting.', ja: '完璧主義者の頭の中の基準は最初から完成品。それと比べればどんな初回の試みも見劣りし、始めた瞬間「足りない自分」を確認しそうな恐れが生まれます。さらに結果を自己価値と同一視すれば(「この結果が自分」)、課題は仕事でなく自分への審判に。審判台に立ちたい人はいない — だから先延ばす。皮肉にも「上手くやりたい気持ち」が「上手くやる機会」を蝕む構造。怠惰でなく、基準が着手を罰しているのです。' },
        tip: { ko: '시작 전 스스로에게 선언하세요: "지금 만드는 건 완성본이 아니라 재료다."', en: 'Before starting, declare: "I\'m making material now, not the final product."', ja: '始める前に宣言を：「今作るのは完成品でなく材料だ」。' },
      },
      {
        h: { ko: '형편없는 초안의 힘', en: 'The power of the rough first draft', ja: '雑な初稿の力' },
        key: { ko: '기준 낮춰 시작 → 관성이 완성까지 끌고 감', en: 'Start below the bar — momentum carries you to done', ja: '基準を下げて着手→惰性が完成まで運ぶ' },
        p: { ko: '작가들의 오랜 격언 "형편없는 초안(shitty first draft)"은 심리학적으로도 정확합니다. 뇌가 시작을 위협으로 느끼지 않으려면 첫 목표가 우스울 만큼 작아야 해요. "보고서 쓰기"가 아니라 "제목 한 줄 쓰기", "운동하기"가 아니라 "운동화 신기". 여기에 실행 의도(implementation intention) — "언제·어디서·무엇을"을 미리 문장으로 박아두면("점심 먹고 자리에 앉으면 제목부터 쓴다") 실행률이 크게 오른다는 게 반복 검증된 결과입니다. 일단 굴러가기 시작한 일은 멈추기가 오히려 어색해져요 — 관성은 완벽주의보다 힘이 셉니다.', en: 'The writers\' adage of the "shitty first draft" is psychologically precise. For the brain not to flag starting as a threat, the first goal must be laughably small: not "write the report" but "write one title line"; not "work out" but "put on the shoes." Add an implementation intention — pre-scripting when, where, what ("after lunch, when I sit down, I write the title first") — and follow-through rises sharply, a repeatedly verified effect. Once a task is rolling, stopping feels awkward — momentum beats perfectionism.', ja: '作家の格言「雑な初稿」は心理学的にも正確。脳が着手を脅威と感じないためには最初の目標が笑えるほど小さい必要があります。「報告書を書く」でなく「タイトル一行」、「運動する」でなく「靴を履く」。さらに実行意図 — いつ・どこで・何をを予め文にしておく(「昼食後席に着いたらまずタイトル」)と実行率が大きく上がるのは繰り返し検証済み。転がり始めた仕事は止める方が不自然 — 惰性は完璧主義より強いのです。' },
        tip: { ko: '지금 미루는 일 하나를 "5분짜리 우스운 첫 조각"으로 쪼개 문장으로 적어보세요: "___하면, ___에서, ___부터 한다."', en: 'Take one stalled task and script a laughably small 5-minute piece: "When ___, at ___, I start with ___."', ja: '先延ばし中の仕事一つを「5分の笑える一片」に刻み文にする：「___したら、___で、___から」。' },
      },
      {
        h: { ko: '자책은 미루기의 연료다', en: 'Self-blame fuels the next delay', ja: '自責は先延ばしの燃料' },
        key: { ko: '자기자비가 미루기를 줄인다 — 반복 검증된 결과', en: 'Self-compassion reduces procrastination — replicated finding', ja: 'セルフコンパッションが先延ばしを減らす' },
        p: { ko: '미룬 뒤의 자책("또 미뤘네, 난 왜 이럴까")은 정신을 차리게 해줄 것 같지만, 연구 결과는 정반대입니다. 자책은 과제에 붙은 불쾌감을 더 키워서 다음번 회피를 더 강하게 만들어요. 반대로 미룬 자신을 이해하고 넘어간 사람들("그럴 만했지, 다음에 다시")이 다음 과제를 덜 미뤘다는 결과가 반복적으로 확인됐습니다. 미루기의 악순환을 끊는 첫 고리는 더 독한 다짐이 아니라, 미뤘던 나를 용서하는 것 — 그래야 과제가 다시 "심판"이 아닌 "그냥 일"로 돌아옵니다.', en: 'Post-delay self-blame ("again?! what\'s wrong with me") feels like it should snap you into shape — research shows the opposite. Blame inflates the bad feelings attached to the task, making the next avoidance stronger. Conversely, people who forgave themselves for procrastinating ("it made sense; next time") procrastinated less on the following task — a repeatedly confirmed result. The first link to cut in the cycle isn\'t a harsher vow but forgiving the you who stalled — that\'s what turns the task back from a verdict into just work.', ja: '先延ばし後の自責(「またか、なぜこうなんだ」)は目を覚まさせてくれそうですが、研究結果は正反対。自責は課題に付いた不快感を膨らませ、次の回避をより強くします。逆に先延ばした自分を許した人々(「無理もない、次は」)が次の課題をより先延ばししなかった事が繰り返し確認されました。悪循環を断つ最初の輪は、より強い誓いでなく、先延ばした自分を許す事 — それで課題が「審判」から「ただの仕事」に戻ります。' },
        tip: { ko: '미룬 날 밤엔 다짐 대신 이 한 문장: "미룰 만한 이유가 있었다. 내일 첫 조각부터."', en: 'On a stalled day, swap the vow for one line: "There was a reason. Tomorrow, the first piece."', ja: '先延ばした夜は誓いの代わりに一文：「理由があった。明日は最初の一片から」。' },
      },
    ],
    takeaways: [
      { ko: '미루기 = 시간이 아니라 감정 조절의 문제', en: 'Procrastination is emotion regulation, not time management', ja: '先延ばし＝時間でなく感情調節の問題' },
      { ko: '완성본 기준이 시작을 처벌한다 — "재료"부터 만들기', en: 'Masterpiece standards punish starting — make "material" first', ja: '完成品基準が着手を罰する —「材料」から作る' },
      { ko: '우스울 만큼 작은 첫 조각 + 실행 의도 + 자기 용서', en: 'A laughably small first piece + implementation intention + self-forgiveness', ja: '笑えるほど小さな一片＋実行意図＋自己許し' },
    ],
    close: { ko: '완벽한 시작을 기다리는 동안, 형편없는 시작은 벌써 절반을 끝냅니다.', en: 'While you wait for the perfect start, the rough start is already halfway done.', ja: '完璧な開始を待つ間に、雑な開始はもう半分終えています。' },
  },
  {
    id: 'emotion-regulation',
    emoji: '🌊',
    test: 'efficacy',
    tag: { ko: '감정 조절', en: 'Emotion regulation', ja: '感情調節' },
    readMin: 4,
    title: { ko: '감정은 파도예요 — 싸우지 말고 타는 법', en: 'Emotions are waves — ride them, don\'t fight them', ja: '感情は波 — 戦わず乗る方法' },
    summary: { ko: '감정을 억누르면 커지는 이유와, 뇌과학이 검증한 감정 조절 4단계(이름 붙이기·재해석·몸부터 진정)', en: 'Why suppressing emotions backfires, and four brain-verified regulation moves (labeling, reappraisal, body-first calm)', ja: '感情を抑えると大きくなる理由と、脳科学が検証した感情調節4段階' },
    intro: { ko: '"화내지 말자, 불안해하지 말자"라고 다짐할수록 감정이 더 커진 적 있나요? 감정 조절은 감정을 없애는 기술이 아니라, 파도를 타는 기술에 가깝습니다. 그리고 이건 타고나는 게 아니라 배울 수 있는 능력이에요.', en: 'Ever notice that vowing "don\'t be angry, don\'t be anxious" makes the feeling bigger? Emotion regulation isn\'t the art of deleting feelings — it\'s the art of riding waves. And it\'s a learnable skill, not a born trait.', ja: '「怒らない、不安にならない」と誓うほど感情が大きくなった事は？感情調節は感情を消す技術でなく、波に乗る技術。そして生まれつきでなく学べる能力です。' },
    sections: [
      {
        h: { ko: '억누르면 커진다', en: 'Suppression backfires', ja: '抑えると大きくなる' },
        key: { ko: '감정 억제는 반동을 부른다 — 몸의 각성은 오히려 상승', en: 'Pushing feelings down raises the body\'s arousal', ja: '感情抑制は反動を呼ぶ' },
        p: { ko: '감정 조절 연구의 고전적 발견: 겉으로 감정을 억누르는 전략(표정 관리·"괜찮은 척")은 감정 경험을 줄이지 못하면서 심박 등 신체 각성은 오히려 높입니다. 기억력까지 떨어뜨리고, 놀랍게도 대화 상대의 혈압까지 올린다는 결과도 있어요. 흰곰을 생각하지 말라면 흰곰만 떠오르는 것처럼, 감정도 밀어낼수록 되돌아옵니다. 조절의 출발점은 "느끼면 안 돼"가 아니라 "느끼고 있구나"를 인정하는 것이에요.', en: 'A classic finding in emotion research: outward suppression (poker face, "I\'m fine") fails to reduce the felt emotion while raising bodily arousal like heart rate. It even impairs memory — and remarkably, can raise the blood pressure of the person you\'re talking to. Like the white bear you\'re told not to think of, feelings pushed away bounce back. Regulation starts not with "I shouldn\'t feel this" but with "I\'m feeling this."', ja: '感情研究の古典的発見：表向きの抑制(表情管理・「平気なふり」)は感情体験を減らせないまま心拍など身体覚醒をむしろ高めます。記憶力も落とし、驚くことに会話相手の血圧まで上げるという結果も。考えるなと言われた白熊ほど浮かぶように、感情も押しのけるほど戻ってきます。調節の出発点は「感じてはダメ」でなく「感じているな」と認める事。' },
        tip: { ko: '감정이 올라올 때 첫 문장을 바꿔보세요: "불안하면 안 돼" → "지금 불안이 왔구나."', en: 'Swap the first sentence: "I can\'t be anxious" → "anxiety just arrived."', ja: '最初の一文を変える：「不安はダメ」→「今、不安が来たな」。' },
      },
      {
        h: { ko: '이름을 붙이면 길들여진다', en: 'Name it to tame it', ja: '名付ければ手なずく' },
        key: { ko: '감정 라벨링 = 편도체 반응을 낮추는 검증된 스위치', en: 'Affect labeling measurably calms the amygdala', ja: '感情ラベリングは扁桃体反応を下げる' },
        p: { ko: '뇌영상 연구에서, 지금 느끼는 감정에 단어를 붙이는 것만으로(정서 라벨링) 위협 반응을 담당하는 편도체 활성이 줄고 전전두엽(조절 담당)이 켜지는 게 관찰됐습니다. 핵심은 구체성이에요. "기분이 별로"보다 "발표를 망칠까 봐 불안하고, 준비 시간을 뺏겨서 짜증나"처럼 쪼개서 부를수록 효과가 큽니다. 감정 어휘가 풍부한 사람일수록 감정에 덜 휩쓸린다는 연구도 같은 맥락이에요. 말로 잡히는 감정은 더 이상 안개가 아닙니다.', en: 'Brain-imaging studies show that merely putting words to a feeling (affect labeling) reduces amygdala activity — the threat alarm — while engaging the prefrontal regulator. Specificity is the key: "I feel off" does less than "I\'m anxious about botching the talk, and irritated my prep time got taken." People with richer emotion vocabularies are swept away less — same principle. A feeling captured in words is no longer a fog.', ja: '脳画像研究では、感じている感情に言葉を付けるだけで(感情ラベリング)脅威反応を担う扁桃体の活動が減り、調節を担う前頭前野が働く事が観察されました。核心は具体性。「気分が悪い」より「発表を台無しにしそうで不安、準備時間を奪われて苛立つ」と刻むほど効果大。感情語彙が豊かな人ほど感情に流されにくいという研究も同じ文脈。言葉で捉えた感情はもう霧ではありません。' },
        tip: { ko: '오늘 감정을 한 단어 말고 두세 단어로 쪼개 적어보세요(예: 서운함+피곤+기대).', en: 'Log today\'s feeling in two or three words, not one (e.g., hurt + tired + hopeful).', ja: '今日の感情を一語でなく2〜3語に刻んで書く(例：寂しさ＋疲れ＋期待)。' },
      },
      {
        h: { ko: '이야기를 바꾸면 감정이 바뀐다', en: 'Change the story, change the feeling', ja: '物語を変えれば感情が変わる' },
        key: { ko: '재해석(reappraisal) — 가장 검증된 감정 조절 전략', en: 'Reappraisal — the best-validated strategy', ja: '再解釈 — 最も検証された戦略' },
        p: { ko: '같은 사건도 어떤 이야기로 읽느냐에 따라 감정 반응 자체가 달라집니다. 심장이 뛰는 발표 전 상태를 "망할 징조"로 읽으면 불안이지만 "몸이 에너지를 올려주는 중"으로 읽으면 설렘에 가까워져요 — 실제로 "긴장돼"를 "신난다"로 바꿔 말한 그룹이 수행까지 좋아졌다는 실험이 있습니다. 이것이 재해석(인지 재평가)이고, 수백 편의 연구에서 억제보다 일관되게 우수했습니다. 거짓 긍정이 아니라, 사실에 맞는 다른 해석을 고르는 연습이에요.', en: 'The same event lands differently depending on the story you read it through. A pounding heart before a talk read as "doom" is anxiety; read as "my body ramping up energy" it edges toward excitement — in one experiment, people who said "I\'m excited" instead of "I\'m nervous" actually performed better. This is reappraisal, consistently superior to suppression across hundreds of studies. It isn\'t fake positivity — it\'s choosing another interpretation that also fits the facts.', ja: '同じ出来事も、どんな物語で読むかで感情反応自体が変わります。発表前の動悸を「失敗の前兆」と読めば不安、「体がエネルギーを上げている」と読めばワクワクに近づく — 実際「緊張する」を「ワクワクする」と言い換えた群は成績まで向上した実験があります。これが再解釈(認知的再評価)で、数百の研究で抑制より一貫して優れていました。偽りの前向きでなく、事実に合う別の解釈を選ぶ練習です。' },
        tip: { ko: '긴장되는 순간, 소리 내어 바꿔 말해보세요: "떨린다" 대신 "몸이 준비 중이다."', en: 'In a tense moment, say it out loud differently: not "I\'m shaking" but "my body is gearing up."', ja: '緊張の瞬間、声に出して言い換える：「震える」でなく「体が準備中だ」。' },
      },
      {
        h: { ko: '생각이 안 통할 땐 몸부터', en: 'When thinking fails, start with the body', ja: '思考が効かない時は体から' },
        key: { ko: '강한 감정엔 하향식보다 상향식 — 호흡·온도·움직임', en: 'For intense feelings go bottom-up: breath, cold, movement', ja: '強い感情には身体からのボトムアップ' },
        p: { ko: '감정이 아주 강할 땐 재해석 같은 "생각 도구"가 잘 안 잡힙니다. 뇌의 이성 회로가 잠시 오프라인이 되기 때문이죠. 이럴 땐 몸에서 시작하세요: 날숨을 길게(4초 들이쉬고 6초 내쉬기), 차가운 물로 세수하거나 손목 식히기, 10분 걷기. 신체 각성이 내려가면 그제야 생각 도구가 다시 손에 잡힙니다. 순서가 핵심이에요 — 몸 먼저, 생각은 그다음. 그리고 기억하세요: 감정 조절은 성격이 아니라 기술이라, 오늘 한 번의 연습이 다음 파도를 더 잘 타게 만듭니다.', en: 'When a feeling is very intense, thinking tools like reappraisal slip out of reach — the brain\'s rational circuits go briefly offline. Start with the body instead: lengthen the exhale (in 4s, out 6s), splash cold water on your face or wrists, walk for ten minutes. Once bodily arousal drops, the thinking tools become usable again. Order matters — body first, mind second. And remember: regulation is a skill, not a personality; today\'s one rep makes the next wave easier to ride.', ja: '感情が非常に強い時、再解釈のような「思考の道具」は掴めません。脳の理性回路が一時オフラインになるから。そんな時は体から：吐く息を長く(4秒吸い6秒吐く)、冷水で顔や手首を冷やす、10分歩く。身体覚醒が下がって初めて思考の道具が再び手に馴染みます。順序が核心 — 体が先、思考は後。そして忘れずに：感情調節は性格でなく技術。今日の一回の練習が次の波を乗りやすくします。' },
        tip: { ko: '감정이 10점 만점에 7점을 넘으면 생각을 멈추고, 6초 날숨 5회부터 시작하세요.', en: 'If the feeling passes 7/10, stop thinking — start with five 6-second exhales.', ja: '感情が10点中7点を超えたら思考を止め、6秒の呼気5回から。' },
      },
    ],
    takeaways: [
      { ko: '억누르기는 역효과 — 인정이 조절의 출발점', en: 'Suppression backfires — acknowledgment starts regulation', ja: '抑制は逆効果 — 認める事が出発点' },
      { ko: '구체적으로 이름 붙이기 + 사실에 맞는 재해석', en: 'Label specifically + reappraise within the facts', ja: '具体的に名付け＋事実に合う再解釈' },
      { ko: '강한 감정엔 몸 먼저(긴 날숨·차가움·걷기), 생각은 그다음', en: 'Intense feelings: body first (long exhale, cold, walking), mind second', ja: '強い感情は体から、思考は後' },
    ],
    close: { ko: '파도는 막을 수 없지만, 파도 타는 법은 배울 수 있습니다.', en: 'You can\'t stop the waves — but you can learn to surf.', ja: '波は止められない。でも波の乗り方は学べます。' },
  },
]

export function articleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id)
}
