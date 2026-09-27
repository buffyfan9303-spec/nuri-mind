import type { L } from './types'

/**
 * 별자리 운세 콘텐츠 — 서양 점성술 12궁(열대 황도, 통용 날짜 경계).
 * 문구는 전부 자체 작성(재미용). 성격 소개는 통설을 가볍게 요약한 것이며 과학적 사실이 아니다.
 * 날짜 경계는 해마다 하루 정도 움직일 수 있어 흔히 쓰는 경계를 고정해 쓴다.
 */

export type StarElement = 'fire' | 'earth' | 'air' | 'water'

export interface StarSign {
  id: string
  /** 별자리 기호 — 글자(텍스트 표시)로 그린다 */
  sym: string
  name: L
  /** 시작일 MMDD */
  from: number
  range: L
  element: StarElement
  trait: L
  /** 배지·히어로 색 */
  color: string
}

export const ELEMENT_NAME: Record<StarElement, L> = {
  fire: { ko: '불', en: 'Fire', ja: '火' },
  earth: { ko: '흙', en: 'Earth', ja: '地' },
  air: { ko: '공기', en: 'Air', ja: '風' },
  water: { ko: '물', en: 'Water', ja: '水' },
}

/** 전통적으로 잘 맞는다고 보는 원소(같은 원소 + 불↔공기, 흙↔물) */
export const ELEMENT_MATCH: Record<StarElement, StarElement[]> = {
  fire: ['fire', 'air'],
  air: ['air', 'fire'],
  earth: ['earth', 'water'],
  water: ['water', 'earth'],
}

export const ELEMENT_GRAD: Record<StarElement, [string, string]> = {
  fire: ['#F2664B', '#FFA26B'],
  earth: ['#3E8E63', '#8CC98A'],
  air: ['#4A7BE0', '#8FB6FF'],
  water: ['#5B4FC4', '#9C8CF5'],
}

