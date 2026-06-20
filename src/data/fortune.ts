import type { L } from './types'

/** 출생 일간 오행 vs 오늘 일주 오행의 5관계별 '오늘의 기운'(사주·음양오행, 재미용 — 미신적 단정 아님).
 *  리서치 워크플로 검증 데이터(상생/상극 관계 + ko/en/ja). */
export interface FortuneTemplate {
  relation: string
  overall: L
  love: L
  money: L
  health: L
  luckyColorKo: string
  luckyNumber: number
}

export const FORTUNE_TEMPLATES: Record<string, FortuneTemplate> = {
  "생받음": {
    "relation": "생받음",
    "overall": {
      "ko": "오늘은 주변의 기운이 당신을 든든히 받쳐주는 날이에요. 평소 신경 쓰던 일에 뜻밖의 도움이나 좋은 소식이 흘러들어오고, 사람들과의 관계에서도 마음이 한결 가벼워집니다. 혼자 무리해서 끌고 가기보다 들어오는 흐름에 살짝 몸을 맡기고, 받은 호의엔 고마움을 표현해 보세요. 다만 너무 받기만 하면 나중에 부담이 될 수 있으니, 작은 보답 하나는 챙겨두면 그 인연이 더 오래갑니다.",
      "en": "Today's energy has your back—help and good news flow toward you. Instead of forcing things, ride the current that comes to you.",
      "ja": "今日の気があなたをしっかり支える日。周りの助けや良い知らせが流れ込みます。無理に進めるより、来る流れに身を任せてみて。"
    },
    "love": {
      "ko": "먼저 베풀지 않아도 마음이 채워지는 날. 솔직하게 기대면 관계가 한 뼘 가까워집니다.",
      "en": "You feel cared for without trying hard. Lean in honestly and the bond grows closer.",
      "ja": "頑張らなくても満たされる日。素直に甘えると距離がぐっと縮まります。"
    },
    "money": {
      "ko": "뜻밖의 지원·정보가 이득으로 연결될 수 있어요. 받은 호의는 기록해두면 나중에 빛납니다.",
      "en": "Unexpected support or a tip may turn into gain. Note the favors—they pay off later.",
      "ja": "思わぬ支援や情報が得につながるかも。受けた厚意は記録しておくと後で活きます。"
    },
    "health": {
      "ko": "회복과 충전에 좋은 날. 따뜻한 휴식과 충분한 수면이 컨디션을 끌어올립니다.",
      "en": "A good day to recharge. Warm rest and solid sleep lift your condition.",
      "ja": "回復と充電に良い日。温かい休息と十分な睡眠で調子が上がります。"
    },
    "luckyColorKo": "초록",
    "luckyNumber": 3
  },
  "극해줌": {
    "relation": "극해줌",
    "overall": {
      "ko": "오늘은 당신이 주도권을 쥐고 일을 밀어붙이기 좋은 날이에요. 미뤄두었던 결정이나 부탁, 정리해야 할 일을 오늘 끝내면 눈에 보이는 결실이 따라옵니다. 자신감 있게 나서되, 욕심이 앞서 상대의 속도를 무시하면 사소한 마찰이 생길 수 있어요. 한 박자 여유를 두고 상대의 입장도 살피면, 성과와 관계를 모두 챙기는 하루가 됩니다.",
      "en": "A day to take the lead—push the thing you've delayed and results appear. Just don't overreach, or small friction creeps in.",
      "ja": "主導権を握るのに良い日。後回しにした件を進めれば結実します。欲張りすぎると小さな摩擦が出るので一呼吸を。"
    },
    "love": {
      "ko": "끌고 가는 매력이 통하는 날. 다만 상대 속도도 살펴주면 더 단단해집니다.",
      "en": "Your initiative is attractive today—just mind your partner's pace to stay solid.",
      "ja": "引っ張る魅力が効く日。相手のペースも見てあげると関係が固まります。"
    },
    "money": {
      "ko": "재물운이 활발. 결정·협상에 유리하니 미뤄둔 청구·정산을 정리하기 좋습니다.",
      "en": "Money energy is active—favorable for decisions and negotiations; clear pending bills.",
      "ja": "金運が活発。決断・交渉に有利。保留中の請求や精算を片付けるのに好適。"
    },
    "health": {
      "ko": "에너지가 넘쳐 활동적인 날. 다만 과도한 부하는 금물, 스트레칭으로 균형을.",
      "en": "High-energy and active—just avoid overload; balance it with stretching.",
      "ja": "エネルギーに満ちた活動的な日。過負荷は禁物、ストレッチで均衡を。"
    },
    "luckyColorKo": "노랑",
    "luckyNumber": 5
  },
  "비화": {
    "relation": "비화",
    "overall": {
      "ko": "오늘은 큰 기복 없이 흐름이 평온하게 안정되는 날이에요. 새로운 일을 크게 벌이기보다 익숙한 루틴을 차분히 다듬고 미뤄둔 정리를 할 때 성과가 큽니다. 나와 결이 비슷한 사람과 함께하면 말하지 않아도 손발이 맞아 일이 순조롭게 풀려요. 다만 평온함에 안주해 미루기만 하면 흐름이 멈출 수 있으니, 작더라도 한 걸음은 꼭 내디뎌 보세요.",
      "en": "A calm, steady day. You gain more by refining familiar routines than chasing big change—collaboration with like-minded people flows.",
      "ja": "流れが穏やかに安定する日。大きな変化より慣れた習慣を磨くと成果大。似た人との協力が順調です。"
    },
    "love": {
      "ko": "편안함이 무기. 무던하게 함께하는 시간이 신뢰를 쌓습니다.",
      "en": "Comfort is your strength—easy time together builds trust.",
      "ja": "心地よさが武器。気負わず一緒に過ごす時間が信頼を育てます。"
    },
    "money": {
      "ko": "큰 기복 없이 안정적. 무리한 베팅보다 지키는 관리가 유리합니다.",
      "en": "Stable without big swings—protecting beats risky bets today.",
      "ja": "大きな波なく安定。攻めるより守りの管理が有利です。"
    },
    "health": {
      "ko": "평소 컨디션 유지. 규칙적인 식사·가벼운 운동이 그대로 돌아옵니다.",
      "en": "Steady as usual—regular meals and light exercise pay off.",
      "ja": "いつもの調子を維持。規則的な食事と軽い運動がそのまま報われます。"
    },
    "luckyColorKo": "흰색",
    "luckyNumber": 4
  },
  "생해줌": {
    "relation": "생해줌",
    "overall": {
      "ko": "오늘은 베풀고 표현하는 기운이 강한 날이에요. 아이디어를 꺼내고 정성을 쏟으면 주변의 인정과 좋은 평판이 따라옵니다. 마음을 솔직하게 표현하기에도 더없이 좋은 날이지만, 한쪽으로만 에너지를 쏟다 보면 정작 나는 금세 지칠 수 있어요. 베푼 만큼 나를 위한 휴식과 충전도 일정에 꼭 넣어 두면, 오늘의 빛이 오래 이어집니다.",
      "en": "A giving, expressive day—pour in ideas and care and your reputation rises. But it drains you, so recharge yourself too.",
      "ja": "与え・表現する気が強い日。アイデアと真心を注ぐと評価が上がります。消耗も大きいので自分の充電も忘れずに。"
    },
    "love": {
      "ko": "마음을 표현하기 좋은 날. 다만 일방적으로 쏟지 말고 돌아오는 신호도 살펴요.",
      "en": "Great for expressing feelings—just don't give one-sidedly; watch for signals back.",
      "ja": "気持ちを表すのに良い日。一方的に注ぎすぎず、返ってくる合図も見て。"
    },
    "money": {
      "ko": "지출·투자가 늘기 쉬운 날. 가치 있는 곳엔 좋지만 충동구매는 한 번 더 점검.",
      "en": "Spending tends to rise—fine for worthwhile things, but double-check impulse buys.",
      "ja": "支出・投資が増えやすい日。価値ある所には良いが衝動買いは再確認を。"
    },
    "health": {
      "ko": "열정이 앞서 무리하기 쉬운 날. 수분 보충과 중간 휴식으로 페이스 조절을.",
      "en": "Enthusiasm can push you too far—hydrate and take breaks to pace yourself.",
      "ja": "情熱が先走り無理しがちな日。水分補給と小休止でペース調整を。"
    },
    "luckyColorKo": "빨강",
    "luckyNumber": 7
  },
  "극받음": {
    "relation": "극받음",
    "overall": {
      "ko": "오늘은 바깥의 압박과 책임이 어깨에 느껴지는 날이에요. 정면으로 부딪쳐 무리하게 밀어붙이기보다, 한 발 물러서 상황을 정비하면 불필요한 손해를 막을 수 있습니다. 큰 결정이나 새로운 시작은 하루 미루고, 작은 일을 야무지게 마무리하는 데 집중해 보세요. 오늘 잘 버티고 정돈해 두면, 다가올 흐름에서 훨씬 가볍게 출발할 수 있어요.",
      "en": "Outside pressure and duties weigh in. Stepping back to regroup beats charging head-on—focus on finishing small things well.",
      "ja": "外からの圧力や責任を感じる日。正面突破より一歩引いて整えると損を防げます。小さな事を丁寧に仕上げることに集中を。"
    },
    "love": {
      "ko": "오해가 생기기 쉬운 날. 말투를 한 번 더 다듬고 경청하면 충돌을 피합니다.",
      "en": "Misunderstandings come easily—soften your words and listen to avoid clashes.",
      "ja": "誤解が生じやすい日。言い方を整え、よく聞けば衝突を避けられます。"
    },
    "money": {
      "ko": "예상 밖 지출·요구에 주의. 큰 결정은 하루 미루고 계약서는 꼼꼼히.",
      "en": "Watch for unexpected costs or demands—delay big decisions a day; read contracts closely.",
      "ja": "想定外の出費や要求に注意。大きな決断は一日延ばし、契約は念入りに。"
    },
    "health": {
      "ko": "피로·긴장이 쌓이기 쉬운 날. 무리한 일정을 줄이고 목·어깨를 풀어주세요.",
      "en": "Fatigue and tension build—trim the schedule and loosen neck and shoulders.",
      "ja": "疲れや緊張がたまりやすい日。予定を減らし、首と肩をほぐして。"
    },
    "luckyColorKo": "검정",
    "luckyNumber": 6
  }
}

