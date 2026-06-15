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
]

export function articleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id)
}