export const STAR_SIGNS: StarSign[] = [
  { id: 'aries', sym: '♈', from: 321, element: 'fire', color: '#F2664B',
    name: { ko: '양자리', en: 'Aries', ja: '牡羊座' },
    range: { ko: '3.21 ~ 4.19', en: 'Mar 21 – Apr 19', ja: '3/21〜4/19' },
    trait: { ko: '먼저 움직이는 개척자형. 결심이 빠르고 솔직해서 주변에 활기를 불어넣는다고 알려져 있어요.', en: 'The trailblazer who moves first. Quick to decide and refreshingly direct, said to bring energy wherever they go.', ja: '真っ先に動く開拓者タイプ。決断が早く率直で、周りに活気をもたらすと言われます。' } },
  { id: 'taurus', sym: '♉', from: 420, element: 'earth', color: '#3E8E63',
    name: { ko: '황소자리', en: 'Taurus', ja: '牡牛座' },
    range: { ko: '4.20 ~ 5.20', en: 'Apr 20 – May 20', ja: '4/20〜5/20' },
    trait: { ko: '느긋하지만 꾸준한 안정형. 좋은 음식·음악처럼 오감의 즐거움을 아는 사람으로 통해요.', en: 'Unhurried but steady. Known for appreciating the good things — food, music, comfort — with all five senses.', ja: 'のんびりでも着実な安定タイプ。美味しい食事や音楽など五感の楽しみを知る人とされます。' } },
  { id: 'gemini', sym: '♊', from: 521, element: 'air', color: '#E0A526',
    name: { ko: '쌍둥이자리', en: 'Gemini', ja: '双子座' },
    range: { ko: '5.21 ~ 6.21', en: 'May 21 – Jun 21', ja: '5/21〜6/21' },
    trait: { ko: '호기심 많은 이야기꾼. 머리 회전이 빠르고 대화로 사람을 즐겁게 만든다고 해요.', en: 'The curious storyteller. Quick-witted and fun to talk to, always chasing the next interesting idea.', ja: '好奇心旺盛な話し上手。頭の回転が速く、会話で人を楽しませると言われます。' } },
  { id: 'cancer', sym: '♋', from: 622, element: 'water', color: '#5B8FD9',
    name: { ko: '게자리', en: 'Cancer', ja: '蟹座' },
    range: { ko: '6.22 ~ 7.22', en: 'Jun 22 – Jul 22', ja: '6/22〜7/22' },
    trait: { ko: '다정한 보호자형. 내 사람을 챙기는 마음이 깊고, 분위기를 섬세하게 읽는 편이에요.', en: 'The caring protector. Deeply loyal to their people and sensitive to the mood of a room.', ja: '優しい守り手タイプ。身内を大切にし、場の空気を繊細に読むと言われます。' } },
  { id: 'leo', sym: '♌', from: 723, element: 'fire', color: '#F29A1F',
    name: { ko: '사자자리', en: 'Leo', ja: '獅子座' },
    range: { ko: '7.23 ~ 8.22', en: 'Jul 23 – Aug 22', ja: '7/23〜8/22' },
    trait: { ko: '무대가 어울리는 주인공형. 너그럽고 당당해서 자연스럽게 사람들이 모인다고 해요.', en: 'Born for the spotlight. Generous and confident, the kind of person others naturally gather around.', ja: '舞台が似合う主人公タイプ。おおらかで堂々としていて、自然と人が集まると言われます。' } },
  { id: 'virgo', sym: '♍', from: 823, element: 'earth', color: '#6FA35A',
    name: { ko: '처녀자리', en: 'Virgo', ja: '乙女座' },
    range: { ko: '8.23 ~ 9.22', en: 'Aug 23 – Sep 22', ja: '8/23〜9/22' },
    trait: { ko: '꼼꼼한 정리 달인. 작은 차이를 알아보는 눈이 있고 누군가를 돕는 데서 보람을 느껴요.', en: 'The detail-minded organizer. Notices small things others miss and finds meaning in being helpful.', ja: '几帳面な整理上手。小さな違いに気づき、人の役に立つことにやりがいを感じるタイプ。' } },
  { id: 'libra', sym: '♎', from: 923, element: 'air', color: '#D46FA8',
    name: { ko: '천칭자리', en: 'Libra', ja: '天秤座' },
    range: { ko: '9.23 ~ 10.23', en: 'Sep 23 – Oct 23', ja: '9/23〜10/23' },
    trait: { ko: '균형을 찾는 조율가. 공정함과 아름다움을 중요하게 여기고, 관계를 부드럽게 이어 줘요.', en: 'The balancer. Values fairness and beauty, and has a gift for keeping relationships smooth.', ja: 'バランスを取る調整役。公平さと美しさを大切にし、人間関係を円滑にします。' } },
  { id: 'scorpio', sym: '♏', from: 1024, element: 'water', color: '#8A3FB8',
    name: { ko: '전갈자리', en: 'Scorpio', ja: '蠍座' },
    range: { ko: '10.24 ~ 11.22', en: 'Oct 24 – Nov 22', ja: '10/24〜11/22' },
    trait: { ko: '깊이 파고드는 몰입형. 한번 마음을 주면 오래가고, 겉보다 속을 보는 통찰이 있다고 해요.', en: 'The deep diver. Intensely loyal once they trust you, with a knack for seeing beneath the surface.', ja: '深く掘り下げる没頭タイプ。一度心を許すと長く続き、本質を見抜く洞察力があると言われます。' } },
  { id: 'sagittarius', sym: '♐', from: 1123, element: 'fire', color: '#E0673A',
    name: { ko: '사수자리', en: 'Sagittarius', ja: '射手座' },
    range: { ko: '11.23 ~ 12.21', en: 'Nov 23 – Dec 21', ja: '11/23〜12/21' },
    trait: { ko: '자유로운 모험가. 새로운 곳과 배움을 좋아하고 낙천적인 에너지가 매력이에요.', en: 'The free-spirited adventurer. Loves new places and new ideas, with an optimism that is hard to resist.', ja: '自由な冒険家。新しい場所や学びが好きで、楽天的なエネルギーが魅力です。' } },
  { id: 'capricorn', sym: '♑', from: 1222, element: 'earth', color: '#5E6B7A',
    name: { ko: '염소자리', en: 'Capricorn', ja: '山羊座' },
    range: { ko: '12.22 ~ 1.19', en: 'Dec 22 – Jan 19', ja: '12/22〜1/19' },
    trait: { ko: '차근차근 오르는 등반가. 책임감이 강하고 긴 목표를 끝까지 밀고 가는 힘이 있어요.', en: 'The patient climber. Responsible and determined, able to carry long-term goals all the way through.', ja: 'コツコツ登る登山家。責任感が強く、長期の目標を最後までやり遂げる力があります。' } },
  { id: 'aquarius', sym: '♒', from: 120, element: 'air', color: '#3AA7C9',
    name: { ko: '물병자리', en: 'Aquarius', ja: '水瓶座' },
    range: { ko: '1.20 ~ 2.18', en: 'Jan 20 – Feb 18', ja: '1/20〜2/18' },
    trait: { ko: '독창적인 아이디어 뱅크. 남다른 시선과 따뜻한 공동체 감각을 함께 가졌다고 해요.', en: 'The original thinker. An unusual point of view paired with a genuine care for the wider community.', ja: '独創的なアイデアマン。人と違う視点と、仲間を思う温かさを併せ持つと言われます。' } },
  { id: 'pisces', sym: '♓', from: 219, element: 'water', color: '#4F9E9A',
    name: { ko: '물고기자리', en: 'Pisces', ja: '魚座' },
    range: { ko: '2.19 ~ 3.20', en: 'Feb 19 – Mar 20', ja: '2/19〜3/20' },
    trait: { ko: '상상력이 풍부한 몽상가. 공감 능력이 뛰어나고 예술적인 감수성이 돋보여요.', en: 'The imaginative dreamer. Deeply empathetic, with a strong artistic sensitivity.', ja: '想像力豊かな夢想家。共感力が高く、芸術的な感性が光ります。' } },
]

