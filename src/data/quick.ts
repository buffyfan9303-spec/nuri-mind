import type { L, TestId } from './types'

/** 바이럴 짧은 검사 — 가볍고 공유각. 옵션이 결과 타입에 투표 → 최다 타입이 결과. */
export interface QuickResult {
  key: string
  emoji: string
  name: L
  tag: L // 공유용 한 줄
  desc: L
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
      { key: 'faint', emoji: '💤', name: { ko: '기절형', en: 'Insta-Sleeper', ja: '気絶型' }, tag: { ko: '눕는 순간 끝', en: 'Lights out instantly', ja: '横になれば終了' }, desc: { ko: '어디서든 빨리 잠드는 복받은 타입. 다만 너무 쉽게 골아떨어진다면 만성 수면부족 신호일 수도 있어요.', en: 'You sleep anywhere fast — lucky! But too-instant sleep can signal chronic deprivation.', ja: 'どこでも即寝の幸運型。即落ちすぎは寝不足のサインかも。' } },
      { key: 'insomnia', emoji: '🌙', name: { ko: '불면 달', en: 'Restless Moon', ja: '不眠の月' }, tag: { ko: '몸은 피곤한데 잠은 안 와', en: 'Tired but wired', ja: '疲れてるのに眠れない' }, desc: { ko: '생각이 많아 잠들기 힘든 타입. 불안·각성이 높을 수 있어요. 자기 전 화면 끄기와 호흡이 도움 됩니다.', en: 'Your busy mind blocks sleep — likely high arousal. Screen-off + breathing help.', ja: '考えが多く眠れない型。就寝前の画面オフと呼吸を。' } },
    ],
  },
]

export function quickById(id: string): QuickTest | undefined {
  return QUICK_TESTS.find((q) => q.id === id)
}