export interface BirthFlower {
  month: number
  nameKo: string
  emoji: string
  meaningKo: string
  blurbKo: string
}

/** 월별 탄생화 + 꽃말 (한국 통용 서양식 기준). */
export const BIRTH_FLOWERS: BirthFlower[] = [
  {
    "month": 1,
    "nameKo": "스노드롭",
    "emoji": "🌱",
    "meaningKo": "희망, 위안",
    "blurbKo": "추운 겨울 끝에 가장 먼저 피어 희망을 전하는 따뜻한 사람."
  },
  {
    "month": 2,
    "nameKo": "제비꽃",
    "emoji": "💜",
    "meaningKo": "성실, 진실한 사랑",
    "blurbKo": "작지만 한결같은 마음으로 진심을 지키는 성실한 사람."
  },
  {
    "month": 3,
    "nameKo": "수선화",
    "emoji": "🌼",
    "meaningKo": "자기 사랑, 신비",
    "blurbKo": "나를 아끼고 사랑할 줄 아는, 단단한 자존감의 소유자."
  },
  {
    "month": 4,
    "nameKo": "데이지",
    "emoji": "🌻",
    "meaningKo": "순수, 평화",
    "blurbKo": "꾸밈없이 맑고 순수해서 곁에 있으면 마음이 편안해지는 사람."
  },
  {
    "month": 5,
    "nameKo": "은방울꽃",
    "emoji": "🔔",
    "meaningKo": "섬세함, 다시 찾은 행복",
    "blurbKo": "작은 행복을 알아보는 섬세하고 다정한 사람."
  },
  {
    "month": 6,
    "nameKo": "장미",
    "emoji": "🌹",
    "meaningKo": "사랑, 열정",
    "blurbKo": "마음을 솔직하게 표현하는 뜨거운 열정의 사람."
  },
  {
    "month": 7,
    "nameKo": "참제비고깔",
    "emoji": "💙",
    "meaningKo": "청초함, 자유",
    "blurbKo": "맑고 자유로운 영혼으로 자기만의 길을 걷는 사람."
  },
  {
    "month": 8,
    "nameKo": "글라디올러스",
    "emoji": "⚔️",
    "meaningKo": "승리, 용기",
    "blurbKo": "어려움 앞에서도 굳건한 마음으로 끝내 이겨내는 용감한 사람."
  },
  {
    "month": 9,
    "nameKo": "과꽃",
    "emoji": "🪻",
    "meaningKo": "믿음, 추억",
    "blurbKo": "소중한 추억과 사람을 오래 간직하는 믿음직한 사람."
  },
  {
    "month": 10,
    "nameKo": "메리골드",
    "emoji": "🌼",
    "meaningKo": "반드시 오고야 말 행복",
    "blurbKo": "포기하지 않으면 행복이 온다고 믿는 단단한 긍정의 사람."
  },
  {
    "month": 11,
    "nameKo": "국화",
    "emoji": "🌸",
    "meaningKo": "고결, 진실",
    "blurbKo": "흔들림 없이 진실하고 깊은 멋을 지닌 고결한 사람."
  },
  {
    "month": 12,
    "nameKo": "호랑가시나무",
    "emoji": "🌿",
    "meaningKo": "가정의 행복, 평화",
    "blurbKo": "주변을 따뜻하게 지키며 평화로운 행복을 가꾸는 사람."
  }
]

