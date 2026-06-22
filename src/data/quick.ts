import type { L, TestId } from './types'

/** 바이럴 짧은 검사 — 가볍고 공유각. 옵션이 결과 타입에 투표 → 최다 타입이 결과. */
export interface QuickResult {
  key: string
  emoji: string
  name: L
  tag: L // 공유용 한 줄
  desc: L
  grad?: [string, string] // 결과별 카드 색 직접 지정(없으면 검사색 자동 변주)
}
export interface QuickQ {
  text: L
  options: { text: L; to: string }[]
}
export interface QuickTest {
  id: string
  emoji: string
  title: L
  desc: L
  grad: [string, string]
  funnel?: TestId // 결과에서 유도할 깊은 검사
  questions: QuickQ[]
  results: QuickResult[]
}

export const QUICK_TESTS: QuickTest[] = [
  {
    id: 'lovestyle',
    emoji: '💘',
    title: { ko: '연애 스타일', en: 'Love Style', ja: '恋愛スタイル' },
    desc: { ko: '4문항으로 보는 내 연애 본능', en: 'Your love instinct in 4 Qs', ja: '4問でわかる恋愛本能' },
    grad: ['#F25C8E', '#FF8AAE'],
    funnel: 'love',
    questions: [
      {
        text: { ko: '마음에 드는 사람이 생기면?', en: 'When you like someone?', ja: '好きな人ができたら？' },
        options: [
          { text: { ko: '바로 직진, 표현해', en: 'Go straight for it', ja: 'すぐ直進' }, to: 'rush' },
          { text: { ko: '티 안 내고 밀당', en: 'Play it cool', ja: '駆け引き' }, to: 'tsun' },
          { text: { ko: '다 맞춰주며 헌신', en: 'Devote everything', ja: '尽くす' }, to: 'devote' },
          { text: { ko: '천천히 재보기', en: 'Take it slow', ja: 'ゆっくり' }, to: 'careful' },
        ],
      },
      {
        text: { ko: '연락 텀이 길어지면?', en: 'If replies slow down?', ja: '連絡が減ったら？' },
        options: [
          { text: { ko: '바로 물어봄', en: 'Ask right away', ja: 'すぐ聞く' }, to: 'rush' },
          { text: { ko: '나도 똑같이 미룸', en: 'Mirror the delay', ja: '同じく遅らす' }, to: 'tsun' },
          { text: { ko: '내가 더 잘해줌', en: 'Try harder', ja: 'もっと尽くす' }, to: 'devote' },
          { text: { ko: '관찰하며 기다림', en: 'Watch and wait', ja: '様子見' }, to: 'careful' },
        ],
      },
      {
        text: { ko: '데이트 코스는?', en: 'Date plans?', ja: 'デートは？' },
        options: [
          { text: { ko: '즉흥적으로 막 가', en: 'Spontaneous', ja: '即興で' }, to: 'rush' },
          { text: { ko: '상대 반응 보며', en: 'Read their cues', ja: '反応を見て' }, to: 'tsun' },
          { text: { ko: '상대 취향에 다 맞춤', en: 'All their taste', ja: '相手好みに' }, to: 'devote' },
          { text: { ko: '미리 꼼꼼히 계획', en: 'Plan it all', ja: '綿密に計画' }, to: 'careful' },
        ],
      },
      {
        text: { ko: '싸웠을 때 나는?', en: 'After a fight?', ja: 'ケンカしたら？' },
        options: [
          { text: { ko: '바로 풀자고 함', en: 'Make up now', ja: 'すぐ仲直り' }, to: 'rush' },
          { text: { ko: '먼저 연락 안 함', en: 'Wait it out', ja: '先に連絡しない' }, to: 'tsun' },
          { text: { ko: '내가 먼저 사과', en: 'Apologize first', ja: '先に謝る' }, to: 'devote' },
          { text: { ko: '혼자 정리할 시간', en: 'Need space', ja: '一人で整理' }, to: 'careful' },
        ],
      },
    ],
    results: [
      { key: 'rush', emoji: '🚀', name: { ko: '직진 로켓', en: 'Rocket', ja: '直進ロケット' }, tag: { ko: '재면 손해, 일단 고백', en: 'Why wait — confess', ja: '迷うなら告白' }, desc: { ko: '마음을 숨기지 못하는 솔직한 돌격대장. 빠른 진심이 매력이지만, 가끔 상대 속도도 살펴요.', en: 'You can\'t hide feelings — bold and honest. Just check their pace too.', ja: '気持ちを隠せない正直な突撃隊長。相手のペースも見て。' } },
      { key: 'tsun', emoji: '😼', name: { ko: '밀당 고양이', en: 'Tease Cat', ja: '駆け引き猫' }, tag: { ko: '관심 있으면서 튕기는 중', en: 'Into you, acting aloof', ja: '気あるのにツン' }, desc: { ko: '감정을 들키기 싫어 한 발 빼는 전략가. 매력적이지만 진심은 가끔 보여줘야 해요.', en: 'A strategist who hides feelings. Charming — but show your heart sometimes.', ja: '感情を隠す戦略家。たまには本音を。' } },
      { key: 'devote', emoji: '🐶', name: { ko: '헌신 강아지', en: 'Loyal Pup', ja: '献身わんこ' }, tag: { ko: '다 퍼주는 사랑꾼', en: 'Gives it all', ja: '全部尽くす' }, desc: { ko: '사랑하면 다 내어주는 따뜻한 사람. 단, 나를 챙기는 것도 사랑의 일부예요.', en: 'You give everything when in love. Remember to keep some for yourself.', ja: '愛すると全部捧げる人。自分も大切に。' } },
      { key: 'careful', emoji: '🐢', name: { ko: '신중 거북', en: 'Careful Turtle', ja: '慎重亀' }, tag: { ko: '확신 들 때까지 천천히', en: 'Slow till sure', ja: '確信まで慎重' }, desc: { ko: '상처받지 않으려 신중하게 재는 타입. 안정적이지만 가끔은 용기도 필요해요.', en: 'You measure carefully to avoid hurt. Stable — but courage helps too.', ja: '傷つかないよう慎重。たまに勇気も。' } },
    ],
  },
  {
    id: 'stress',
    emoji: '🌋',
    title: { ko: '스트레스 유형', en: 'Stress Type', ja: 'ストレスタイプ' },
    desc: { ko: '나는 스트레스를 어떻게 푸나?', en: 'How do you release stress?', ja: 'ストレスの解放法は？' },
    grad: ['#8B7CF6', '#B3A6FF'],
    funnel: 'burnout',
    questions: [
      {
        text: { ko: '화가 폭발하기 직전?', en: 'About to blow up?', ja: '爆発寸前？' },
        options: [
          { text: { ko: '그냥 터뜨림', en: 'Let it out', ja: 'ぶちまける' }, to: 'erupt' },
          { text: { ko: '조용히 사라짐', en: 'Disappear', ja: '消える' }, to: 'dive' },
          { text: { ko: '먹는 걸로 품', en: 'Eat it away', ja: '食べる' }, to: 'eat' },
          { text: { ko: '일에 더 몰두', en: 'Work harder', ja: '仕事に没頭' }, to: 'work' },
        ],
      },
      {
        text: { ko: '힘든 날 퇴근 후?', en: 'After a rough day?', ja: '辛い日の帰宅後？' },
        options: [
          { text: { ko: '누구든 붙잡고 토로', en: 'Vent to someone', ja: '誰かに吐く' }, to: 'erupt' },
          { text: { ko: '연락 끊고 잠수', en: 'Go offline', ja: '連絡断つ' }, to: 'dive' },
          { text: { ko: '야식 폭격', en: 'Late-night feast', ja: '夜食爆撃' }, to: 'eat' },
          { text: { ko: '내일 할 일 정리', en: 'Plan tomorrow', ja: '明日の準備' }, to: 'work' },
        ],
      },
      {
        text: { ko: '스트레스가 쌓이면 몸은?', en: 'Stress shows up as?', ja: 'ストレスは体に？' },
        options: [
          { text: { ko: '예민·짜증 폭발', en: 'Irritable', ja: 'イライラ' }, to: 'erupt' },
          { text: { ko: '무기력·멍', en: 'Numb', ja: '無気力' }, to: 'dive' },
          { text: { ko: '식욕 폭발', en: 'Hungry', ja: '食欲爆発' }, to: 'eat' },
          { text: { ko: '잠 못 자고 생각', en: 'Can\'t sleep', ja: '眠れず考える' }, to: 'work' },
        ],
      },
      {
        text: { ko: '주변이 위로하면?', en: 'When comforted?', ja: '慰められると？' },
        options: [
          { text: { ko: '다 쏟아냄', en: 'Pour it all out', ja: '全部出す' }, to: 'erupt' },
          { text: { ko: '괜찮다며 회피', en: '"I\'m fine"', ja: '大丈夫と回避' }, to: 'dive' },
          { text: { ko: '같이 먹자고 함', en: 'Let\'s eat', ja: '一緒に食べよ' }, to: 'eat' },
          { text: { ko: '바쁘다며 넘김', en: '"Too busy"', ja: '忙しいと流す' }, to: 'work' },
        ],
      },
    ],
    results: [
      { key: 'erupt', emoji: '🌋', name: { ko: '화산형', en: 'Volcano', ja: '火山型' }, tag: { ko: '쌓이면 터진다', en: 'Bottle up, blow up', ja: '溜まると爆発' }, desc: { ko: '감정을 즉시 분출해 빨리 회복하지만, 주변이 다칠 수 있어요. 건강한 분출구를 찾아보세요.', en: 'You vent fast and recover fast — but others may get hit. Find a healthy outlet.', ja: '即発散で回復は早いが周りが傷つくことも。健全な発散を。' } },
      { key: 'dive', emoji: '🐢', name: { ko: '잠수형', en: 'Diver', ja: '潜水型' }, tag: { ko: '힘들면 혼자 숨는다', en: 'Hide when hurting', ja: '辛いと潜る' }, desc: { ko: '혼자 삭이며 회복하는 타입. 안전하지만 너무 오래 잠수하면 번아웃 위험이 커요.', en: 'You process alone — safe, but diving too long risks burnout.', ja: '一人で消化するタイプ。潜りすぎは燃え尽き注意。' } },
      { key: 'eat', emoji: '🍔', name: { ko: '폭식형', en: 'Feaster', ja: '爆食型' }, tag: { ko: '스트레스는 곧 식욕', en: 'Stress = hunger', ja: 'ストレス＝食欲' }, desc: { ko: '먹는 걸로 위안을 얻는 타입. 즉각적이지만 죄책감의 굴레가 될 수 있어요. 다른 보상도 만들어봐요.', en: 'Food is your comfort — instant, but watch the guilt loop. Build other rewards.', ja: '食で慰めるタイプ。罪悪感のループに注意。' } },
      { key: 'work', emoji: '⚙️', name: { ko: '일중독형', en: 'Overworker', ja: '仕事中毒型' }, tag: { ko: '불안하면 더 일한다', en: 'Anxious? Work more', ja: '不安だと働く' }, desc: { ko: '바쁨으로 불안을 덮는 타입. 생산적이지만 쉼을 미루다 소진되기 쉬워요. 의도적 휴식이 약입니다.', en: 'You bury anxiety in busyness — productive, but rest-deferral burns you out.', ja: '忙しさで不安を覆う型。意図的な休息が薬。' } },
    ],
  },
  {
    id: 'sleep',
    emoji: '🌙',
    title: { ko: '수면 성향', en: 'Sleep Type', ja: '睡眠タイプ' },
    desc: { ko: '내 진짜 수면 동물은?', en: 'Your true sleep animal?', ja: '本当の睡眠どうぶつは？' },
    grad: ['#6E7BF2', '#9AA6FF'],
    funnel: 'dopamine',
    questions: [
      {
        text: { ko: '가장 머리가 맑은 시간?', en: 'Sharpest hours?', ja: '頭が冴える時間？' },
        options: [
          { text: { ko: '이른 아침', en: 'Early morning', ja: '早朝' }, to: 'rooster' },
          { text: { ko: '늦은 밤', en: 'Late night', ja: '深夜' }, to: 'owl' },
          { text: { ko: '눕자마자 바로 잠', en: 'Anytime, instantly', ja: 'いつでも即寝' }, to: 'faint' },
          { text: { ko: '늘 피곤·잠 부족', en: 'Always tired', ja: 'いつも寝不足' }, to: 'insomnia' },
        ],
      },
      {
        text: { ko: '침대에 누우면?', en: 'In bed?', ja: 'ベッドに入ると？' },
        options: [
          { text: { ko: '일찍 자고 일찍 깸', en: 'Early to bed/rise', ja: '早寝早起き' }, to: 'rooster' },
          { text: { ko: '폰 보다 새벽', en: 'Phone till dawn', ja: 'スマホで朝に' }, to: 'owl' },
          { text: { ko: '3초 컷 기절', en: 'Out in 3 sec', ja: '3秒で気絶' }, to: 'faint' },
          { text: { ko: '생각이 꼬리 물어', en: 'Mind races', ja: '考えが止まらない' }, to: 'insomnia' },
        ],
      },
      {
        text: { ko: '주말 기상은?', en: 'Weekend wake-up?', ja: '週末の起床は？' },
        options: [
          { text: { ko: '평일과 똑같이 일찍', en: 'Early as always', ja: '平日同様早く' }, to: 'rooster' },
          { text: { ko: '정오는 돼야', en: 'Around noon', ja: '正午頃' }, to: 'owl' },
          { text: { ko: '알람 무시하고 더 잠', en: 'Ignore alarm', ja: 'アラーム無視' }, to: 'faint' },
          { text: { ko: '일찍 깨도 못 일어남', en: 'Awake but stuck', ja: '早く目覚めても起きられず' }, to: 'insomnia' },
        ],
      },
      {
        text: { ko: '낮의 컨디션은?', en: 'Daytime energy?', ja: '日中の調子は？' },
        options: [
          { text: { ko: '오전 쌩쌩, 저녁 다운', en: 'Fresh AM, low PM', ja: '午前元気夜ダウン' }, to: 'rooster' },
          { text: { ko: '오후부터 시동', en: 'Wake up by PM', ja: '午後から始動' }, to: 'owl' },
          { text: { ko: '틈만 나면 졸림', en: 'Sleepy anytime', ja: '隙あれば眠い' }, to: 'faint' },
          { text: { ko: '늘 멍하고 피곤', en: 'Foggy & tired', ja: 'いつも疲れ' }, to: 'insomnia' },
        ],
      },
    ],
    results: [
      { key: 'rooster', emoji: '🐓', name: { ko: '아침형 닭', en: 'Morning Rooster', ja: '朝型ニワトリ' }, tag: { ko: '새벽을 지배한다', en: 'Owns the dawn', ja: '朝を制す' }, desc: { ko: '생체시계가 아침에 최적화된 타입. 규칙적이고 생산적이지만, 저녁 약속엔 배터리가 빨리 닳아요.', en: 'Your clock peaks in the morning — regular and productive, but evenings drain you fast.', ja: '朝に最適化された体内時計。夜は電池切れ早め。' } },
      { key: 'owl', emoji: '🦉', name: { ko: '올빼미', en: 'Night Owl', ja: 'フクロウ' }, tag: { ko: '밤에 살아난다', en: 'Alive at night', ja: '夜に蘇る' }, desc: { ko: '밤에 집중력이 솟는 타입. 창의적이지만 사회의 아침 스케줄과 늘 시차 전쟁 중. 빛 관리가 핵심이에요.', en: 'You spark at night — creative, but always jet-lagged vs society. Manage light.', ja: '夜に冴える型。社会の朝とずれ続ける。光管理が鍵。' } },
      { key: 'faint', emoji: '💤', name: { ko: '기절형', en: 'Insta-Sleeper', ja: '気絶型' }, tag: { ko: '눕는 순간 끝', en: 'Lights out instantly', ja: '横になれば終了' }, desc: { ko: '어디서든 빨리 잠드는 복 받은 타입. 다만 너무 쉽게 곯아떨어진다면 만성 수면부족 신호일 수도 있어요.', en: 'You sleep anywhere fast — lucky! But too-instant sleep can signal chronic deprivation.', ja: 'どこでも即寝の幸運型。即落ちすぎは寝不足のサインかも。' } },
      { key: 'insomnia', emoji: '🌙', name: { ko: '불면 달', en: 'Restless Moon', ja: '不眠の月' }, tag: { ko: '몸은 피곤한데 잠은 안 와', en: 'Tired but wired', ja: '疲れてるのに眠れない' }, desc: { ko: '생각이 많아 잠들기 힘든 타입. 불안·각성이 높을 수 있어요. 자기 전 화면 끄기와 호흡이 도움 됩니다.', en: 'Your busy mind blocks sleep — likely high arousal. Screen-off + breathing help.', ja: '考えが多く眠れない型。就寝前の画面オフと呼吸を。' } },
    ],
  },
  {
    id: 'color',
    emoji: '🎨',
    title: { ko: '색채 심리', en: 'Color Psychology', ja: '色彩心理' },
    desc: { ko: '끌리는 색으로 보는 내 마음', en: 'Your mind via the color you love', ja: '惹かれる色でわかる心' },
    grad: ['#FF8A4C', '#FFC04C'],
    funnel: 'ego',
    questions: [
      {
        text: { ko: '지금 가장 끌리는 색은?', en: 'Most drawn to right now?', ja: '今一番惹かれる色は？' },
        options: [
          { text: { ko: '❤️ 빨강', en: '❤️ Red', ja: '❤️ 赤' }, to: 'red' },
          { text: { ko: '💙 파랑', en: '💙 Blue', ja: '💙 青' }, to: 'blue' },
          { text: { ko: '💛 노랑', en: '💛 Yellow', ja: '💛 黄' }, to: 'yellow' },
          { text: { ko: '💚 초록', en: '💚 Green', ja: '💚 緑' }, to: 'green' },
        ],
      },
      {
        text: { ko: '내 방 포인트 색을 고른다면?', en: 'An accent color for your room?', ja: '部屋のアクセント色は？' },
        options: [
          { text: { ko: '강렬한 레드', en: 'Bold red', ja: '鮮やかな赤' }, to: 'red' },
          { text: { ko: '시원한 블루', en: 'Cool blue', ja: '爽やかな青' }, to: 'blue' },
          { text: { ko: '밝은 옐로우', en: 'Bright yellow', ja: '明るい黄' }, to: 'yellow' },
          { text: { ko: '편안한 그린', en: 'Calm green', ja: '安らぐ緑' }, to: 'green' },
        ],
      },
      {
        text: { ko: '기분 최고일 때 떠오르는 색?', en: 'Color when you feel great?', ja: '最高の気分の色？' },
        options: [
          { text: { ko: '불타는 빨강', en: 'Fiery red', ja: '燃える赤' }, to: 'red' },
          { text: { ko: '깊은 바다 파랑', en: 'Deep-sea blue', ja: '深海の青' }, to: 'blue' },
          { text: { ko: '햇살 노랑', en: 'Sunny yellow', ja: '陽射しの黄' }, to: 'yellow' },
          { text: { ko: '숲속 초록', en: 'Forest green', ja: '森の緑' }, to: 'green' },
        ],
      },
      {
        text: { ko: '사고 싶은 옷 색은?', en: 'Color of clothes you\'d buy?', ja: '買いたい服の色は？' },
        options: [
          { text: { ko: '눈에 띄는 빨강', en: 'Eye-catching red', ja: '目立つ赤' }, to: 'red' },
          { text: { ko: '차분한 파랑', en: 'Calm blue', ja: '落ち着く青' }, to: 'blue' },
          { text: { ko: '발랄한 노랑', en: 'Cheerful yellow', ja: '元気な黄' }, to: 'yellow' },
          { text: { ko: '자연스러운 초록', en: 'Natural green', ja: '自然な緑' }, to: 'green' },
        ],
      },
    ],
    results: [
      { key: 'red', emoji: '🔴', name: { ko: '열정의 빨강', en: 'Passion Red', ja: '情熱の赤' }, tag: { ko: '뜨겁게 사는 사람', en: 'You live on fire', ja: '熱く生きる人' }, desc: { ko: '에너지와 추진력이 넘치는 타입. 하고 싶은 건 바로 해야 직성이 풀려요. 가끔은 속도를 늦추고 숨 고르기도 필요해요.', en: 'Full of energy and drive — you act on what you want, now. Slow down to breathe sometimes.', ja: 'エネルギーと推進力に溢れる型。やりたい事はすぐ実行。時には速度を落として深呼吸を。' } },
      { key: 'blue', emoji: '🔵', name: { ko: '차분한 파랑', en: 'Calm Blue', ja: '冷静な青' }, tag: { ko: '깊고 침착한 사람', en: 'Deep and composed', ja: '深く冷静な人' }, desc: { ko: '신중하고 안정적인 타입. 감정에 휘둘리지 않고 깊이 생각해요. 다만 너무 재면 기회를 놓칠 수도 있어요.', en: 'Thoughtful and steady — you think deep, not swayed by emotion. Just don\'t over-deliberate.', ja: '慎重で安定した型。感情に流されず深く考える。考えすぎて機会を逃さぬよう。' } },
      { key: 'yellow', emoji: '🟡', name: { ko: '발랄한 노랑', en: 'Bright Yellow', ja: '陽気な黄' }, tag: { ko: '밝고 사교적인 사람', en: 'Sunny and social', ja: '明るく社交的' }, desc: { ko: '어디서나 분위기를 밝히는 타입. 호기심 많고 사람을 좋아해요. 가끔은 혼자만의 충전 시간도 챙겨주세요.', en: 'You light up any room — curious and people-loving. Save some solo recharge time too.', ja: 'どこでも場を明るくする型。好奇心旺盛で人好き。一人の充電時間も大切に。' } },
      { key: 'green', emoji: '🟢', name: { ko: '평온한 초록', en: 'Serene Green', ja: '穏やかな緑' }, tag: { ko: '안정과 조화의 사람', en: 'Balance and harmony', ja: '安定と調和の人' }, desc: { ko: '편안하고 배려심 깊은 타입. 주변을 조화롭게 만들어요. 남을 챙기느라 내 마음을 미루지 않도록 해요.', en: 'Easygoing and caring — you bring harmony. Don\'t put your own needs last.', ja: '穏やかで思いやり深い型。周りを調和させる。自分の心も後回しにしないで。' } },
    ],
  },
  {
    id: 'energy',
    emoji: '🔋',
    title: { ko: '에너지 타입', en: 'Energy Type', ja: 'エネルギータイプ' },
    desc: { ko: 'MBTI가 못 잡는 진짜 내향·외향', en: 'Your true intro/extra beyond MBTI', ja: 'MBTIを超える内向·外向' },
    grad: ['#10B981', '#5BD9A8'],
    funnel: 'ego',
    questions: [
      {
        text: { ko: '주말에 푹 쉬는 법은?', en: 'How you truly rest on weekends?', ja: '週末の本当の休み方は？' },
        options: [
          { text: { ko: '친구들과 만나서 놀기', en: 'Hang out with friends', ja: '友達と遊ぶ' }, to: 'crowd' },
          { text: { ko: '혼자 집에서 뒹굴기', en: 'Chill alone at home', ja: '一人で家でゴロゴロ' }, to: 'solo' },
          { text: { ko: '둘 다 적당히', en: 'A bit of both', ja: '両方ほどほどに' }, to: 'mixed' },
          { text: { ko: '자도 자도 피곤', en: 'Tired no matter what', ja: '寝ても疲れる' }, to: 'drained' },
        ],
      },
      {
        text: { ko: '사람 많은 모임 다녀온 뒤?', en: 'After a big gathering?', ja: '大人数の集まりの後は？' },
        options: [
          { text: { ko: '더 신나고 충전됨', en: 'Even more energized', ja: 'もっと元気に' }, to: 'crowd' },
          { text: { ko: '진이 빠져 혼자 쉬어야', en: 'Drained, need alone time', ja: '消耗、一人で休む' }, to: 'solo' },
          { text: { ko: '그때그때 달라', en: 'Depends on the day', ja: 'その時次第' }, to: 'mixed' },
          { text: { ko: '며칠은 회복해야', en: 'Need days to recover', ja: '数日回復が必要' }, to: 'drained' },
        ],
      },
      {
        text: { ko: '에너지가 솟는 순간은?', en: 'When your energy peaks?', ja: 'エネルギーが湧く瞬間は？' },
        options: [
          { text: { ko: '함께 떠들썩할 때', en: 'In lively company', ja: 'みんなで賑やかな時' }, to: 'crowd' },
          { text: { ko: '혼자 몰입할 때', en: 'In solo flow', ja: '一人で没頭する時' }, to: 'solo' },
          { text: { ko: '마음 맞는 1:1', en: 'One-on-one with a close one', ja: '気の合う1対1' }, to: 'mixed' },
          { text: { ko: '솔직히 잘 모르겠음', en: 'Honestly not sure', ja: '正直よく分からない' }, to: 'drained' },
        ],
      },
      {
        text: { ko: '아무 약속 없는 주말이면?', en: 'A weekend with zero plans?', ja: '予定ゼロの週末なら？' },
        options: [
          { text: { ko: '심심해서 먼저 연락', en: 'Bored, I reach out first', ja: '退屈で自分から連絡' }, to: 'crowd' },
          { text: { ko: '오히려 평화롭다', en: 'Actually peaceful', ja: 'むしろ平和' }, to: 'solo' },
          { text: { ko: '적당히 좋다', en: 'Fine either way', ja: 'ほどほどに良い' }, to: 'mixed' },
          { text: { ko: '쉬어도 기운 없음', en: 'Still low even resting', ja: '休んでも元気出ない' }, to: 'drained' },
        ],
      },
    ],
    results: [
      { key: 'crowd', emoji: '🔋', name: { ko: '인싸 발전기', en: 'Social Dynamo', ja: '社交の発電機' }, tag: { ko: '사람 속에서 충전', en: 'Charged by people', ja: '人の中で充電' }, desc: { ko: '사람들과 어울릴수록 에너지가 차는 외향형. 활기와 추진력이 강점이에요. 가끔은 혼자만의 정리 시간도 끼워 넣어보세요.', en: 'An extrovert who charges among people — lively and driven. Slot in some solo reset time too.', ja: '人と関わるほど充電される外向型。活気と推進力が強み。時には一人の整理時間も。' } },
      { key: 'solo', emoji: '🔌', name: { ko: '혼자 충전기', en: 'Solo Charger', ja: 'ソロ充電器' }, tag: { ko: '혼자만의 시간이 보약', en: 'Alone time is medicine', ja: '一人時間が薬' }, desc: { ko: '혼자 있을 때 가장 깊이 회복하는 내향형. 집중력과 사색이 강점이에요. 좋아하는 사람과의 만남은 짧고 굵게가 좋아요.', en: 'An introvert who recovers deepest alone — focus and reflection are your strengths. Keep social time short and meaningful.', ja: '一人で最も深く回復する内向型。集中と思索が強み。人付き合いは短く濃く。' } },
      { key: 'mixed', emoji: '🎛️', name: { ko: '균형 충전기', en: 'Flex Charger', ja: 'バランス充電器' }, tag: { ko: '상황 따라 조절', en: 'Adjusts to the moment', ja: '状況で調整' }, desc: { ko: '상황에 맞춰 외향·내향을 오가는 양향형. 적응력이 뛰어나요. 단, 내 진짜 에너지 상태를 자주 살펴주는 게 좋아요.', en: 'An ambivert who flexes between intro and extra — highly adaptable. Just check in on your real energy often.', ja: '状況で内外を行き来する両向型。適応力抜群。自分の本当のエネルギーを時々確認。' } },
      { key: 'drained', emoji: '🪫', name: { ko: '방전 주의', en: 'Low Battery', ja: '放電注意' }, tag: { ko: '쉽게 지치니 회복 우선', en: 'Drains easily — recover first', ja: '消耗しやすい—回復優先' }, desc: { ko: '요즘 쉬어도 기운이 잘 안 차는 상태일 수 있어요. 내향·외향의 문제라기보다 회복이 먼저 필요한 신호예요. 번아웃 검사로 더 살펴보세요.', en: 'Lately rest may not be recharging you — less about intro/extra, more a sign you need recovery first. Try the burnout test.', ja: '最近休んでも充電されにくい状態かも。内外より回復が先のサイン。燃え尽き検査で確認を。' } },
    ],
  },
  {
    id: 'friend',
    emoji: '🧑‍🤝‍🧑',
    title: { ko: '친구 유형', en: 'Friend Type', ja: '友達タイプ' },
    desc: { ko: '모임에서 나는 어떤 친구?', en: 'What kind of friend are you?', ja: '集まりでどんな友達？' },
    grad: ['#12A5C2', '#5BD0E0'],
    funnel: 'ego',
    questions: [
      {
        text: { ko: '약속을 잡을 때 나는?', en: 'When making plans?', ja: '約束を決める時は？' },
        options: [
          { text: { ko: '내가 다 정하고 끌고 감', en: 'I plan and lead it', ja: '私が決めて引っ張る' }, to: 'leader' },
          { text: { ko: '신나서 분위기 띄움', en: 'Hype everyone up', ja: '盛り上げ役' }, to: 'mood' },
          { text: { ko: '다들 괜찮은지 챙김', en: 'Check everyone\'s okay', ja: 'みんなを気遣う' }, to: 'helper' },
          { text: { ko: '정해지면 따라감', en: 'Go with the flow', ja: '決まったら従う' }, to: 'chill' },
        ],
      },
      {
        text: { ko: '친구가 고민을 털어놓으면?', en: 'When a friend vents?', ja: '友達が悩みを話すと？' },
        options: [
          { text: { ko: '해결책을 제시함', en: 'Offer solutions', ja: '解決策を出す' }, to: 'leader' },
          { text: { ko: '웃기며 기분 풀어줌', en: 'Cheer them up', ja: '笑わせて気晴らし' }, to: 'mood' },
          { text: { ko: '끝까지 들어줌', en: 'Listen to the end', ja: '最後まで聞く' }, to: 'helper' },
          { text: { ko: '곁에 조용히 있어줌', en: 'Quietly stay near', ja: 'そっとそばに' }, to: 'chill' },
        ],
      },
      {
        text: { ko: '모임에서 내 자리는?', en: 'My role in a group?', ja: '集まりでの役割は？' },
        options: [
          { text: { ko: '중심에서 진행', en: 'Center, running it', ja: '中心で進行' }, to: 'leader' },
          { text: { ko: '웃음 담당', en: 'The funny one', ja: '笑い担当' }, to: 'mood' },
          { text: { ko: '챙김 담당', en: 'The caretaker', ja: '気配り担当' }, to: 'helper' },
          { text: { ko: '편하게 묻어감', en: 'Easygoing tag-along', ja: '気楽に紛れる' }, to: 'chill' },
        ],
      },
      {
        text: { ko: '연락 빈도는?', en: 'How often you text?', ja: '連絡の頻度は？' },
        options: [
          { text: { ko: '내가 먼저 자주', en: 'I reach out a lot', ja: '私からよく' }, to: 'leader' },
          { text: { ko: '드립·짤로 자주', en: 'Memes & jokes often', ja: 'ネタでよく' }, to: 'mood' },
          { text: { ko: '안부 자주 물음', en: 'Check in often', ja: 'よく安否確認' }, to: 'helper' },
          { text: { ko: '필요할 때만', en: 'Only when needed', ja: '必要な時だけ' }, to: 'chill' },
        ],
      },
    ],
    results: [
      { key: 'leader', emoji: '👑', name: { ko: '리더형', en: 'The Leader', ja: 'リーダー型' }, tag: { ko: '모임은 내가 굴린다', en: 'I run the crew', ja: '集まりは私が回す' }, desc: { ko: '계획하고 이끄는 든든한 중심. 결단력이 강점이에요. 가끔은 친구들에게 키를 넘겨주면 더 편해져요.', en: 'A dependable center who plans and leads — decisive. Hand over the wheel sometimes to relax.', ja: '計画し導く頼れる中心。決断力が強み。時々友達に主導権を渡すと楽。' } },
      { key: 'mood', emoji: '🎉', name: { ko: '분위기메이커', en: 'Mood Maker', ja: 'ムードメーカー' }, tag: { ko: '내가 있으면 텐션 업', en: 'I bring the energy', ja: '私がいれば盛り上がる' }, desc: { ko: '어디서나 분위기를 밝히는 에너지원. 함께 있으면 즐거워요. 가끔은 내 진짜 기분도 솔직히 나눠보세요.', en: 'The energy that lights up any room — fun to be with. Share your real feelings sometimes too.', ja: 'どこでも場を明るくするエネルギー源。たまには本音も共有を。' } },
      { key: 'helper', emoji: '🫂', name: { ko: '상담사형', en: 'The Listener', ja: '相談役型' }, tag: { ko: '고민은 나한테', en: 'Bring me your worries', ja: '悩みは私に' }, desc: { ko: '잘 들어주고 챙기는 따뜻한 친구. 공감력이 최고예요. 남 챙기느라 내 마음을 미루지 않도록 해요.', en: 'A warm friend who listens and cares — top empathy. Don\'t put your own needs last.', ja: 'よく聞き気遣う温かい友達。共感力抜群。自分の心も後回しにしないで。' } },
      { key: 'chill', emoji: '🐢', name: { ko: '마이페이스', en: 'Easygoing', ja: 'マイペース' }, tag: { ko: '편한 거리감이 좋아', en: 'I like comfy distance', ja: '心地よい距離が好き' }, desc: { ko: '무리하지 않는 편안한 친구. 함께 있어도 부담이 없어요. 가끔 먼저 다가가면 관계가 더 깊어져요.', en: 'A relaxed, low-pressure friend. Reach out first now and then to go deeper.', ja: '無理しない気楽な友達。たまに自分から近づくと深まる。' } },
    ],
  },
  {
    id: 'lovecell',
    emoji: '💘',
    title: { ko: '연애세포', en: 'Love Cells', ja: '恋愛細胞' },
    desc: { ko: '내 연애세포는 지금 몇 살?', en: 'How alive are your love cells?', ja: '恋愛細胞は今元気？' },
    grad: ['#F25C8E', '#FF9EC0'],
    funnel: 'love',
    questions: [
      {
        text: { ko: '길에서 이상형을 봤다면?', en: 'You spot your type on the street?', ja: '街で理想の人を見たら？' },
        options: [
          { text: { ko: '심장 쿵! 눈 떼질 못함', en: 'Heart skips, can\'t look away', ja: 'ドキッ、目が離せない' }, to: 'max' },
          { text: { ko: '음… 그냥 지나감', en: 'Meh, walk past', ja: 'うーん、通り過ぎる' }, to: 'sleep' },
          { text: { ko: '관심 있는 척 안 함', en: 'Hide my interest', ja: '興味ないふり' }, to: 'tease' },
          { text: { ko: '아무 느낌 없음', en: 'Feel nothing', ja: '何も感じない' }, to: 'stone' },
        ],
      },
      {
        text: { ko: '썸 타는 상대의 연락?', en: 'A text from your crush?', ja: '気になる人からの連絡？' },
        options: [
          { text: { ko: '바로 답하고 설렘', en: 'Reply instantly, giddy', ja: '即返信でときめく' }, to: 'max' },
          { text: { ko: '연애를 안 한 지 오래', en: 'Haven\'t dated in ages', ja: '長らく恋愛してない' }, to: 'sleep' },
          { text: { ko: '일부러 천천히 답', en: 'Reply slowly on purpose', ja: 'わざとゆっくり' }, to: 'tease' },
          { text: { ko: '답장 귀찮음', en: 'Can\'t be bothered', ja: '返信が面倒' }, to: 'stone' },
        ],
      },
      {
        text: { ko: '로맨스 콘텐츠를 보면?', en: 'Watching a romance?', ja: 'ロマンス作品を見ると？' },
        options: [
          { text: { ko: '나도 연애하고 싶어짐', en: 'I want love too', ja: '私も恋したくなる' }, to: 'max' },
          { text: { ko: '봐도 무덤덤', en: 'Indifferent', ja: '見ても無感動' }, to: 'sleep' },
          { text: { ko: '분석하며 봄', en: 'Analyze it coolly', ja: '分析しながら見る' }, to: 'tease' },
          { text: { ko: '오글거려 끔', en: 'Cringe, turn off', ja: 'むず痒くて消す' }, to: 'stone' },
        ],
      },
      {
        text: { ko: '소개팅 제안이 들어오면?', en: 'Offered a blind date?', ja: '紹介を提案されたら？' },
        options: [
          { text: { ko: '좋아! 언제?', en: 'Yes! When?', ja: 'いいね！いつ？' }, to: 'max' },
          { text: { ko: '귀찮지만 나가볼까', en: 'Meh, maybe', ja: '面倒だけど行くか' }, to: 'sleep' },
          { text: { ko: '상대 정보부터 분석', en: 'Vet them first', ja: 'まず相手を分析' }, to: 'tease' },
          { text: { ko: '극구 사양', en: 'Hard pass', ja: '丁重にお断り' }, to: 'stone' },
        ],
      },
    ],
    results: [
      { key: 'max', emoji: '💘', name: { ko: '만렙 연애세포', en: 'Max-Level Cells', ja: 'マックス恋愛細胞' }, tag: { ko: '지금 당장 연애 가능', en: 'Ready to fall in love', ja: '今すぐ恋愛OK' }, desc: { ko: '연애세포가 펄떡펄떡 살아있는 상태! 설렘에 솔직하고 표현도 잘해요. 다만 너무 빠지기 전에 상대를 천천히 알아가는 여유도 챙겨요.', en: 'Your love cells are wide awake — honest with butterflies and expressive. Just pace getting to know them.', ja: '恋愛細胞が元気いっぱい！ときめきに正直。ただ夢中になる前に相手をゆっくり知る余裕も。' } },
      { key: 'sleep', emoji: '😴', name: { ko: '휴면 연애세포', en: 'Dormant Cells', ja: '休眠細胞' }, tag: { ko: '자는 중, 깨우면 됨', en: 'Asleep, just needs a nudge', ja: '寝てるだけ、起こせばOK' }, desc: { ko: '바빠서 연애를 잠시 미뤄둔 상태예요. 세포가 죽은 게 아니라 자는 것! 설레는 콘텐츠나 새 사람을 만나면 금방 깨어나요.', en: 'You\'ve just put love on pause — cells asleep, not dead. New people or a good romance will wake them fast.', ja: '忙しくて恋愛を一時保留中。死んでなく寝てるだけ！新しい出会いですぐ目覚める。' } },
      { key: 'tease', emoji: '😼', name: { ko: '밀당 연애세포', en: 'Tease Cells', ja: '駆け引き細胞' }, tag: { ko: '관심 있어도 재는 중', en: 'Interested but playing it cool', ja: '興味あるけど様子見' }, desc: { ko: '마음은 있는데 들키기 싫어 재는 타입. 신중함이 강점이지만, 너무 재다 보면 좋은 인연을 놓칠 수도 있어요. 가끔은 직진도 필요해요.', en: 'Interested but hiding it — cautious is good, but over-vetting can cost good connections. Go direct sometimes.', ja: '気はあるけど隠す型。慎重さは強みだが、見極めすぎは良縁を逃す。たまに直進も。' } },
      { key: 'stone', emoji: '🪨', name: { ko: '돌멩이 연애세포', en: 'Stone Cells', ja: '石の細胞' }, tag: { ko: '지금은 연애 0순위 아님', en: 'Love isn\'t a priority now', ja: '今は恋愛優先度0' }, desc: { ko: '지금은 연애보다 나에게 집중하는 시기예요. 나쁜 게 아니라 자연스러운 흐름! 다만 마음의 문을 아예 닫진 말고, 좋은 사람엔 살짝 열어두세요.', en: 'Right now you\'re focused on yourself, not romance — totally natural. Just keep the door slightly open for the right person.', ja: '今は恋愛より自分に集中する時期。自然な流れ！ただ心の扉は少し開けておいて。' } },
    ],
  },
  {
    id: 'soulmate',
    emoji: '💞',
    title: { ko: '소울메이트', en: 'Soulmate', ja: 'ソウルメイト' },
    desc: { ko: '나랑 찰떡인 짝꿍은?', en: 'Who\'s your perfect match?', ja: 'ピッタリの相手は？' },
    grad: ['#F25C8E', '#C58BF2'],
    funnel: 'love',
    questions: [
      {
        text: { ko: '연애에서 가장 중요한 건?', en: 'Most important in love?', ja: '恋愛で一番大事なのは？' },
        options: [
          { text: { ko: '편안하고 안정적인 사이', en: 'Comfort & stability', ja: '安らぎと安定' }, to: 'stable' },
          { text: { ko: '설레는 새로운 경험', en: 'Exciting new experiences', ja: 'ときめく新体験' }, to: 'adventure' },
          { text: { ko: '대화가 잘 통함', en: 'Great conversations', ja: '会話が合う' }, to: 'smart' },
          { text: { ko: '다정한 표현과 챙김', en: 'Warmth & care', ja: '優しさと気遣い' }, to: 'sweet' },
        ],
      },
      {
        text: { ko: '데이트로 가장 좋은 건?', en: 'Your ideal date?', ja: '理想のデートは？' },
        options: [
          { text: { ko: '집에서 같이 뒹굴기', en: 'Cozy day in', ja: '家でまったり' }, to: 'stable' },
          { text: { ko: '즉흥 여행·액티비티', en: 'Spontaneous trip', ja: '即興旅行' }, to: 'adventure' },
          { text: { ko: '전시·책방 데이트', en: 'Museum & bookshop', ja: '展示·本屋' }, to: 'smart' },
          { text: { ko: '맛집 다니며 챙겨주기', en: 'Foodie & caring', ja: 'グルメで気遣い' }, to: 'sweet' },
        ],
      },
      {
        text: { ko: '상대에게 끌리는 순간?', en: 'When you feel drawn?', ja: '惹かれる瞬間？' },
        options: [
          { text: { ko: '한결같이 든든할 때', en: 'When they\'re steady', ja: '一途で頼れる時' }, to: 'stable' },
          { text: { ko: '예측불가 매력 보일 때', en: 'When they surprise me', ja: '予測不能な時' }, to: 'adventure' },
          { text: { ko: '똑똑하고 깊은 생각', en: 'When they\'re sharp', ja: '賢く深い時' }, to: 'smart' },
          { text: { ko: '세심하게 챙겨줄 때', en: 'When they care', ja: '気遣ってくれる時' }, to: 'sweet' },
        ],
      },
      {
        text: { ko: '싸운 뒤 바라는 건?', en: 'After a fight, you want?', ja: 'ケンカ後に望むのは？' },
        options: [
          { text: { ko: '차분히 풀고 안정 찾기', en: 'Calm it down', ja: '落ち着いて解決' }, to: 'stable' },
          { text: { ko: '쿨하게 풀고 새 출발', en: 'Cool reset', ja: 'クールに仕切り直し' }, to: 'adventure' },
          { text: { ko: '대화로 끝까지 이해', en: 'Talk it fully out', ja: '会話で理解' }, to: 'smart' },
          { text: { ko: '먼저 다정하게 안아주기', en: 'A warm hug first', ja: 'まず優しく抱擁' }, to: 'sweet' },
        ],
      },
    ],
    results: [
      { key: 'stable', emoji: '🐧', grad: ['#5B9DF2', '#7FD1C9'], name: { ko: '안정형 짝꿍', en: 'The Steady One', ja: '安定型の相手' }, tag: { ko: '편안하고 든든한 사람', en: 'Calm and dependable', ja: '安らぐ頼れる人' }, desc: { ko: '당신에겐 들쭉날쭉한 설렘보다 한결같은 안정감을 주는 사람이 잘 맞아요. 함께 있으면 마음이 편안해지는 짝꿍을 찾으세요.', en: 'You fit best with someone steady, not a rollercoaster — a partner who makes you feel at ease.', ja: 'あなたには波乱より一途な安定をくれる人が合う。一緒にいて安らぐ相手を。' } },
      { key: 'adventure', emoji: '🦊', grad: ['#FF7A59', '#FF5C8E'], name: { ko: '모험형 짝꿍', en: 'The Adventurer', ja: '冒険型の相手' }, tag: { ko: '설레게 하는 사람', en: 'Keeps it exciting', ja: 'ときめかせる人' }, desc: { ko: '예측 불가능한 매력과 새로운 자극을 주는 사람에게 끌려요. 함께 모험하고 성장하는 짝꿍이 당신을 빛나게 합니다.', en: 'You\'re drawn to unpredictable charm and fresh thrills. A partner to adventure and grow with lights you up.', ja: '予測不能な魅力と新しい刺激に惹かれる。共に冒険し成長する相手が輝かせる。' } },
      { key: 'smart', emoji: '🦉', grad: ['#6C7BF2', '#A88BF2'], name: { ko: '지적인 짝꿍', en: 'The Thinker', ja: '知的な相手' }, tag: { ko: '대화가 통하는 사람', en: 'A mind that clicks', ja: '会話が合う人' }, desc: { ko: '깊은 대화와 생각의 합이 맞는 사람과 가장 잘 맞아요. 끝없이 이야기 나눌 수 있는 짝꿍이 당신의 소울메이트.', en: 'You click with deep, well-matched minds. Someone you can talk endlessly with is your soulmate.', ja: '深い会話と思考の合う人と最も合う。延々と話せる相手がソウルメイト。' } },
      { key: 'sweet', emoji: '🐨', grad: ['#FF8FB1', '#FFC59E'], name: { ko: '다정한 짝꿍', en: 'The Sweetheart', ja: '優しい相手' }, tag: { ko: '세심히 챙겨주는 사람', en: 'Warm and caring', ja: '細やかに気遣う人' }, desc: { ko: '따뜻한 표현과 세심한 챙김을 주는 사람에게 안정을 느껴요. 다정함이 사랑의 언어인 짝꿍과 깊이 연결됩니다.', en: 'Warm words and thoughtful care make you feel secure. You bond deeply with someone whose love language is tenderness.', ja: '温かい表現と細やかな気遣いに安心する。優しさが愛の言語の相手と深く繋がる。' } },
    ],
  },
  {
    id: 'stressanimal',
    emoji: '🐯',
    title: { ko: '스트레스 동물', en: 'Stress Animal', ja: 'ストレス動物' },
    desc: { ko: '스트레스 받으면 변하는 내 동물', en: 'The animal you turn into', ja: 'ストレスで変わる動物' },
    grad: ['#FF6F61', '#FFA28C'],
    funnel: 'burnout',
    questions: [
      {
        text: { ko: '스트레스가 폭발 직전이면?', en: 'About to snap?', ja: '爆発寸前なら？' },
        options: [
          { text: { ko: '버럭! 소리부터 남', en: 'I roar out loud', ja: 'ガオッと声が出る' }, to: 'tiger' },
          { text: { ko: '조용히 숨어버림', en: 'I hide away', ja: 'こっそり隠れる' }, to: 'turtle' },
          { text: { ko: '뭔가 마구 먹음', en: 'I binge-eat', ja: '何か食べまくる' }, to: 'hamster' },
          { text: { ko: '날카롭게 예민해짐', en: 'I get prickly', ja: 'トゲトゲになる' }, to: 'hedgehog' },
        ],
      },
      {
        text: { ko: '누가 말 걸면?', en: 'If someone talks to you?', ja: '話しかけられると？' },
        options: [
          { text: { ko: '나도 모르게 톡 쏨', en: 'Snap back', ja: 'つい刺々しく' }, to: 'tiger' },
          { text: { ko: '"괜찮아"하고 회피', en: '"I\'m fine," dodge', ja: '「大丈夫」と回避' }, to: 'turtle' },
          { text: { ko: '같이 먹자고 함', en: 'Let\'s eat', ja: '一緒に食べよ' }, to: 'hamster' },
          { text: { ko: '건드리면 가시 세움', en: 'Quills go up', ja: 'トゲを立てる' }, to: 'hedgehog' },
        ],
      },
      {
        text: { ko: '스트레스가 몸에 오는 곳?', en: 'Where stress hits?', ja: 'ストレスが出る所？' },
        options: [
          { text: { ko: '욱하는 짜증', en: 'Hot temper', ja: 'カッとなる' }, to: 'tiger' },
          { text: { ko: '무기력·잠수', en: 'Numb, withdraw', ja: '無気力·潜る' }, to: 'turtle' },
          { text: { ko: '식욕 폭발', en: 'Crazy appetite', ja: '食欲爆発' }, to: 'hamster' },
          { text: { ko: '예민·날카로움', en: 'On edge', ja: '神経過敏' }, to: 'hedgehog' },
        ],
      },
      {
        text: { ko: '스트레스 푸는 법은?', en: 'How you de-stress?', ja: '解消法は？' },
        options: [
          { text: { ko: '운동으로 발산', en: 'Burn it off', ja: '運動で発散' }, to: 'tiger' },
          { text: { ko: '혼자 푹 쉼', en: 'Rest alone', ja: '一人で休む' }, to: 'turtle' },
          { text: { ko: '맛있는 거 먹기', en: 'Good food', ja: '美味しい物' }, to: 'hamster' },
          { text: { ko: '예민함이 가라앉길 기다림', en: 'Wait it out', ja: '落ち着くまで待つ' }, to: 'hedgehog' },
        ],
      },
    ],
    results: [
      { key: 'tiger', emoji: '🐯', grad: ['#FF5E3A', '#FF9F45'], name: { ko: '폭발 호랑이', en: 'Roaring Tiger', ja: '爆発トラ' }, tag: { ko: '스트레스 = 분노 폭발', en: 'Stress = roar', ja: 'ストレス＝怒り' }, desc: { ko: '스트레스가 곧장 화로 터지는 타입. 빨리 풀리지만 주변이 다칠 수 있어요. 운동·심호흡으로 안전하게 발산해 보세요.', en: 'Stress turns straight to anger — fast release, but others may get hurt. Vent safely via exercise or breathing.', ja: 'ストレスが怒りに直結。発散は早いが周りが傷つく。運動·深呼吸で安全に。' } },
      { key: 'turtle', emoji: '🐢', grad: ['#3FB873', '#8BD98B'], name: { ko: '숨는 거북이', en: 'Hiding Turtle', ja: '隠れ亀' }, tag: { ko: '힘들면 등딱지 속으로', en: 'Into the shell', ja: '甲羅にこもる' }, desc: { ko: '스트레스를 받으면 혼자 숨어 삭이는 타입. 안전하지만 너무 오래 잠수하면 번아웃 위험이 커져요. 가끔은 손 내밀어 보세요.', en: 'You retreat and process alone — safe, but hiding too long risks burnout. Reach out sometimes.', ja: 'ストレスで一人にこもる型。潜りすぎは燃え尽き注意。たまに手を伸ばして。' } },
      { key: 'hamster', emoji: '🐹', grad: ['#FFA63D', '#FFD25E'], name: { ko: '폭식 햄스터', en: 'Binge Hamster', ja: '爆食ハムスター' }, tag: { ko: '스트레스 = 식욕 폭발', en: 'Stress = snacks', ja: 'ストレス＝食欲' }, desc: { ko: '스트레스를 먹는 걸로 푸는 타입. 즉각적이지만 죄책감의 굴레가 될 수 있어요. 먹기 전 5분만 다른 보상을 찾아보세요.', en: 'You soothe stress with food — instant, but watch the guilt loop. Try another reward for 5 min first.', ja: '食で解消する型。罪悪感ループに注意。食べる前に5分別の報酬を。' } },
      { key: 'hedgehog', emoji: '🦔', grad: ['#8A6FE6', '#B79CF2'], name: { ko: '예민 고슴도치', en: 'Prickly Hedgehog', ja: '神経質ハリネズミ' }, tag: { ko: '건드리면 가시 세움', en: 'Quills up when touched', ja: '触ると刺' }, desc: { ko: '스트레스를 받으면 온몸의 가시가 곤두서는 예민형. 작은 자극에도 날카로워져요. 자기 전 화면 끄기와 충분한 잠이 가시를 눕혀줍니다.', en: 'Under stress your quills stand on end — sharp at small triggers. Screens-off and good sleep soften them.', ja: 'ストレスでトゲが逆立つ神経質型。小さな刺激にも鋭くなる。就寝前の画面オフと睡眠が和らげる。' } },
    ],
  },
  {
    "id": "flower",
    "emoji": "🌸",
    "title": {
      "ko": "나의 꽃",
      "en": "Your Flower",
      "ja": "あなたの花"
    },
    "desc": {
      "ko": "4문항으로 보는 내 마음을 닮은 꽃",
      "en": "The flower that matches your heart, in 4 Qs",
      "ja": "4問でわかる、心に似た花"
    },
    "grad": [
      "#F25C8E",
      "#FFB3C7"
    ],
    "questions": [
      {
        "text": {
          "ko": "친구들이 말하는 내 매력은?",
          "en": "What do friends say is your charm?",
          "ja": "友達が言う私の魅力は？"
        },
        "options": [
          {
            "text": {
              "ko": "뜨겁고 적극적이야",
              "en": "Warm and bold",
              "ja": "情熱的で積極的"
            },
            "to": "rose"
          },
          {
            "text": {
              "ko": "늘 밝고 긍정적이야",
              "en": "Always bright and positive",
              "ja": "いつも明るく前向き"
            },
            "to": "sunflower"
          },
          {
            "text": {
              "ko": "차분하고 편안해",
              "en": "Calm and soothing",
              "ja": "落ち着いていて安らぐ"
            },
            "to": "lavender"
          },
          {
            "text": {
              "ko": "섬세하고 감성적이야",
              "en": "Delicate and sensitive",
              "ja": "繊細で感受性が豊か"
            },
            "to": "cherry"
          }
        ]
      },
      {
        "text": {
          "ko": "마음에 둔 사람이 생기면?",
          "en": "When you start to like someone?",
          "ja": "好きな人ができたら？"
        },
        "options": [
          {
            "text": {
              "ko": "솔직하게 마음을 고백해",
              "en": "Confess my feelings openly",
              "ja": "素直に告白する"
            },
            "to": "tulip"
          },
          {
            "text": {
              "ko": "먼저 다가가 표현해",
              "en": "Reach out and express it",
              "ja": "自分から表現する"
            },
            "to": "rose"
          },
          {
            "text": {
              "ko": "오래 기다려도 한 사람만",
              "en": "Wait long, but stay loyal to one",
              "ja": "長く待ってもひとりだけ"
            },
            "to": "camellia"
          },
          {
            "text": {
              "ko": "조용히 지켜보며 응원해",
              "en": "Quietly watch and cheer them on",
              "ja": "そっと見守り応援する"
            },
            "to": "lavender"
          }
        ]
      },
      {
        "text": {
          "ko": "주말에 가장 나다운 하루는?",
          "en": "Your most you-like weekend?",
          "ja": "一番自分らしい週末は？"
        },
        "options": [
          {
            "text": {
              "ko": "햇살 아래 산책하며 기분 전환",
              "en": "A sunny walk to lift my mood",
              "ja": "陽の下を散歩して気分転換"
            },
            "to": "sunflower"
          },
          {
            "text": {
              "ko": "새로운 일에 신나게 도전",
              "en": "Happily try something new",
              "ja": "新しいことに楽しく挑戦"
            },
            "to": "tulip"
          },
          {
            "text": {
              "ko": "좋아하는 음악과 향초로 힐링",
              "en": "Music and candles to unwind",
              "ja": "好きな音楽とお香で癒し"
            },
            "to": "lavender"
          },
          {
            "text": {
              "ko": "감성 가득한 카페에서 사색",
              "en": "Daydream at a cozy cafe",
              "ja": "雰囲気あるカフェで物思い"
            },
            "to": "cherry"
          }
        ]
      },
      {
        "text": {
          "ko": "힘든 일이 닥쳤을 때 나는?",
          "en": "When things get hard, I…",
          "ja": "辛いことが起きたら私は？"
        },
        "options": [
          {
            "text": {
              "ko": "정면으로 부딪쳐 이겨내",
              "en": "Face it head-on and win",
              "ja": "正面から立ち向かう"
            },
            "to": "rose"
          },
          {
            "text": {
              "ko": "곧 좋아질 거라 믿어",
              "en": "Trust it'll get better soon",
              "ja": "すぐ良くなると信じる"
            },
            "to": "sunflower"
          },
          {
            "text": {
              "ko": "묵묵히 견디며 끝까지 지켜",
              "en": "Endure quietly and stay true",
              "ja": "黙って耐え最後まで守る"
            },
            "to": "camellia"
          },
          {
            "text": {
              "ko": "지금도 의미가 있다 여겨",
              "en": "Find meaning even in this",
              "ja": "今にも意味があると思う"
            },
            "to": "cherry"
          }
        ]
      }
    ],
    "results": [
      {
        "key": "rose",
        "emoji": "🌹",
        "name": {
          "ko": "정열의 장미",
          "en": "Passionate Rose",
          "ja": "情熱のバラ"
        },
        "tag": {
          "ko": "사랑도 일도 뜨겁게",
          "en": "Hot in love and work",
          "ja": "愛も仕事も熱く"
        },
        "desc": {
          "ko": "장미의 꽃말은 '사랑'과 '열정'이에요. 당신은 마음을 솔직하게 표현하고 원하는 걸 향해 당당히 나아가는 사람. 그 뜨거운 에너지가 큰 매력이지만, 가끔은 상대의 속도도 함께 살펴주면 더 오래 빛나요.",
          "en": "The rose means 'love' and 'passion.' You express your heart honestly and move boldly toward what you want. That fiery energy is your charm — just mind others' pace to shine even longer.",
          "ja": "バラの花言葉は『愛』と『情熱』。あなたは気持ちを素直に表し、望むものへ堂々と進む人。その熱いエネルギーが魅力ですが、時には相手のペースも見てあげるとより長く輝けます。"
        },
        "grad": [
          "#E63950",
          "#FF7A93"
        ]
      },
      {
        "key": "sunflower",
        "emoji": "🌻",
        "name": {
          "ko": "긍정의 해바라기",
          "en": "Sunny Sunflower",
          "ja": "前向きヒマワリ"
        },
        "tag": {
          "ko": "늘 밝은 쪽을 바라봐",
          "en": "Always facing the light",
          "ja": "いつも明るい方を見る"
        },
        "desc": {
          "ko": "해바라기의 꽃말은 '희망'과 '한결같은 마음'이에요. 해를 따라 도는 꽃처럼, 당신은 어떤 상황에서도 밝은 면을 찾아내는 긍정 에너지의 소유자. 그 따뜻함이 주변까지 환하게 비추니, 가끔은 흐린 날의 내 마음도 다정히 챙겨줘요.",
          "en": "The sunflower means 'hope' and 'steadfast heart.' Like a flower that turns to the sun, you find the bright side in anything. Your warmth lights up everyone around you — just be gentle with yourself on cloudy days too.",
          "ja": "ヒマワリの花言葉は『希望』と『一途な心』。太陽を追う花のように、あなたはどんな時も明るい面を見つける前向きな人。その温かさが周りまで照らすので、曇りの日の自分の心も優しく労わって。"
        },
        "grad": [
          "#F5A623",
          "#FFD64D"
        ]
      },
      {
        "key": "lavender",
        "emoji": "💜",
        "name": {
          "ko": "차분한 라벤더",
          "en": "Calm Lavender",
          "ja": "穏やかなラベンダー"
        },
        "tag": {
          "ko": "조용히 곁을 지키는 사람",
          "en": "Quietly by your side",
          "ja": "そっとそばにいる人"
        },
        "desc": {
          "ko": "라벤더의 꽃말은 '침묵'과 '기다림'이에요. 향기로 마음을 가라앉히는 꽃처럼, 당신은 차분하고 사려 깊어 함께 있으면 편안해지는 사람. 묵묵한 다정함이 강점이지만, 하고 싶은 말은 가끔 소리 내어 표현해도 좋아요.",
          "en": "Lavender means 'silence' and 'waiting.' Like a flower whose scent calms the mind, you're composed and thoughtful — soothing to be around. Your quiet warmth is a gift; just speak your wishes out loud sometimes too.",
          "ja": "ラベンダーの花言葉は『沈黙』と『待つこと』。香りで心を鎮める花のように、あなたは穏やかで思慮深く、一緒にいて安らぐ人。静かな優しさが強みですが、言いたいことは時々声に出してもいいんですよ。"
        },
        "grad": [
          "#8E7CC3",
          "#C3A6E6"
        ]
      },
      {
        "key": "cherry",
        "emoji": "🌸",
        "name": {
          "ko": "섬세한 벚꽃",
          "en": "Delicate Blossom",
          "ja": "繊細な桜"
        },
        "tag": {
          "ko": "지금 이 순간을 소중히",
          "en": "Cherishing this moment",
          "ja": "今この瞬間を大切に"
        },
        "desc": {
          "ko": "벚꽃의 꽃말은 '순수한 마음'과 '아름다운 순간'이에요. 활짝 폈다 지는 꽃처럼, 당신은 감수성이 풍부하고 지금 이 순간의 아름다움을 느낄 줄 아는 사람. 섬세함이 큰 매력이지만, 작은 일에 너무 깊이 흔들릴 땐 잠시 숨을 골라요.",
          "en": "Cherry blossom means 'pure heart' and 'beautiful moment.' Like a flower that blooms then falls, you're sensitive and able to feel the beauty of right now. Your delicacy is a charm — just breathe when small things shake you too deeply.",
          "ja": "桜の花言葉は『純粋な心』と『美しい瞬間』。咲いては散る花のように、あなたは感受性が豊かで、今この瞬間の美しさを感じられる人。繊細さが魅力ですが、小さなことに深く揺れる時はひと呼吸を。"
        },
        "grad": [
          "#F49AC1",
          "#FFD1E3"
        ]
      },
      {
        "key": "camellia",
        "emoji": "🌺",
        "name": {
          "ko": "의리의 동백",
          "en": "Loyal Camellia",
          "ja": "義理の椿"
        },
        "tag": {
          "ko": "한번 마음 주면 끝까지",
          "en": "Loyal once your heart's in",
          "ja": "一度心を許せば最後まで"
        },
        "desc": {
          "ko": "동백의 꽃말은 '진실한 사랑'과 '기다림'이에요. 추운 겨울에도 굳건히 꽃을 피우는 동백처럼, 당신은 한번 마음을 준 사람과 약속을 끝까지 지키는 의리파. 그 단단함이 큰 신뢰를 주지만, 가끔은 나 자신에게도 너그러워지면 좋아요.",
          "en": "Camellia means 'true love' and 'waiting.' Like a flower that blooms firm through winter cold, you keep your bonds and promises to the end. That steadfastness earns deep trust — just be kind to yourself sometimes too.",
          "ja": "椿の花言葉は『真実の愛』と『待つこと』。寒い冬にも凛と咲く椿のように、あなたは一度心を許した人や約束を最後まで守る義理堅い人。その固さが信頼を生みますが、時には自分にも優しくなって。"
        },
        "grad": [
          "#D6336C",
          "#F06595"
        ]
      },
      {
        "key": "tulip",
        "emoji": "🌷",
        "name": {
          "ko": "낙천의 튤립",
          "en": "Cheerful Tulip",
          "ja": "楽天のチューリップ"
        },
        "tag": {
          "ko": "솔직하게, 즐겁게",
          "en": "Honest and easygoing",
          "ja": "素直に、楽しく"
        },
        "desc": {
          "ko": "튤립의 꽃말은 '사랑의 고백'과 '새로운 시작'이에요. 봄을 가장 먼저 알리는 꽃처럼, 당신은 마음을 솔직하게 전하고 새로운 일도 즐겁게 시작하는 낙천가. 그 가벼운 발걸음이 매력이지만, 가끔은 한 가지를 끝까지 마무리하는 끈기도 챙겨봐요.",
          "en": "Tulip means 'declaration of love' and 'fresh start.' Like the flower that first announces spring, you share your heart honestly and dive into new things with joy. Your light step is charming — just add some follow-through to finish what you start.",
          "ja": "チューリップの花言葉は『愛の告白』と『新しい始まり』。春を一番に告げる花のように、あなたは気持ちを素直に伝え、新しいことも楽しく始める楽天家。その軽やかさが魅力ですが、時には最後までやり遂げる粘りも。"
        },
        "grad": [
          "#FF6F91",
          "#FFA94D"
        ]
      }
    ]
  },
]

export function quickById(id: string): QuickTest | undefined {
  return QUICK_TESTS.find((q) => q.id === id)
}