/** 오늘의 한 줄 — (별자리, 날짜)로 하나 고른다 */
export const STAR_TODAY: L[] = [
  { ko: '미뤄 둔 연락 하나가 뜻밖의 반가운 소식으로 돌아오는 날이에요.', en: 'That message you have been putting off could bring back a pleasant surprise today.', ja: '後回しにしていた連絡が、思わぬ嬉しい知らせになって返ってくる日。' },
  { ko: '작은 친절이 크게 기억되는 날. 먼저 건넨 인사가 분위기를 바꿔요.', en: 'Small kindnesses leave a big mark today. Saying hello first changes the mood.', ja: '小さな親切が大きく残る日。先にかけた挨拶が空気を変えます。' },
  { ko: '생각이 많아지기 쉬운 날이에요. 할 일을 세 개만 적고 하나씩 지워 보세요.', en: 'Your mind may feel busy. Write down just three tasks and cross them off one by one.', ja: '考えごとが増えがちな日。やることを3つだけ書いて一つずつ消してみて。' },
  { ko: '감이 좋은 날. 처음 떠오른 아이디어를 메모해 두면 쓸모가 생겨요.', en: 'Your instincts are sharp today. Jot down your first idea — it will come in handy.', ja: '勘が冴える日。最初に浮かんだアイデアをメモしておくと役立ちます。' },
  { ko: '서두르지 않아도 되는 날이에요. 천천히 해도 결과는 충분히 좋아요.', en: 'No need to rush today. Taking it slow still gets you a good result.', ja: '急がなくていい日。ゆっくりでも結果は十分に良いものに。' },
  { ko: '새로운 걸 한 가지 시도해 보기 좋은 날. 가 본 적 없는 길로 돌아가 보세요.', en: 'A good day to try one new thing. Take a route you have never taken.', ja: '新しいことを一つ試すのに良い日。行ったことのない道で帰ってみて。' },
  { ko: '말보다 듣는 쪽이 이득인 날. 상대의 한마디에 힌트가 숨어 있어요.', en: 'Listening pays off more than talking today. There is a hint in what someone says.', ja: '話すより聞く方が得な日。相手の一言にヒントが隠れています。' },
  { ko: '정리하는 만큼 마음이 가벼워지는 날. 책상 한 칸만 비워 봐도 달라요.', en: 'Tidying up lightens your mind today. Even clearing one corner of your desk helps.', ja: '片付けた分だけ心が軽くなる日。机の一角を空けるだけでも違います。' },
  { ko: '웃을 일이 슬쩍 찾아오는 날. 오늘은 농담에 조금 더 너그러워져도 좋아요.', en: 'Something funny sneaks into your day. Be a little more generous with the jokes.', ja: '笑えることがふと訪れる日。今日は冗談に少し寛大になってもいいかも。' },
  { ko: '배움운이 좋은 날. 궁금했던 걸 10분만 찾아봐도 오래 남아요.', en: 'A good day for learning. Ten minutes on something you were curious about will stick.', ja: '学びの運が良い日。気になっていたことを10分調べるだけでも身につきます。' },
  { ko: '혼자만의 시간이 힘이 되는 날. 좋아하는 노래 한 곡으로 충전해 보세요.', en: 'Time alone recharges you today. One favorite song can be enough.', ja: '一人の時間が力になる日。好きな曲を一曲聴いて充電を。' },
  { ko: '작은 약속을 지키는 게 신뢰로 쌓이는 날이에요.', en: 'Keeping small promises quietly builds trust today.', ja: '小さな約束を守ることが信頼として積み重なる日。' },
  { ko: '기분 전환이 필요한 날. 창문을 열고 바깥 공기를 한 번 들이마셔 보세요.', en: 'You could use a change of air. Open a window and take one deep breath.', ja: '気分転換が必要な日。窓を開けて外の空気を一度吸い込んでみて。' },
  { ko: '칭찬을 주고받기 좋은 날. 떠오른 좋은 말은 아끼지 말고 전해요.', en: 'A day for giving and receiving compliments. If a kind word comes to mind, say it.', ja: '褒め言葉をやりとりするのに良い日。浮かんだ良い言葉は惜しまず伝えて。' },
  { ko: '계획이 살짝 바뀌어도 괜찮은 날. 오히려 더 나은 길이 보여요.', en: 'It is fine if plans shift a little today — a better path may appear.', ja: '予定が少し変わっても大丈夫な日。むしろ良い道が見えてきます。' },
  { ko: '집중력이 오르는 오후. 중요한 일은 점심 이후로 잡아 보세요.', en: 'Your focus peaks in the afternoon. Schedule the important stuff after lunch.', ja: '集中力が上がる午後。大事なことは昼過ぎに回してみて。' },
  { ko: '오래된 물건에서 좋은 기억을 발견하는 날이에요.', en: 'An old keepsake may bring back a good memory today.', ja: '古い物から良い思い出を見つける日。' },
  { ko: '누군가에게 도움을 청해도 좋은 날. 생각보다 기꺼이 손을 내밀어 줘요.', en: 'It is okay to ask for help today. People are more willing than you think.', ja: '誰かに助けを求めてもいい日。思ったより快く手を貸してくれます。' },
  { ko: '작은 사치가 큰 위로가 되는 날. 좋아하는 간식 하나 정도는 괜찮아요.', en: 'A small treat goes a long way today. One favorite snack is well deserved.', ja: '小さな贅沢が大きな癒しになる日。好きなおやつ一つくらいは大丈夫。' },
  { ko: '마무리운이 좋은 날. 끝내지 못한 일 하나를 닫으면 개운해져요.', en: 'Good energy for finishing things. Closing one open task will feel great.', ja: '仕上げの運が良い日。終わっていないことを一つ片付けるとすっきり。' },
  { ko: '표현이 잘 전해지는 날. 고마운 사람에게 짧게라도 마음을 전해 보세요.', en: 'Your words land well today. Send a short thank-you to someone who deserves it.', ja: '気持ちが伝わりやすい日。感謝したい人に短くても思いを伝えてみて。' },
  { ko: '몸을 조금 움직이면 머리가 맑아지는 날. 가벼운 산책을 추천해요.', en: 'A little movement clears your head today. A light walk is a good idea.', ja: '少し体を動かすと頭がすっきりする日。軽い散歩がおすすめ。' },
  { ko: '우연이 겹치는 날. 평소와 다른 선택이 재미있는 만남으로 이어져요.', en: 'Coincidences line up today. A different choice could lead to a fun encounter.', ja: '偶然が重なる日。いつもと違う選択が楽しい出会いにつながります。' },
  { ko: '잠깐 쉬어 가도 되는 날. 멈춘다고 뒤처지는 게 아니에요.', en: 'It is okay to pause today. Stopping for a moment is not falling behind.', ja: '少し休んでもいい日。立ち止まることは遅れることではありません。' },
]

