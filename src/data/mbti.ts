import type { L } from './types'

/**
 * 16가지 성격유형 — 일반(12문항 빠른형) · 심층(24문항 척도형) 두 가지.
 *
 * ⚠️ 명칭 주의: 'MBTI®'는 The Myers-Briggs Company의 등록상표다.
 *    앱 안에서는 반드시 "16가지 성격유형"으로만 부르고, 공식 명칭·로고·문항을 쓰지 않는다.
 *    문항과 해설은 전부 자체 제작(표절 금지) — 유형론을 재미있게 탐색하는 도구로 위치시킨다.
 */

/** 4개 축 — 각 축의 [A극, B극] */
export const AXES = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['J', 'P'],
] as const

export const AXIS_LABEL: Record<string, L> = {
  E: { ko: '외향', en: 'Extravert', ja: '外向' },
  I: { ko: '내향', en: 'Introvert', ja: '内向' },
  S: { ko: '현실', en: 'Sensing', ja: '現実' },
  N: { ko: '직관', en: 'Intuition', ja: '直感' },
  T: { ko: '사고', en: 'Thinking', ja: '思考' },
  F: { ko: '감정', en: 'Feeling', ja: '感情' },
  J: { ko: '계획', en: 'Judging', ja: '計画' },
  P: { ko: '즉흥', en: 'Perceiving', ja: '柔軟' },
}

export interface MbtiType {
  key: string
  emoji: string
  grad: [string, string]
  name: L
  tag: L
  desc: L
  strengths: [L, L]
  watch: [L, L]
}

const T = (
  key: string,
  emoji: string,
  grad: [string, string],
  name: L,
  tag: L,
  desc: L,
  strengths: [L, L],
  watch: [L, L],
): MbtiType => ({ key, emoji, grad, name, tag, desc, strengths, watch })