/** 궁합 — 두 사람 일간 오행 관계(나→상대 기준). label/desc ko·en·ja. */
export interface CompatTemplate {
  relation: string
  label: L
  desc: L
  score: number
}
export const COMPAT_TEMPLATES: Record<string, CompatTemplate> = {
  비화: {
    relation: '비화',
    label: { ko: '닮은꼴 짝', en: 'Mirror match', ja: '似た者ペア' },
    desc: {
      ko: '같은 기운이라 말 안 해도 통하고 편안해요. 다만 비슷한 고집끼리는 가끔 부딪히니, 한 명이 한 발 양보하면 오래갑니다.',
      en: 'Same energy—you click without words and feel at ease. Just two similar wills can clash, so one stepping back keeps it lasting.',
      ja: '同じ気で言わずとも通じ合い心地よい関係。似た者同士で時にぶつかるので、一方が一歩引くと長続きします。',
    },
    score: 80,
  },
  생받음: {
    relation: '생받음',
    label: { ko: '챙김받는 짝', en: 'Cared-for match', ja: '支えられるペア' },
    desc: {
      ko: '상대가 당신을 자연스럽게 채워주는 관계. 기대고 고마워할수록 더 깊어져요. 받기만 하지 말고 가끔은 먼저 표현해 보세요.',
      en: 'They naturally fill you up. The more you lean in and show thanks, the deeper it grows—just give back first sometimes.',
      ja: '相手が自然とあなたを満たす関係。甘えて感謝するほど深まります。受けるだけでなく時には先に表現を。',
    },
    score: 88,
  },
  생해줌: {
    relation: '생해줌',
    label: { ko: '챙겨주는 짝', en: 'Nurturing match', ja: '尽くすペア' },
    desc: {
      ko: '당신이 상대를 키워주고 이끄는 관계. 베푸는 보람이 크지만 에너지 소모도 커요. 나를 챙기는 시간도 꼭 남겨두세요.',
      en: 'You nurture and lift them. Rewarding to give—but it drains you, so keep time to recharge yourself too.',
      ja: 'あなたが相手を育て導く関係。与える喜びは大きいが消耗も大。自分を労わる時間も必ず残して。',
    },
    score: 85,
  },
  극받음: {
    relation: '극받음',
    label: { ko: '긴장감 있는 짝', en: 'Spark-and-tension match', ja: '緊張感あるペア' },
    desc: {
      ko: '강하게 끌리지만 주도권 다툼이나 압박이 생기기 쉬워요. 서로의 영역을 존중하고 말투를 다듬으면, 그 긴장이 매력으로 바뀝니다.',
      en: 'Strong pull, but power struggles and pressure come easily. Respect each other’s space and soften your words—then the tension becomes chemistry.',
      ja: '強く惹かれるが主導権争いや圧が生じやすい。互いの領域を尊重し言い方を整えると、その緊張が魅力に変わります。',
    },
    score: 66,
  },
  극해줌: {
    relation: '극해줌',
    label: { ko: '리드하는 짝', en: 'Leading match', ja: 'リードするペア' },
    desc: {
      ko: '당신이 관계를 끌고 가는 든든한 리더형. 안정감을 주지만, 상대의 속도와 마음도 함께 살펴주면 더 단단해져요.',
      en: 'You lead the relationship—dependable and steady. Mind their pace and feelings too, and it gets even sturdier.',
      ja: 'あなたが関係を引っ張る頼れるリーダー型。安心感を与えますが、相手のペースと心も見てあげるとより強固に。',
    },
    score: 70,
  },
}