/** 이번 주 흐름 — (별자리, 주 시작일)로 하나 */
export const STAR_WEEK: L[] = [
  { ko: '주 초반엔 정리, 후반엔 새 출발. 수요일쯤 작은 전환점이 와요.', en: 'Tidy up early in the week, start fresh later on. A small turning point arrives around Wednesday.', ja: '週の前半は整理、後半は新しいスタート。水曜あたりに小さな転機が。' },
  { ko: '사람 운이 좋은 한 주. 오랜만의 모임이나 연락에 즐거운 일이 숨어 있어요.', en: 'A people-friendly week. A catch-up or reunion hides something fun.', ja: '人との縁が良い一週間。久しぶりの集まりや連絡に楽しいことが。' },
  { ko: '천천히 쌓이는 한 주. 매일 조금씩 한 것이 주말에 눈에 띄게 보여요.', en: 'A slow-building week. Little daily efforts become visible by the weekend.', ja: 'ゆっくり積み上がる一週間。毎日の少しずつが週末に形になります。' },
  { ko: '아이디어가 반짝이는 한 주. 메모장을 가까이 두면 좋아요.', en: 'Ideas sparkle this week. Keep a notepad close.', ja: 'アイデアがきらめく一週間。メモ帳を近くに置いておくと吉。' },
  { ko: '쉼표가 필요한 한 주. 일정 사이사이 빈칸을 남겨 두세요.', en: 'A week that needs a few commas. Leave some blank space between plans.', ja: '休符が必要な一週間。予定の合間に余白を残して。' },
  { ko: '결정이 잘 풀리는 한 주. 고민하던 선택은 목요일 전후가 좋아요.', en: 'Decisions come easily this week. Around Thursday is a good time for that choice.', ja: '決断がうまくいく一週間。迷っていた選択は木曜前後が良さそう。' },
  { ko: '작은 기쁨이 자주 찾아오는 한 주. 사진으로 남겨 두면 두 배로 즐거워요.', en: 'Small joys show up often this week. Snap a photo to enjoy them twice.', ja: '小さな喜びがよく訪れる一週間。写真に残すと楽しさ二倍。' },
  { ko: '도전해 볼 만한 한 주. 평소 망설이던 일에 한 걸음만 내디뎌 보세요.', en: 'A week worth a small leap. Take just one step toward something you have hesitated on.', ja: '挑戦してみる価値のある一週間。ためらっていたことに一歩だけ踏み出して。' },
  { ko: '관계를 다듬는 한 주. 오해가 있었다면 가볍게 풀기 좋은 때예요.', en: 'A week for smoothing things over. If there was a misunderstanding, it is easy to clear up now.', ja: '関係を整える一週間。誤解があれば軽く解くのに良い時期。' },
  { ko: '집중의 한 주. 한 번에 한 가지만 하면 효율이 훨씬 올라가요.', en: 'A focused week. Doing one thing at a time will boost your efficiency.', ja: '集中の一週間。一度に一つだけにすると効率がぐっと上がります。' },
  { ko: '여유가 운을 부르는 한 주. 주말엔 좋아하는 곳에서 느긋하게 보내 보세요.', en: 'Ease invites luck this week. Spend the weekend somewhere you love, unhurried.', ja: '余裕が運を呼ぶ一週間。週末は好きな場所でのんびりと。' },
  { ko: '배우고 나누는 한 주. 알게 된 걸 누군가에게 설명하면 더 확실해져요.', en: 'A week for learning and sharing. Explaining what you learned makes it stick.', ja: '学んで分かち合う一週間。知ったことを誰かに説明するとより確かに。' },
]