export const MBTI_TYPES: MbtiType[] = [
  T('ISTJ', '📋', ['#5B7C99', '#8FAFC7'],
    { ko: '기록하는 성실가', en: 'The Steady Keeper', ja: '記録する堅実家' },
    { ko: '말보다 기록, 약속은 반드시', en: 'Records over talk, promises kept', ja: '言葉より記録、約束は必ず' },
    { ko: '한 번 맡은 일은 끝까지 해내는 사람이에요. 감정보다 사실과 절차를 믿고, 검증된 방식을 조용히 반복해 신뢰를 쌓습니다. 다만 예상 밖의 변수 앞에서는 마음이 먼저 굳어버리기도 해요.', en: 'You finish what you start, trusting facts and proven methods over feelings. Unexpected change can stiffen you up.', ja: '引き受けた事は最後までやり抜く人。事実と手順を信じ、想定外には固くなりがち。' },
    [{ ko: '약속과 마감을 지키는 신뢰감', en: 'Reliability with deadlines', ja: '約束と締切を守る信頼感' }, { ko: '세부를 놓치지 않는 꼼꼼함', en: 'Attention to detail', ja: '細部を逃さない緻密さ' }],
    [{ ko: '변화 앞에서 굳어지는 경직성', en: 'Rigidity when plans change', ja: '変化に固くなる硬直' }, { ko: '감정 표현을 미루다 쌓이는 것', en: 'Bottled-up feelings', ja: '感情表現の先送り' }]),
  T('ISFJ', '🧣', ['#7BA098', '#B2CFC7'],
    { ko: '챙기는 수호자', en: 'The Quiet Guardian', ja: '見守る守護者' },
    { ko: '티 안 내고 다 챙기는 사람', en: 'Cares for everyone, quietly', ja: '黙って皆を支える人' },
    { ko: '주변 사람의 필요를 먼저 알아채고 조용히 채워 주는 사람이에요. 헌신이 자연스러운 만큼 자기 몫을 챙기는 데는 서툴러, 지쳐야 비로소 티가 납니다.', en: 'You notice what others need and quietly provide it — often forgetting your own needs until you are drained.', ja: '周りの必要に先に気づき静かに満たす人。自分の分は後回しになりがち。' },
    [{ ko: '세심한 배려와 기억력', en: 'Thoughtful care and memory', ja: '細やかな配慮と記憶力' }, { ko: '조용한 책임감', en: 'Quiet responsibility', ja: '静かな責任感' }],
    [{ ko: '거절을 어려워해 떠안는 것', en: 'Trouble saying no', ja: '断れず抱え込む' }, { ko: '자기 필요를 뒤로 미루는 습관', en: 'Deferring your own needs', ja: '自分の必要を後回し' }]),
  T('INFJ', '🕯️', ['#7B6BB0', '#B0A3E0'],
    { ko: '길을 보는 상담자', en: 'The Insightful Guide', ja: '道を見る相談者' },
    { ko: '말 안 해도 다 읽히는 사람', en: 'Reads what goes unsaid', ja: '言わなくても読み取る人' },
    { ko: '사람의 속마음과 흐름을 읽어 방향을 제시하는 사람이에요. 이상이 높아 현실과의 간격에서 자주 지치고, 속을 다 보여주지 않아 오해를 사기도 합니다.', en: 'You read people and point to a direction. High ideals can tire you against reality.', ja: '人の内面と流れを読み方向を示す人。理想と現実の差に疲れやすい。' },
    [{ ko: '사람의 맥락을 읽는 통찰', en: 'Insight into people', ja: '人の文脈を読む洞察' }, { ko: '가치에 대한 흔들림 없는 기준', en: 'Firm values', ja: '価値への揺るがぬ基準' }],
    [{ ko: '이상과 현실 간극에서 오는 소진', en: 'Burnout from high ideals', ja: '理想と現実の消耗' }, { ko: '속내를 늦게 꺼내 생기는 오해', en: 'Withholding until misread', ja: '本音を出さず誤解される' }]),
  T('INTJ', '♟️', ['#4F5D8C', '#8A97C7'],
    { ko: '설계하는 전략가', en: 'The Architect', ja: '設計する戦略家' },
    { ko: '이미 3수 앞을 계산 중', en: 'Already three moves ahead', ja: 'すでに3手先を計算中' },
    { ko: '목표에서 거꾸로 계산해 구조를 짜는 사람이에요. 비효율을 견디지 못해 직설적이 되고, 그 과정에서 사람의 감정을 뒤늦게 챙기게 됩니다.', en: 'You reverse-engineer from the goal. Intolerance for inefficiency can read as bluntness.', ja: '目標から逆算して構造を組む人。非効率に耐えられず直言になりがち。' },
    [{ ko: '큰 그림과 우선순위 설계', en: 'Big-picture design', ja: '全体像と優先順位の設計' }, { ko: '독립적으로 밀고 가는 힘', en: 'Independent drive', ja: '独立して進める力' }],
    [{ ko: '사람의 감정을 후순위로 두는 것', en: 'Deprioritizing feelings', ja: '感情を後回しにする' }, { ko: '완벽한 계획 전엔 시작을 미루는 것', en: 'Waiting for the perfect plan', ja: '完璧な計画まで着手しない' }]),
  T('ISTP', '🔧', ['#5E7D6E', '#9CBFAE'],
    { ko: '손이 먼저인 해결사', en: 'The Hands-On Fixer', ja: '手が先に動く解決者' },
    { ko: '설명보다 일단 뜯어본다', en: 'Takes it apart, then explains', ja: '説明より先に分解する' },
    { ko: '말로 따지기 전에 직접 만져 보고 이해하는 사람이에요. 위기에 침착하지만, 관심이 식으면 급격히 손을 놓기도 합니다.', en: 'You understand by doing, calm in a crisis — but drop things fast when interest fades.', ja: '手で触って理解する人。危機に冷静だが興味が冷めると手を離す。' },
    [{ ko: '위기 상황의 침착한 실행', en: 'Calm execution under pressure', ja: '危機での冷静な実行' }, { ko: '몸으로 익히는 학습 속도', en: 'Fast hands-on learning', ja: '体で覚える学習速度' }],
    [{ ko: '흥미가 식으면 급히 놓는 것', en: 'Dropping things when bored', ja: '興味が冷めると放棄' }, { ko: '장기 계획을 미루는 성향', en: 'Avoiding long-term plans', ja: '長期計画の先送り' }]),
  T('ISFP', '🎨', ['#C77B93', '#EAB0C0'],
    { ko: '느끼는 예술가', en: 'The Gentle Artist', ja: '感じる芸術家' },
    { ko: '설명 대신 분위기로 말한다', en: 'Speaks in mood, not words', ja: '説明より雰囲気で語る' },
    { ko: '지금 이 순간의 감각과 아름다움에 예민한 사람이에요. 다툼을 피하려 물러서다 정작 자기 의견을 잃기도 합니다.', en: 'Attuned to beauty in the moment; may retreat from conflict until your own view disappears.', ja: '今この瞬間の感覚に敏感。衝突を避けて自分の意見を失いがち。' },
    [{ ko: '섬세한 감각과 표현력', en: 'Refined sensitivity', ja: '繊細な感覚と表現力' }, { ko: '있는 그대로 받아들이는 태도', en: 'Accepting presence', ja: 'ありのままを受け入れる姿勢' }],
    [{ ko: '갈등 회피로 의견을 삼키는 것', en: 'Swallowing opinions', ja: '衝突回避で意見を飲む' }, { ko: '장기 목표보다 지금에 머무는 것', en: 'Staying in the present', ja: '長期目標より今に留まる' }]),
  T('INFP', '🌙', ['#8E7BC7', '#BFB0E8'],
    { ko: '의미를 찾는 몽상가', en: 'The Meaning Seeker', ja: '意味を探す夢想家' },
    { ko: '왜 하는지가 먼저인 사람', en: 'Needs the why first', ja: 'なぜやるかが先の人' },
    { ko: '가치와 진심이 맞아야 움직이는 사람이에요. 마음속 기준이 높아 스스로를 자주 몰아붙이고, 현실 과제 앞에서 미루기 쉽습니다.', en: 'You move only when it matches your values — and can be your own harshest critic.', ja: '価値と本心が合って初めて動く人。自分を追い込みやすい。' },
    [{ ko: '깊은 공감과 진정성', en: 'Deep empathy', ja: '深い共感と真摯さ' }, { ko: '상상력과 표현의 풍부함', en: 'Rich imagination', ja: '豊かな想像力' }],
    [{ ko: '자기 비판이 과해지는 것', en: 'Harsh self-criticism', ja: '過度な自己批判' }, { ko: '현실 과제 앞의 미루기', en: 'Procrastinating on practicalities', ja: '現実課題の先送り' }]),
  T('INTP', '🔬', ['#5A7A99', '#9BB8CF'],
    { ko: '파고드는 사색가', en: 'The Deep Thinker', ja: '掘り下げる思索家' },
    { ko: '"근데 왜?"가 입버릇', en: '"But why?" on repeat', ja: '口ぐせは「でもなぜ？」' },
    { ko: '원리를 이해할 때까지 파고드는 사람이에요. 생각은 멀리 가지만, 마무리와 실행에서 힘이 빠지곤 합니다.', en: 'You dig until the principle clicks — though finishing can lose its pull.', ja: '原理を理解するまで掘る人。仕上げと実行で力が抜けがち。' },
    [{ ko: '본질을 파고드는 분석력', en: 'Analytical depth', ja: '本質を掘る分析力' }, { ko: '고정관념 없는 사고', en: 'Unbiased thinking', ja: '固定観念のない思考' }],
    [{ ko: '실행·마무리에서 흐려지는 것', en: 'Fading at execution', ja: '実行・仕上げで曖昧に' }, { ko: '감정 대화를 논리로 받는 것', en: 'Answering feelings with logic', ja: '感情に論理で返す' }]),
  T('ESTP', '🏍️', ['#E08A3C', '#F5B877'],
    { ko: '뛰어드는 승부사', en: 'The Bold Mover', ja: '飛び込む勝負師' },
    { ko: '고민할 시간에 일단 해본다', en: 'Acts while others deliberate', ja: '悩む間にまずやる' },
    { ko: '지금 눈앞의 기회를 놓치지 않는 사람이에요. 순발력이 무기지만, 뒷일을 덜 계산해 수습이 필요해지기도 합니다.', en: 'You seize the moment — quick, though the cleanup can follow.', ja: '目の前の機会を逃さない人。後始末が必要になることも。' },
    [{ ko: '현장 대응력과 담대함', en: 'Boldness on the spot', ja: '現場対応力と大胆さ' }, { ko: '사람을 끌어들이는 에너지', en: 'Magnetic energy', ja: '人を巻き込むエネルギー' }],
    [{ ko: '결과를 덜 계산하는 즉흥성', en: 'Under-calculating consequences', ja: '結果を計算しない即興' }, { ko: '반복되는 일에 대한 지루함', en: 'Boredom with routine', ja: '反復への退屈' }]),
  T('ESFP', '🎤', ['#E8617C', '#FF9BAE'],
    { ko: '분위기를 켜는 사람', en: 'The Spotlight', ja: '空気を灯す人' },
    { ko: '있으면 자리가 밝아진다', en: 'Lights up the room', ja: 'いると場が明るくなる' },
    { ko: '사람과 순간을 즐겁게 만드는 재능이 있는 사람이에요. 좋은 기분을 지키려 불편한 이야기를 미루기도 합니다.', en: 'You make moments fun — sometimes at the cost of postponing hard talks.', ja: '人と瞬間を楽しくする才能。難しい話は後回しにしがち。' },
    [{ ko: '현장을 밝히는 친화력', en: 'Warm sociability', ja: '場を明るくする親和力' }, { ko: '지금을 즐길 줄 아는 힘', en: 'Ability to enjoy now', ja: '今を楽しむ力' }],
    [{ ko: '불편한 대화를 미루는 것', en: 'Avoiding hard conversations', ja: '不快な話の先送り' }, { ko: '장기 계획이 흐려지는 것', en: 'Losing long-term focus', ja: '長期計画が曖昧に' }]),
  T('ENFP', '🎈', ['#F2704B', '#FFA98C'],
    { ko: '불붙는 아이디어뱅크', en: 'The Spark', ja: '火がつく発想家' },
    { ko: '새로운 가능성에 늘 설레는 중', en: 'Always lit by a new idea', ja: '新しい可能性にいつも高揚' },
    { ko: '가능성을 발견하면 온몸이 켜지는 사람이에요. 시작은 눈부시지만, 흥미가 옮겨가며 벌여둔 일이 쌓이기 쉽습니다.', en: 'Possibility lights you up — starting is easy, finishing is the work.', ja: '可能性を見つけると全身が灯る人。始めるのは得意、仕上げが課題。' },
    [{ ko: '사람과 아이디어를 잇는 힘', en: 'Connecting people and ideas', ja: '人とアイデアを繋ぐ力' }, { ko: '전염되는 열정', en: 'Contagious enthusiasm', ja: '伝染する情熱' }],
    [{ ko: '벌여둔 일이 쌓이는 것', en: 'Too many open loops', ja: '広げた事が溜まる' }, { ko: '지루한 마무리 구간의 이탈', en: 'Dropping off at the dull end', ja: '退屈な仕上げで離脱' }]),
  T('ENTP', '⚡', ['#D9603F', '#F59A7C'],
    { ko: '논쟁하는 혁신가', en: 'The Challenger', ja: '議論する革新家' },
    { ko: '"반대로 하면 어떨까?"', en: '"What if we flip it?"', ja: '「逆にしたら？」' },
    { ko: '당연한 전제를 뒤집어보며 길을 찾는 사람이에요. 토론이 즐거운 만큼, 상대가 공격으로 느끼지 않게 하는 게 과제입니다.', en: 'You find paths by flipping assumptions — the trick is not sounding like an attack.', ja: '前提を覆して道を探す人。攻撃に聞こえない配慮が課題。' },
    [{ ko: '전제를 흔드는 창의성', en: 'Assumption-breaking creativity', ja: '前提を揺らす創造性' }, { ko: '빠른 상황 재구성', en: 'Fast reframing', ja: '素早い再構成' }],
    [{ ko: '토론이 상대에겐 공격이 되는 것', en: 'Debate landing as attack', ja: '議論が攻撃に映る' }, { ko: '벌인 일의 마무리 부족', en: 'Weak follow-through', ja: '仕上げ不足' }]),
  T('ESTJ', '🧭', ['#C08A2E', '#E8BC6A'],
    { ko: '굴리는 관리자', en: 'The Organizer', ja: '回す管理者' },
    { ko: '되게 만드는 사람', en: 'Gets it done', ja: '実現させる人' },
    { ko: '흩어진 일을 구조로 만들어 굴리는 사람이에요. 기준이 분명한 만큼, 다른 방식을 틀렸다고 보기 쉬운 게 함정입니다.', en: 'You turn scattered work into a system — just careful not to call other ways wrong.', ja: '散らばった仕事を構造にして回す人。他のやり方を否定しがち。' },
    [{ ko: '실행을 조직하는 추진력', en: 'Organizing drive', ja: '実行を組織する推進力' }, { ko: '명확한 기준과 책임', en: 'Clear standards', ja: '明確な基準と責任' }],
    [{ ko: '다른 방식을 틀렸다고 보는 것', en: 'Judging other approaches', ja: '他の方式を否定' }, { ko: '속도 때문에 놓치는 감정', en: 'Missing feelings for speed', ja: '速度優先で感情を見落とす' }]),
  T('ESFJ', '🍲', ['#D98A6A', '#F3B79C'],
    { ko: '이어주는 살림꾼', en: 'The Connector', ja: '繋ぐ世話役' },
    { ko: '모임이 굴러가는 진짜 이유', en: 'Why the group actually works', ja: '集まりが回る本当の理由' },
    { ko: '사람 사이의 온도를 맞추고 자리를 굴러가게 만드는 사람이에요. 인정과 조화를 중시해 거절과 갈등이 특히 무겁습니다.', en: 'You keep the group warm and running — which makes conflict feel heavy.', ja: '人の間の温度を整え場を回す人。対立が特に重い。' },
    [{ ko: '관계를 굴러가게 하는 조율', en: 'Coordinating relationships', ja: '関係を回す調整' }, { ko: '실질적인 돌봄', en: 'Practical care', ja: '実質的なケア' }],
    [{ ko: '인정에 기대어 소진되는 것', en: 'Burnout chasing approval', ja: '承認依存で消耗' }, { ko: '갈등을 덮어두는 것', en: 'Papering over conflict', ja: '対立を覆い隠す' }]),
  T('ENFJ', '🔥', ['#E0705A', '#F7A48F'],
    { ko: '이끄는 멘토', en: 'The Mentor', ja: '導くメンター' },
    { ko: '사람의 가능성을 먼저 본다', en: 'Sees your potential first', ja: '人の可能性を先に見る' },
    { ko: '사람을 북돋아 함께 나아가게 만드는 사람이에요. 남을 살피느라 정작 자기 상태는 늦게 알아차립니다.', en: 'You lift people forward — often noticing your own state last.', ja: '人を励まし共に進ませる人。自分の状態に気づくのが遅い。' },
    [{ ko: '사람을 성장시키는 영향력', en: 'Growing others', ja: '人を成長させる影響力' }, { ko: '방향을 설득하는 언어', en: 'Persuasive vision', ja: '方向を説く言葉' }],
    [{ ko: '자기 소진을 늦게 알아채는 것', en: 'Late to notice burnout', ja: '自分の消耗に気づかない' }, { ko: '기대가 부담이 되는 것', en: 'Expectations as pressure', ja: '期待が重荷になる' }]),
  T('ENTJ', '👑', ['#B85C38', '#E39270'],
    { ko: '밀어붙이는 지휘관', en: 'The Commander', ja: '押し進める指揮官' },
    { ko: '목표가 서면 길은 만든다', en: 'Sets the goal, makes the path', ja: '目標が立てば道は作る' },
    { ko: '목표를 세우고 사람과 자원을 모아 밀고 가는 사람이에요. 속도가 빠른 만큼 주변이 숨 가빠하는지 살피는 게 과제입니다.', en: 'You set the goal and marshal everything toward it — just check who is out of breath.', ja: '目標を立て人と資源を集めて進む人。周囲の息切れに注意。' },
    [{ ko: '목표를 현실로 만드는 추진력', en: 'Turning goals real', ja: '目標を現実にする推進力' }, { ko: '결정을 내리는 담대함', en: 'Decisiveness', ja: '決断する胆力' }],
    [{ ko: '속도로 사람을 지치게 하는 것', en: 'Exhausting others with pace', ja: '速度で人を疲れさせる' }, { ko: '통제하려는 힘이 세지는 것', en: 'Over-controlling', ja: '統制欲が強まる' }]),
]

