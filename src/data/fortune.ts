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
      "ko": "오늘의 기운이 당신을 든든히 받쳐주는 날. 주변의 도움과 좋은 소식이 흘러들어옵니다. 무리해서 끌고 가기보다 들어오는 흐름에 살짝 몸을 맡겨보세요.",
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
      "ko": "주도권을 쥐기 좋은 날. 미뤄둔 일을 밀어붙이면 결실이 보입니다. 다만 욕심이 과하면 사소한 마찰이 생길 수 있으니 한 박자 여유를.",
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
      "ko": "에너지가 넘쳐 활동적인 날. 다만 무리한 과부하는 금물, 스트레칭으로 균형을.",
      "en": "High-energy and active—just avoid overload; balance it with stretching.",
      "ja": "エネルギーに満ちた活動的な日。過負荷は禁物、ストレッチで均衡を。"
    },
    "luckyColorKo": "노랑",
    "luckyNumber": 5
  },
  "비화": {
    "relation": "비화",
    "overall": {
      "ko": "흐름이 평온하게 안정되는 날. 큰 변화보다 익숙한 루틴을 다듬을 때 성과가 큽니다. 비슷한 사람과의 협력이 순조롭습니다.",
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
      "ko": "평소 컨디션 유지. 규칙적인 식사·가벼운 운동이 그대로 보답합니다.",
      "en": "Steady as usual—regular meals and light exercise pay off.",
      "ja": "いつもの調子を維持。規則的な食事と軽い運動がそのまま報われます。"
    },
    "luckyColorKo": "흰색",
    "luckyNumber": 4
  },
  "생해줌": {
    "relation": "생해줌",
    "overall": {
      "ko": "베풀고 표현하는 기운이 강한 날. 아이디어와 정성을 쏟으면 평판이 오릅니다. 다만 에너지 소모가 크니 나를 위한 충전도 잊지 마세요.",
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
      "ko": "바깥의 압박과 책임이 느껴지는 날. 정면돌파보다 한 발 물러서 정비하면 손해를 막습니다. 작은 일을 야무지게 마무리하는 데 집중하세요.",
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