/** 오늘의 한 줄(띠별·요약용) — 5관계 */
export const SHORT_LINES: Record<string, L> = {
  생받음: { ko: '도움이 들어오는 날, 솔직히 기대도 좋아요.', en: 'Help flows in—lean in honestly.', ja: '助けが入る日、素直に頼っても。' },
  극해줌: { ko: '주도권 쥐기 좋은 날, 미뤄둔 일을 밀어붙여요.', en: 'Take the lead—push the delayed task.', ja: '主導権を握る日、後回しを進めて。' },
  비화: { ko: '평온하고 안정적인 하루, 익숙한 루틴이 답.', en: 'Calm and steady—familiar routines win.', ja: '穏やかで安定、慣れた習慣が正解。' },
  생해줌: { ko: '베풀면 평판이 오르는 날, 내 충전도 잊지 마요.', en: 'Giving lifts your name—recharge too.', ja: '与えると評価が上がる日、充電も。' },
  극받음: { ko: '한 박자 물러서면 손해를 막는 날.', en: 'Step back a beat to avoid loss.', ja: '一歩引けば損を防げる日。' },
}

/** 올해의 운(연간) — 출생 일간 오행 vs 올해 천간 오행, 5관계 */
export const YEAR_LINES: Record<string, L> = {
  생받음: {
    ko: '올해는 귀인과 기회가 자연스럽게 흘러드는 흐름의 한 해예요. 혼자 애쓰기보다 도움을 청하고 손 내미는 곳에 응하면 일이 한결 수월하게 풀립니다. 사람을 통해 배우고 연결되는 자리에 적극적으로 나서 보세요. 받은 만큼 베풀어 신뢰를 쌓아두면, 그 인연이 내년 이후까지 든든한 자산으로 남습니다.',
    en: 'A year when mentors and chances flow in naturally. Instead of struggling alone, ask for help and say yes to outstretched hands—things ease up. Step into rooms where you learn and connect through people. Give back as much as you receive, and those bonds become assets well beyond this year.',
    ja: '今年は貴人とチャンスが自然と流れ込む一年。一人で頑張るより助けを求め、差し出された手に応じると物事が楽に進みます。人を通じて学び繋がる場に積極的に出て。受けた分だけ与え信頼を築けば、その縁は来年以降まで頼れる財産になります。',
  },
  극해줌: {
    ko: '올해는 당신이 주도적으로 성취를 만들어내기 좋은 해예요. 목표를 또렷하게 세우고 밀어붙이면 노력한 만큼, 혹은 그 이상으로 결실이 큽니다. 미뤄온 도전이나 키우고 싶던 일을 올해 본격적으로 시작해 보세요. 다만 추진력이 강한 만큼 주변과 속도를 맞추는 지혜를 더하면, 성과가 더 멀리 단단하게 갑니다.',
    en: 'A great year to achieve on your own terms. Set clear goals and push, and the harvest matches or exceeds your effort. Start that delayed challenge in earnest this year. Your drive is strong—add the wisdom to match others’ pace, and the results go further and hold firmer.',
    ja: '今年は主体的に成果を生み出すのに良い年。目標を明確に立てて進めれば、努力した分かそれ以上に実りが大きい。後回しの挑戦を今年本格的に始めて。推進力が強い分、周りと歩調を合わせる知恵を加えれば、成果はより遠く確かに進みます。',
  },
  비화: {
    ko: '올해는 기반을 단단히 다지는 안정의 해예요. 무리하게 확장하기보다 내실을 채우고 실력을 갈고닦으면, 눈에 띄지 않아도 멀리 갈 토대가 쌓입니다. 익숙한 분야에서 꾸준함으로 신뢰를 얻기 좋은 시기예요. 큰 변화가 없다고 조급해하지 말고, 지금 다진 기본기가 다음 도약의 발판이 된다는 걸 기억하세요.',
    en: 'A steadying year to build firm foundations. Fill in substance and sharpen your skills over risky expansion, and a base for going far quietly accumulates. A good time to earn trust through consistency. Don’t rush at the lack of big change—the basics you build now become the springboard for your next leap.',
    ja: '今年は基盤を固める安定の年。無理に拡大するより内実を満たし実力を磨けば、目立たなくても遠くへ行く土台が積み上がります。慣れた分野で着実さにより信頼を得るのに良い時期。大きな変化がないと焦らず、今固めた基本が次の飛躍の足場になると覚えておいて。',
  },
  생해줌: {
    ko: '올해는 베풀고 표현하며 이름을 알리는 해예요. 가진 것을 나누고 진심을 담아 움직이면, 좋은 평판과 따르는 사람이 늘어납니다. 창작·교육·돌봄처럼 마음을 쓰는 일에서 특히 빛을 발하는 시기예요. 다만 에너지 소모가 큰 흐름이니, 나를 채우는 시간을 확보하는 것만 잊지 않으면 성장이 한층 커집니다.',
    en: 'A year to give, express, and get known. Share what you have and act with sincerity, and a good reputation and followers grow. You shine especially in caring work—creating, teaching, nurturing. It drains you, so keep time to refill yourself, and your growth gets even bigger.',
    ja: '今年は与え表現し名を広める年。持つものを分かち真心で動けば、良い評判と慕う人が増えます。創作・教育・ケアのような心を使う仕事で特に輝く時期。消耗が大きいので、自分を満たす時間を確保することだけ忘れなければ、成長は一層大きくなります。',
  },
  극받음: {
    ko: '올해는 책임과 도전이 묵직하게 다가오는 해예요. 정면돌파로 힘만 쓰기보다, 미리 준비하고 사람을 챙기며 차분히 대응하면 위기가 오히려 기회로 바뀝니다. 버거운 일이 오더라도 그 과정에서 단단해지는 자신을 발견하게 될 거예요. 무리한 확장은 잠시 미루고 마무리와 정비에 힘을 모으면, 한 해 끝엔 한층 성숙한 내가 남습니다.',
    en: 'A year when responsibilities and challenges arrive heavily. Rather than brute-forcing through, prepare ahead, care for people, and respond calmly—crisis turns into opportunity. Even when things feel heavy, you’ll grow sturdier through them. Postpone risky expansion and gather strength for finishing, and by year’s end a more mature you remains.',
    ja: '今年は責任と挑戦が重く訪れる年。正面突破で力任せにするより、前もって備え人を気遣い落ち着いて対応すれば、危機がむしろ好機に変わります。重く感じても、その過程で強くなる自分に気づくはず。無理な拡大は少し延ばし仕上げに力を集めれば、年の終わりにより成熟した自分が残ります。',
  },
}