export const mbtiByKey = (key: string): MbtiType | undefined => MBTI_TYPES.find((t) => t.key === key)

/* ── 일반검사(12문항) — 양자택일, 축당 3문항 ── */
export interface MbtiQuickQ {
  text: L
  options: { text: L; to: string }[]
}

export const MBTI_QUICK: MbtiQuickQ[] = [
  { text: { ko: '주말에 에너지가 채워지는 쪽은?', en: 'Weekends recharge you when…', ja: '週末に充電されるのは？' },
    options: [{ text: { ko: '사람들과 어울릴 때', en: 'Out with people', ja: '人と過ごす' }, to: 'E' }, { text: { ko: '혼자 조용히 있을 때', en: 'Quiet time alone', ja: '一人で静かに' }, to: 'I' }] },
  { text: { ko: '처음 만난 자리에서 나는?', en: 'In a room of strangers you…', ja: '初対面の場では？' },
    options: [{ text: { ko: '먼저 말을 건다', en: 'Start conversations', ja: '先に話しかける' }, to: 'E' }, { text: { ko: '지켜보다 천천히', en: 'Watch first', ja: '様子を見てから' }, to: 'I' }] },
  { text: { ko: '고민이 생기면?', en: 'When something bothers you…', ja: '悩みができたら？' },
    options: [{ text: { ko: '말하면서 정리된다', en: 'Talking sorts it out', ja: '話すと整理される' }, to: 'E' }, { text: { ko: '혼자 삭이며 정리한다', en: 'Thinking alone sorts it', ja: '一人で整理する' }, to: 'I' }] },
  { text: { ko: '새 일을 맡으면 먼저 보는 건?', en: 'Starting new work, you look at…', ja: '新しい仕事でまず見るのは？' },
    options: [{ text: { ko: '구체적인 절차와 사실', en: 'Concrete steps and facts', ja: '具体的な手順と事実' }, to: 'S' }, { text: { ko: '전체 그림과 가능성', en: 'The big picture', ja: '全体像と可能性' }, to: 'N' }] },
  { text: { ko: '설명을 들을 때 편한 쪽은?', en: 'Explanations land better as…', ja: '説明を聞くとき楽なのは？' },
    options: [{ text: { ko: '예시와 경험', en: 'Examples and experience', ja: '例と経験' }, to: 'S' }, { text: { ko: '개념과 비유', en: 'Concepts and metaphor', ja: '概念と比喩' }, to: 'N' }] },
  { text: { ko: '여행 계획을 짤 때?', en: 'Planning a trip you…', ja: '旅行の計画では？' },
    options: [{ text: { ko: '검증된 코스를 확인', en: 'Check proven routes', ja: '定番コースを確認' }, to: 'S' }, { text: { ko: '안 가본 곳을 상상', en: 'Imagine the unknown', ja: '未知の場所を想像' }, to: 'N' }] },
  { text: { ko: '친구가 실수로 힘들어할 때?', en: 'A friend messed up and is upset…', ja: '友達がミスで落ち込む時？' },
    options: [{ text: { ko: '원인과 해결책을 짚어준다', en: 'Point to cause and fix', ja: '原因と解決を示す' }, to: 'T' }, { text: { ko: '먼저 마음을 알아준다', en: 'Acknowledge the feeling', ja: 'まず気持ちを受け止める' }, to: 'F' }] },
  { text: { ko: '결정할 때 더 무거운 것은?', en: 'Decisions weigh more on…', ja: '決める時に重いのは？' },
    options: [{ text: { ko: '무엇이 맞는가', en: 'What is correct', ja: '何が正しいか' }, to: 'T' }, { text: { ko: '누가 상처받는가', en: 'Who gets hurt', ja: '誰が傷つくか' }, to: 'F' }] },
  { text: { ko: '피드백을 줄 때 나는?', en: 'Giving feedback you…', ja: 'フィードバックでは？' },
    options: [{ text: { ko: '솔직하게 정확히', en: 'Direct and accurate', ja: '率直で正確に' }, to: 'T' }, { text: { ko: '기분 상하지 않게', en: 'Gently, kindly', ja: '傷つけないように' }, to: 'F' }] },
  { text: { ko: '내 하루는?', en: 'Your day usually is…', ja: '私の一日は？' },
    options: [{ text: { ko: '계획대로 굴러간다', en: 'Runs on a plan', ja: '計画通りに進む' }, to: 'J' }, { text: { ko: '그때그때 흘러간다', en: 'Flows as it goes', ja: 'その時々で流れる' }, to: 'P' }] },
  { text: { ko: '마감이 있는 일은?', en: 'With a deadline you…', ja: '締切のある仕事は？' },
    options: [{ text: { ko: '미리 끝내야 편하다', en: 'Finish early to relax', ja: '早めに終えたい' }, to: 'J' }, { text: { ko: '임박해야 집중된다', en: 'Focus near the wire', ja: '直前に集中する' }, to: 'P' }] },
  { text: { ko: '약속이 갑자기 바뀌면?', en: 'Plans change suddenly…', ja: '予定が急に変わったら？' },
    options: [{ text: { ko: '불편하고 다시 정리한다', en: 'Unsettling — regroup', ja: '落ち着かず立て直す' }, to: 'J' }, { text: { ko: '오히려 재밌다', en: 'Kind of fun', ja: 'むしろ面白い' }, to: 'P' }] },
]