export interface LuckyColor {
  name: L
  hex: string
}

export const LUCKY_COLORS: LuckyColor[] = [
  { hex: '#E8505B', name: { ko: '코랄 레드', en: 'Coral red', ja: 'コーラルレッド' } },
  { hex: '#F29A1F', name: { ko: '귤색', en: 'Tangerine', ja: 'みかん色' } },
  { hex: '#F2C94C', name: { ko: '레몬 옐로', en: 'Lemon yellow', ja: 'レモンイエロー' } },
  { hex: '#6FCF97', name: { ko: '민트', en: 'Mint', ja: 'ミント' } },
  { hex: '#3E8E63', name: { ko: '숲 초록', en: 'Forest green', ja: 'フォレストグリーン' } },
  { hex: '#56CCF2', name: { ko: '하늘색', en: 'Sky blue', ja: '空色' } },
  { hex: '#2F5FB3', name: { ko: '네이비', en: 'Navy', ja: 'ネイビー' } },
  { hex: '#9B7FE6', name: { ko: '라벤더', en: 'Lavender', ja: 'ラベンダー' } },
  { hex: '#F2A0C0', name: { ko: '벚꽃 분홍', en: 'Blossom pink', ja: '桜ピンク' } },
  { hex: '#A0785A', name: { ko: '모카', en: 'Mocha', ja: 'モカ' } },
  { hex: '#F4F1EA', name: { ko: '아이보리', en: 'Ivory', ja: 'アイボリー' } },
  { hex: '#B0B7C3', name: { ko: '실버 그레이', en: 'Silver gray', ja: 'シルバーグレー' } },
]