/** 이번 주의 운(주간) — 출생 일간 오행 vs 오늘 일주 오행 관계 기준, 5관계 */
export const WEEK_LINES: Record<string, L> = {
  생받음: {
    ko: '이번 주는 도움과 기회가 들어오는 한 주예요. 먼저 손 내밀고 솔직하게 기대면 막혔던 일이 의외로 술술 풀립니다. 주 중반엔 좋은 제안이나 소식이 닿을 수 있으니 마음을 열어두고, 받은 호의는 가볍게라도 갚아두면 흐름이 더 좋아져요.',
    en: 'A week when help and chances come in. Reach out first and lean in honestly, and stuck things loosen up. Midweek may bring a good offer or news—stay open, and return favors even lightly to keep the flow going.',
    ja: '今週は助けと機会が入る一週間。先に手を差し伸べ素直に頼れば、詰まっていた事が意外と解けます。週半ばに良い提案や知らせが届くかも。心を開き、受けた厚意は軽くでも返すと流れが良くなります。',
  },
  극해줌: {
    ko: '이번 주는 추진력이 붙는 한 주예요. 미뤄둔 목표를 구체적인 일정으로 옮겨 하나씩 밀어붙이면 눈에 보이는 진전이 생깁니다. 주말로 갈수록 결실이 모이니 초반에 속도를 내두면 좋고, 협상이나 결정이 필요한 일은 이번 주 안에 매듭짓는 걸 추천해요.',
    en: 'A week of momentum. Turn delayed goals into a concrete schedule and push them one by one for visible progress. Results gather toward the weekend, so build speed early—and wrap up any negotiation or decision within the week.',
    ja: '今週は推進力がつく一週間。後回しの目標を具体的な予定にして一つずつ進めれば、目に見える前進が。週末に向け実りが集まるので序盤に速度を。交渉や決断は今週中にまとめるのがおすすめ。',
  },
  비화: {
    ko: '이번 주는 잔잔하고 안정적인 한 주예요. 큰 변화를 노리기보다 익숙한 일을 꾸준히 다듬으면 신뢰가 차곡차곡 쌓입니다. 비슷한 사람과의 협업이 특히 순조로우니 함께할 일을 만들어 보고, 무리한 베팅보다 지키는 관리에 무게를 두면 마음이 편해요.',
    en: 'A calm, steady week. Refine familiar work consistently over chasing big change, and trust quietly accumulates. Collaboration with like-minded people flows—make something together, and favor protecting over risky bets for peace of mind.',
    ja: '今週は穏やかで安定した一週間。大きな変化を狙うより慣れた事を着実に磨けば信頼が積み上がります。似た人との協働が特に順調なので一緒にやる事を作り、攻めるより守りの管理に重きを置くと心が楽。',
  },
  생해줌: {
    ko: '이번 주는 베풀고 표현할수록 평판이 오르는 한 주예요. 아이디어와 정성을 나누면 주변의 인정이 따라옵니다. 다만 후반부엔 에너지가 바닥날 수 있으니, 나를 위한 충전 시간을 미리 비워두고 지출이나 충동구매는 한 번 더 점검하면 좋아요.',
    en: 'A week where giving and expressing lifts your name. Share ideas and care, and recognition follows. Energy may run low later in the week—block recharge time in advance, and double-check spending or impulse buys.',
    ja: '今週は与え表現するほど評価が上がる一週間。アイデアと真心を分かち合えば評価が続きます。後半はエネルギーが切れるかもなので、充電時間を先に空け、支出や衝動買いは再確認を。',
  },
  극받음: {
    ko: '이번 주는 책임과 압박이 커질 수 있는 한 주예요. 무리해서 벌이기보다 마무리와 정비에 집중하면 손해를 막고 다음을 준비할 수 있습니다. 큰 결정은 주말 이후로 미루고, 오해가 생기기 쉬운 시기이니 말투를 한 번 더 다듬으면서 컨디션 관리에 신경 쓰세요.',
    en: 'A week when responsibility and pressure may rise. Focus on finishing and tidying over starting too much to avoid loss and prep for what’s next. Delay big decisions past the weekend; misunderstandings come easily, so soften your words and mind your condition.',
    ja: '今週は責任と圧が増えうる一週間。無理に広げるより仕上げと整備に集中すれば損を防ぎ次に備えられます。大きな決断は週末以降に延ばし、誤解が生じやすい時期なので言い方を整え体調管理に気を配って。',
  },
}