/* ── 심층검사(24문항) — 5점 척도, 축당 6문항(극당 3:3 균형).
      ⚠️ 극별 문항 수가 다르면 모순 응답(양쪽 모두 '매우 그렇다') 시 문항이 많은 극으로
         기울어지는 체계적 편향이 생긴다 — 반드시 3:3을 유지할 것. ── */
export interface MbtiDeepItem {
  text: L
  /** 이 문항에 '그렇다'일수록 가까워지는 극 */
  pole: string
}

const D = (pole: string, ko: string, en: string, ja: string): MbtiDeepItem => ({ pole, text: { ko, en, ja } })

export const MBTI_DEEP: MbtiDeepItem[] = [
  // E/I
  D('E', '여러 사람과 이야기하고 나면 기운이 난다', 'Talking with many people energizes me', '大勢と話すと元気が出る'),
  D('E', '조용한 자리에서도 내가 먼저 말을 꺼내는 편이다', 'I tend to break the silence first', '静かな場でも先に話し出す'),
  D('E', '생각은 말로 꺼내야 정리된다', 'I think best out loud', '考えは口に出すと整理される'),
  D('I', '사람이 많은 자리는 즐거워도 진이 빠진다', 'Crowds drain me even when fun', '人が多い場は楽しくても消耗する'),
  D('I', '혼자 있는 시간이 반드시 필요하다', 'I truly need alone time', '一人の時間が必ず要る'),
  D('I', '깊은 대화 한 명이 얕은 대화 열 명보다 좋다', 'One deep talk beats ten shallow ones', '深い会話一人の方がいい'),
  // S/N
  D('S', '경험해 본 방식이 가장 믿음직하다', 'Proven methods feel safest', '経験した方法が一番信頼できる'),
  D('S', '세부 사항이 눈에 잘 들어온다', 'I notice details easily', '細部がよく目に入る'),
  D('S', '추상적인 이야기보다 구체적인 예시가 좋다', 'I prefer concrete examples', '抽象より具体例が好き'),
  D('N', '아직 없는 가능성을 상상하는 게 즐겁다', 'I enjoy imagining what could be', 'まだない可能性の想像が楽しい'),
  D('N', '사실보다 그 뒤의 의미가 궁금하다', 'I chase the meaning behind facts', '事実の裏の意味が気になる'),
  D('N', '여러 아이디어가 동시에 떠오른다', 'Ideas arrive in bunches', 'アイデアが同時に浮かぶ'),
  // T/F
  D('T', '결정할 때 감정보다 근거를 앞세운다', 'Evidence outranks feelings in decisions', '決断では感情より根拠'),
  D('T', '틀린 것은 분명히 짚는 편이다', 'I point out what is wrong', '間違いははっきり指摘する'),
  D('T', '공정함이 배려보다 중요할 때가 많다', 'Fairness often beats accommodation', '公平さが配慮より大事な事が多い'),
  D('F', '누군가 속상해하면 내 마음도 흔들린다', "Others' upset moves me", '誰かが傷つくと自分も揺れる'),
  D('F', '옳은 말도 상대 기분을 봐서 꺼낸다', 'I time hard truths to their mood', '正論も相手の気分を見て言う'),
  D('F', '분위기가 나빠지는 게 결론보다 신경 쓰인다', 'A sour mood worries me more than the verdict', '空気の悪化が結論より気になる'),
  // J/P
  D('J', '할 일을 목록으로 만들어 두면 마음이 편하다', 'A to-do list calms me', 'やる事を書き出すと安心する'),
  D('J', '결정을 미뤄두는 상태가 불편하다', 'Open decisions make me uneasy', '未決の状態が落ち着かない'),
  D('J', '일정은 미리 정해져 있어야 좋다', 'I like schedules set in advance', '予定は前もって決まっている方がいい'),
  D('P', '상황에 따라 바꾸는 게 더 효율적이다', 'Adapting on the fly works better', '状況で変える方が効率的'),
  D('P', '마감이 다가와야 집중이 붙는다', 'I focus as the deadline nears', '締切が近づくと集中する'),
  D('P', '계획보다 즉흥이 즐겁다', 'Spontaneity beats planning', '計画より即興が楽しい'),
]

/** 축별 점수(0~100, 값이 클수록 첫 번째 극) → 유형 키 */
export function typeFromAxes(pct: Record<string, number>): string {
  return AXES.map(([a, b]) => ((pct[a] ?? 50) >= 50 ? a : b)).join('')
}