/** 이달의 운(월간) — 출생 일간 오행 vs 이달 월간(月干) 오행, 5관계 */
export const MONTH_LINES: Record<string, L> = {
  생받음: {
    ko: '이달은 주변의 지원과 기회가 자연스럽게 들어오는 흐름이에요. 혼자 끙끙대지 말고 먼저 도움을 청하면 막혔던 일이 한결 빠르게 풀립니다. 새로운 인연이나 제안이 닿기 쉬운 시기이니 마음을 열어두세요. 받은 만큼 작은 보답이라도 챙겨두면, 그 관계가 이달 내내 든든한 힘이 되어줍니다.',
    en: 'This month, support and openings flow in—ask for help instead of carrying it alone and things move faster.',
    ja: '今月は周りの支援と機会が入る流れ。一人で抱えず先に助けを求めると物事が早く進みます。',
  },
  극해줌: {
    ko: '이달은 추진력이 단단히 붙는 시기예요. 미뤄둔 목표를 구체적인 일정으로 옮겨 하나씩 밀어붙이면 눈에 보이는 성과가 차곡차곡 쌓입니다. 결정·협상·정리처럼 주도권이 필요한 일을 이달에 매듭짓기 좋아요. 다만 속도가 빠른 만큼 주변과 보폭을 맞추면, 성과가 더 멀리 단단하게 갑니다.',
    en: 'A month of momentum—turn delayed goals into a concrete schedule and push for visible results.',
    ja: '今月は推進力がつく時期。後回しの目標を具体的な予定にして進めると目に見える成果が。',
  },
  비화: {
    ko: '이달은 안정 속에서 내실을 다지기 좋은 시기예요. 큰 변화를 노리기보다 익숙한 루틴을 차분히 가다듬으면 실력과 신뢰가 꾸준히 쌓입니다. 비슷한 결의 사람과 함께하는 일이 특히 순조롭게 풀려요. 눈에 띄는 변화가 없다고 조급해하지 말고, 지금의 꾸준함이 다음 도약의 토대가 된다는 걸 기억하세요.',
    en: 'A steady month to build substance—refine familiar routines over big changes and it compounds.',
    ja: '今月は安定の中で内実を固める時期。大きな変化より慣れた習慣を磨くと着実に積み上がります。',
  },
  생해줌: {
    ko: '이달은 베풀고 표현하며 평판을 쌓기 좋은 시기예요. 아이디어와 정성을 나누면 주변의 인정과 따르는 사람이 늘어납니다. 마음을 솔직하게 표현하기에도 좋은 달이지만, 한쪽으로만 에너지를 쏟으면 금세 지칠 수 있어요. 에너지 배분과 나를 위한 충전만 잘 챙기면, 노력을 제대로 인정받는 한 달이 됩니다.',
    en: 'A month to give and express—pace your energy and your effort gets recognized.',
    ja: '今月は与え表現し評価を積む時期。エネルギー配分さえ良ければ努力が認められます。',
  },
  극받음: {
    ko: '이달은 책임과 압박이 한층 커질 수 있는 시기예요. 무리하게 새 일을 벌이기보다 마무리와 정비에 집중하면 불필요한 손해를 막고 다음을 단단히 준비할 수 있습니다. 오해가 생기기 쉬운 때이니 말과 계약은 한 번 더 꼼꼼히 살펴보세요. 이달을 잘 버티고 정돈해 두면, 다음 흐름에서 훨씬 가볍게 출발할 수 있어요.',
    en: 'Pressure may rise—focus on finishing and tidying over expansion to avoid loss and prep for what’s next.',
    ja: '今月は責任と圧が増えがち。拡大より仕上げと整備に集中すれば損を防ぎ次に備えられます。',
  },
}
