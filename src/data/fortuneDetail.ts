import type { L } from './types'

/** 오늘의 '상세 운세' 템플릿 — 결정론적(같은 날=같은 결과). 일주 인덱스로 선택. */

const pick = <T,>(arr: T[], i: number): T => arr[((i % arr.length) + arr.length) % arr.length]

const MORNING: L[] = [
  { ko: '아침은 머리가 가장 맑은 시간이에요. 오늘 가장 중요한 결정이나 어려운 일을 이 시간에 처리하면 술술 풀립니다.', en: 'Your mind is clearest this morning — tackle the day’s hardest decision now and it flows.', ja: '朝は頭が一番冴える時間。今日一番重要な決断は午前中に。' },
  { ko: '오전엔 서두르지 마세요. 천천히 커피 한 잔의 여유를 가지면 놓칠 뻔한 실수 하나를 잡아냅니다.', en: 'Don’t rush the morning — a slow coffee helps you catch a mistake you’d have missed.', ja: '午前は焦らずに。ゆっくりの一杯が、見落としを一つ救う。' },
  { ko: '아침에 먼저 연락 온 사람에게 평소보다 따뜻하게 답해 보세요. 작은 호의가 오후의 기회로 돌아옵니다.', en: 'Reply a little warmer to whoever reaches out first — small kindness returns as a chance later.', ja: '朝最初に連絡をくれた人へ温かく返事を。小さな好意が午後の機会に。' },
  { ko: '오늘 아침의 컨디션이 하루를 좌우해요. 가벼운 스트레칭이나 물 한 잔으로 몸을 먼저 깨우면 운이 따라옵니다.', en: 'Your morning sets the day — wake the body first with a stretch or water, and luck follows.', ja: '今朝の調子が一日を左右。ストレッチや水で体を起こすと運がつく。' },
  { ko: '아침엔 큰 그림을 그리기 좋아요. 오늘 하루 할 일을 3가지로 적어두면 흔들리지 않습니다.', en: 'Good morning for the big picture — write your 3 priorities and you won’t drift.', ja: '朝は全体像に最適。今日の3つを書けばぶれない。' },
  { ko: '오전의 작은 정리정돈이 행운을 불러요. 책상이나 가방을 한 번 비우면 마음도 가벼워집니다.', en: 'A little morning tidying invites luck — clear your desk or bag and your mind lightens.', ja: '午前の小さな片付けが幸運を呼ぶ。机や鞄を整えると心も軽く。' },
  { ko: "아침에 창문을 활짝 열고 깊게 숨을 세 번 들이쉬어 보세요. 새 공기가 들어오면 막혀 있던 운의 흐름도 함께 트입니다.", en: "Throw the window open and take three deep breaths — let fresh air in, and a stalled flow of luck opens with it.", ja: "朝、窓を大きく開けて深呼吸を三回。新しい空気とともに、滞っていた運の流れも開く。" },
  { ko: "출근길이나 등굣길을 평소보다 5분만 일찍 나서 보세요. 쫓기지 않는 발걸음이 하루 종일 여유로운 운을 만듭니다.", en: "Leave just 5 minutes earlier today — an unhurried step in the morning sets an easy luck for the whole day.", ja: "今朝はいつもより5分だけ早く家を出て。追われない一歩が、一日中ゆとりの運をつくる。" },
  { ko: "마음에 걸리는 걱정 하나를 종이에 적어 보세요. 글로 꺼내 놓는 순간 머리가 가벼워지고 좋은 판단이 들어옵니다.", en: "Write down the one worry on your mind — putting it on paper lightens your head and lets good judgment in.", ja: "気がかりを一つ紙に書き出してみて。言葉にした瞬間、頭が軽くなり良い判断が入ってくる。" },
  { ko: "오늘 처음 마주치는 사람에게 먼저 가볍게 웃어 보세요. 그 한 번의 미소가 하루의 인연운을 부드럽게 열어 줍니다.", en: "Smile first at the first person you meet today — that one smile gently opens the day’s luck with people.", ja: "今日最初に出会う人へ、先に軽く微笑んでみて。その一度の笑顔が一日の縁の運をやわらかく開く。" },
  { ko: "아침에 평소보다 밝은 색 옷이나 소품을 하나 골라 보세요. 눈에 띄는 작은 색이 기분을 끌어올리고 좋은 운을 불러옵니다.", en: "Pick one brighter-colored item to wear this morning — a small pop of color lifts your mood and draws good luck.", ja: "今朝はいつもより明るい色の服や小物を一つ選んで。目を引く小さな色が気分を上げ、良い運を呼ぶ。" },
  { ko: "가장 쉬운 일부터 하나 끝내고 시작해 보세요. 작은 성취 하나가 엔진처럼 하루 전체의 흐름에 시동을 걸어 줍니다.", en: "Knock out the easiest task first — one small win acts like an engine that gets the whole day going.", ja: "一番簡単な用事を一つ片付けてから始めて。小さな達成がエンジンのように一日全体の流れを動かす。" },
]
const NOON: L[] = [
  { ko: '점심 전후로 사람과의 대화에서 좋은 정보가 흘러나와요. 가볍게 묻고 잘 들어주면 뜻밖의 힌트를 얻습니다.', en: 'Around midday, good info slips out in conversation — ask lightly, listen well, gain a hint.', ja: '昼前後、会話から良い情報が。軽く尋ね、よく聞くとヒントが。' },
  { ko: '오후엔 집중력이 잠깐 흐트러질 수 있어요. 중요한 일은 오전에 끝내고, 오후엔 사람을 만나는 게 유리합니다.', en: 'Focus dips in the afternoon — finish key work by noon, save the afternoon for people.', ja: '午後は集中が一瞬乱れがち。重要な事は午前に、午後は人と会うのが吉。' },
  { ko: '점심 메뉴를 평소와 다르게 골라보세요. 작은 변화가 오후의 기분과 운의 흐름을 바꿉니다.', en: 'Pick a different lunch than usual — a small change shifts your afternoon mood and luck.', ja: '昼を普段と違うものに。小さな変化が午後の運を変える。' },
  { ko: '한낮엔 잠깐 햇볕을 쬐며 걸으면 막혔던 생각이 풀려요. 5분 산책이 오후의 능률을 두 배로 만듭니다.', en: 'A short sunny walk at noon unblocks stuck thoughts — 5 minutes doubles your afternoon.', ja: '日中、日を浴びて歩くと詰まりが解ける。5分の散歩が午後を倍に。' },
  { ko: '오후엔 돈 쓸 일이 생기기 쉬워요. 지갑을 열기 전에 "정말 필요한가" 한 번만 물어보세요.', en: 'Spending temptations rise in the afternoon — ask “do I really need this?” once first.', ja: '午後は出費が増えがち。財布を開く前に「本当に必要？」と一度。' },
  { ko: '점심 이후의 나른함은 당신 탓이 아니에요. 짧은 휴식을 죄책감 없이 챙기면 저녁까지 운이 갑니다.', en: 'Post-lunch drowsiness isn’t your fault — take a guilt-free break and luck carries to evening.', ja: '昼後のだるさはあなたのせいではない。罪悪感なく休めば夕方まで運が続く。' },
  { ko: "오후의 흐트러진 자세를 한 번 바로잡아 보세요. 어깨를 펴고 숨을 깊게 들이쉬면 답답하던 일에 새 길이 보입니다.", en: "Reset your slumped posture once in the afternoon — straighten up, breathe deep, and a stuck task finds a new way.", ja: "午後の崩れた姿勢を一度正してみて。肩を開いて深呼吸すれば、行き詰まった事に新しい道が見える。" },
  { ko: "답장을 미뤄둔 메시지가 하나 있을 거예요. 점심 지나 가볍게 보내두면 마음의 짐이 줄고 일도 한 걸음 나아갑니다.", en: "There’s a message you’ve been putting off — send a light reply after lunch and a weight lifts as things move forward.", ja: "返事を後回しにしたメッセージが一つあるはず。昼過ぎに軽く送れば、心の荷が減り物事も一歩進む。" },
  { ko: "미뤄두면 커지는 작은 일을 지금 5분 안에 끝내 보세요. 오후의 마음이 가벼워지면서 운의 흐름이 트입니다.", en: "Finish a small task within five minutes now before it grows — your afternoon lightens and luck opens up.", ja: "放っておくと膨らむ小さな用事を、今5分で片付けて。午後の心が軽くなり運の流れが開く。" },
  { ko: "오늘 점심은 혼자보다 누군가와 함께 먹으면 좋아요. 마주 앉아 나눈 한마디가 뜻밖의 인연으로 이어집니다.", en: "Share today’s lunch with someone rather than eating alone — a word across the table leads to an unexpected connection.", ja: "今日の昼は一人より誰かと一緒が吉。向き合って交わした一言が、思わぬ縁につながる。" },
  { ko: "오후엔 몸의 온도에 신경 써 보세요. 겉옷 하나를 더하거나 빼는 작은 조절이 컨디션과 집중을 지켜줍니다.", en: "Mind your body temperature this afternoon — adding or shedding one layer keeps your focus and condition steady.", ja: "午後は体の温度に気を配って。羽織りを一枚足すか脱ぐ小さな調整が、調子と集中を守る。" },
  { ko: "낮 동안 누군가에게 진심 어린 고맙다는 말을 건네 보세요. 짧은 한마디가 돌고 돌아 당신에게 따뜻하게 돌아옵니다.", en: "Offer someone a sincere thank-you during the day — a short word circles back to you, warmly.", ja: "日中、誰かに心からの「ありがとう」を伝えて。短い一言が巡り巡って、温かくあなたに返る。" },
]
const EVENING: L[] = [
  { ko: '저녁엔 하루를 돌아보기 좋아요. 잘한 일 하나를 떠올리며 스스로를 칭찬하면 내일의 운이 쌓입니다.', en: 'Evening is for reflection — recall one thing you did well, and tomorrow’s luck builds.', ja: '夕方は振り返りに。よくやった事を一つ思い、自分を褒めると明日の運が貯まる。' },
  { ko: '밤엔 충동적인 연락이나 결정을 피하세요. 하루 자고 나면 생각이 또렷해져 더 좋은 선택을 합니다.', en: 'Avoid impulsive messages or decisions at night — sleep on it for a clearer, better choice.', ja: '夜は衝動的な連絡や決断を避けて。一晩寝れば、より良い選択ができる。' },
  { ko: '저녁의 따뜻한 한 끼와 가벼운 정리가 운을 마무리해요. 오늘의 피로를 내일로 넘기지 마세요.', en: 'A warm dinner and light tidy seal the day’s luck — don’t carry today’s fatigue to tomorrow.', ja: '夕の温かい一食と軽い片付けが運を締める。今日の疲れを明日へ持ち越さないで。' },
  { ko: '밤늦게 좋은 아이디어가 떠오를 수 있어요. 메모해 두되 실행은 내일 아침으로 미루는 게 좋습니다.', en: 'A good idea may strike late — note it, but act on it tomorrow morning.', ja: '夜遅く良い案が浮かぶかも。メモして、実行は明朝に。' },
  { ko: '저녁엔 가까운 사람에게 먼저 안부를 전해 보세요. 오늘 쌓인 인연의 점수가 한 단계 올라갑니다.', en: 'Reach out to someone close this evening — your relationship score levels up.', ja: '夕方、近しい人へ先に一言を。縁の点数が一段上がる。' },
  { ko: '잠들기 전 휴대폰을 30분만 멀리하면 수면운이 좋아져 내일 컨디션이 확 달라집니다.', en: 'Put the phone away 30 min before bed — sleep luck rises and tomorrow feels different.', ja: '就寝30分前にスマホを離すと睡眠運が上がり、明日の調子が変わる。' },
  { ko: "저녁엔 따뜻한 물로 샤워하며 하루의 긴장을 흘려보내세요. 몸이 풀리면 마음도 가벼워져 좋은 운이 들어옵니다.", en: "Wash off the day’s tension in a warm shower this evening — as the body loosens, the mind lightens and luck flows in.", ja: "夕方は温かいシャワーで一日の緊張を流して。体がほぐれると心も軽くなり、良い運が入る。" },
  { ko: "오늘 고마웠던 사람에게 짧게 감사를 전해 보세요. 잠들기 전 건넨 따뜻한 한마디가 내일의 인연으로 이어집니다.", en: "Send a short thank-you to someone who helped today — a warm word before sleep grows into tomorrow’s connection.", ja: "今日助けてくれた人へ短い感謝を。眠る前の温かい一言が明日の縁につながる。" },
  { ko: "밤엔 조명을 한 단계 낮추고 천천히 숨을 골라 보세요. 공간이 아늑해지면 마음의 운도 함께 가라앉아 편안해집니다.", en: "Dim the lights a notch and breathe slowly tonight — as the room softens, your mood settles and eases.", ja: "夜は照明を一段落とし、ゆっくり呼吸を。空間が和むと心の運も落ち着いて安らぐ。" },
  { ko: "잠들기 전 내일 할 일을 딱 세 가지만 적어두세요. 머릿속이 비워지면 잠이 깊어지고 아침 운이 맑아집니다.", en: "Jot down just three tasks for tomorrow before bed — an emptied head deepens sleep and brightens the morning.", ja: "眠る前に明日の用事を三つだけ書いて。頭が空くと眠りが深まり、朝の運が冴える。" },
  { ko: "저녁엔 화면 대신 좋아하는 음악이나 책을 가까이해 보세요. 잔잔한 시간이 하루의 소음을 씻어내 운을 채워줍니다.", en: "Trade screens for a favorite song or book this evening — quiet time rinses away the day’s noise and refills your luck.", ja: "夕方は画面の代わりに好きな音楽や本を。静かな時間が一日の騒がしさを洗い、運を満たす。" },
  { ko: "오늘 마음에 걸린 일 하나는 그냥 흘려보내 보세요. 작은 후회를 내려놓으면 그 자리에 새로운 운이 들어옵니다.", en: "Let one thing that nagged you today simply go — set the small regret down, and fresh luck takes its place.", ja: "今日引っかかった事は一つ、そっと手放して。小さな後悔を下ろせば、その場に新しい運が入る。" },
]
const PLACE: L[] = [
  { ko: '물이 보이는 곳(강·바다·카페 창가)', en: 'somewhere with water in view (river, sea, a window café)', ja: '水が見える場所（川・海・窓際カフェ）' },
  { ko: '높은 곳이나 전망 좋은 자리', en: 'a high place or spot with a good view', ja: '高い場所や見晴らしの良い席' },
  { ko: '초록이 있는 공원·산책로', en: 'a green park or walking path', ja: '緑のある公園・散歩道' },
  { ko: '사람이 적당히 북적이는 번화가', en: 'a moderately lively downtown', ja: '程よく賑わう繁華街' },
  { ko: '조용한 서점이나 도서관', en: 'a quiet bookstore or library', ja: '静かな書店や図書館' },
  { ko: '평소 잘 안 가던 새로운 동네', en: 'a new neighborhood you rarely visit', ja: '普段行かない新しい街' },
  { ko: "정겨운 전통시장이나 동네 골목", en: "a homey traditional market or neighborhood alley", ja: "情緒ある伝統市場や下町の路地" },
  { ko: "향이 좋은 아늑한 카페나 베이커리", en: "a cozy café or bakery with a good aroma", ja: "良い香りの落ち着いたカフェやベーカリー" },
  { ko: "그림이나 전시가 있는 갤러리·미술관", en: "a gallery or museum with art on display", ja: "絵や展示のあるギャラリー・美術館" },
  { ko: "좋은 기억이 깃든 익숙한 단골 가게", en: "a familiar regular haunt holding fond memories", ja: "良い思い出のなじみの常連店" },
  { ko: "음악이 흐르는 곳(공연장·라이브 카페)", en: "somewhere with music playing (a venue, live café)", ja: "音楽が流れる場所（ライブ会場・音楽カフェ）" },
  { ko: "탁 트인 광장이나 너른 마당", en: "an open square or spacious courtyard", ja: "開けた広場やゆったりした庭先" },
]
const ITEM: L[] = [
  { ko: '손목시계나 팔찌 등 손목에 닿는 것', en: 'a watch or bracelet — something on the wrist', ja: '腕時計やブレスレットなど手首に触れる物' },
  { ko: '향이 좋은 작은 소품(립밤·핸드크림)', en: 'a nice-scented small item (lip balm, hand cream)', ja: '良い香りの小物（リップ・ハンドクリーム）' },
  { ko: '평소 안 쓰던 색의 펜이나 노트', en: 'a pen or notebook in an unusual color', ja: '普段使わない色のペンやノート' },
  { ko: '동전 지갑이나 작은 파우치', en: 'a coin purse or small pouch', ja: '小銭入れや小さなポーチ' },
  { ko: '귀걸이·반지 같은 작은 금속 장신구', en: 'a small metal accessory (earrings, ring)', ja: 'ピアス・指輪など小さな金属の装身具' },
  { ko: '손수건이나 작은 거울', en: 'a handkerchief or pocket mirror', ja: 'ハンカチや小さな鏡' },
  { ko: "손에 잡히는 따뜻한 음료 한 잔", en: "a warm drink to hold in your hand", ja: "手に取る温かい飲み物一杯" },
  { ko: "좋아하는 노래가 담긴 이어폰", en: "earphones with a song you love", ja: "好きな曲が入ったイヤホン" },
  { ko: "작은 화분이나 생화 한 송이", en: "a small potted plant or a single fresh flower", ja: "小さな鉢植えや生花一輪" },
  { ko: "오래 쓴 손때 묻은 열쇠고리", en: "a well-worn keyring you've had a while", ja: "使い込んだキーホルダー" },
  { ko: "포근한 색의 양말이나 머플러", en: "socks or a scarf in a cozy color", ja: "温かみのある色の靴下やマフラー" },
  { ko: "가볍게 들고 다닐 얇은 책 한 권", en: "a thin book light enough to carry around", ja: "気軽に持ち歩ける薄い本一冊" },
]
const FOOD: L[] = [
  { ko: '따뜻한 국물 요리', en: 'a warm soup dish', ja: '温かい汁物' },
  { ko: '제철 과일이나 샐러드', en: 'seasonal fruit or salad', ja: '旬の果物やサラダ' },
  { ko: '견과류와 차 한 잔', en: 'nuts with a cup of tea', ja: 'ナッツとお茶一杯' },
  { ko: '매콤한 음식(스트레스 해소)', en: 'something spicy (to release stress)', ja: '辛い物（ストレス解消）' },
  { ko: '담백한 흰살 생선이나 두부', en: 'mild white fish or tofu', ja: 'あっさりした白身魚や豆腐' },
  { ko: '달콤한 디저트 한 조각', en: 'a slice of sweet dessert', ja: '甘いデザート一切れ' },
  { ko: "갓 지은 따뜻한 밥 한 공기", en: "a bowl of freshly cooked rice", ja: "炊きたての温かいご飯一杯" },
  { ko: "발효 음식(김치·요거트)", en: "fermented food (kimchi, yogurt)", ja: "発酵食品（キムチ・ヨーグルト）" },
  { ko: "비타민 가득한 새콤한 과일", en: "tangy fruit full of vitamins", ja: "ビタミンたっぷりの酸っぱい果物" },
  { ko: "든든한 달걀 요리", en: "a hearty egg dish", ja: "しっかりした卵料理" },
  { ko: "따뜻한 면 요리 한 그릇", en: "a warm bowl of noodles", ja: "温かい麺料理一杯" },
  { ko: "고소한 콩이나 통곡물 한 줌", en: "a handful of nutty beans or whole grains", ja: "香ばしい豆や全粒穀物一握り" },
]
const CAUTION: L[] = [
  { ko: '말이 평소보다 빨라지기 쉬워요. 중요한 자리에선 한 박자 늦춰 말하면 오해를 막습니다.', en: 'You may speak faster than usual — slow a beat in important moments to avoid misreads.', ja: '言葉が早くなりがち。大事な場面では一拍遅く話すと誤解を防ぐ。' },
  { ko: '작은 지출이 새어나가기 쉬운 날이에요. 카드보다 현금을 쓰면 씀씀이가 눈에 보입니다.', en: 'Small spends leak today — use cash over card to see where it goes.', ja: '小さな出費が漏れやすい日。カードより現金で使うと見える。' },
  { ko: '욱하는 감정이 올라올 수 있어요. 답장을 보내기 전에 3초만 멈추면 후회할 일이 사라집니다.', en: 'A flare of temper may rise — pause 3 seconds before replying and regret vanishes.', ja: 'カッとなりやすい。返信前に3秒止まれば後悔が消える。' },
  { ko: '약속 시간을 착각하기 쉬운 날이에요. 오늘만큼은 일정을 한 번 더 확인하세요.', en: 'Easy to mix up appointment times today — double-check your schedule.', ja: '約束の時間を勘違いしやすい。今日は予定を再確認して。' },
  { ko: '귀가 얇아지기 쉬워요. 솔깃한 제안일수록 하루 자고 결정하면 손해를 피합니다.', en: 'You’re easily swayed — sleep on any tempting offer to dodge a loss.', ja: '人の話に流されやすい。うまい話ほど一晩置いて決めると損を避ける。' },
  { ko: '몸이 보내는 작은 신호(두통·뻐근함)를 무시하지 마세요. 일찍 쉬는 게 가장 큰 이득입니다.', en: 'Don’t ignore small body signals (headache, stiffness) — resting early pays most.', ja: '体の小さな信号（頭痛・こり）を無視しないで。早めの休息が一番得。' },
  { ko: "서두르다 서명이나 동의 버튼을 누르기 쉬운 날이에요. 작은 글씨까지 한 번 읽고 누르면 뒤탈이 없습니다.", en: "Easy to sign or hit ‘agree’ in a rush today — read the fine print once and there’s no fallout.", ja: "急いで署名や同意ボタンを押しがち。小さな字まで一度読めば後腐れがない。" },
  { ko: "물건을 어디 뒀는지 깜빡하기 쉬운 날이에요. 열쇠·지갑은 늘 같은 자리에 두면 찾을 일이 없습니다.", en: "Easy to forget where you put things today — keep keys and wallet in one fixed spot and you won’t hunt.", ja: "物の置き場所を忘れがちな日。鍵や財布をいつも同じ場所に置けば探さずに済む。" },
  { ko: "부탁을 다 받아주다 일이 넘칠 수 있어요. 정말 할 수 있는 것만 ‘네’ 하면 마음이 가벼워집니다.", en: "Saying yes to every favor may pile work up — agree only to what you can truly do and your mind lightens.", ja: "頼みを全部引き受けて手一杯になりがち。本当にできる事だけ「はい」と言えば心が軽い。" },
  { ko: "남과 비교하며 마음이 흔들리기 쉬운 날이에요. 화면을 잠시 덮고 내 하루에 집중하면 평온이 돌아옵니다.", en: "Easy to waver comparing yourself to others — close the screen a moment, focus on your own day, and calm returns.", ja: "人と比べて心が揺れやすい日。画面を少し閉じ自分の一日に集中すれば穏やかさが戻る。" },
  { ko: "빨리 끝내려다 도리어 다시 하게 될 수 있어요. 한 단계만 천천히 가면 두 번 일이 사라집니다.", en: "Rushing to finish may mean redoing it — take just one step slowly and the double work disappears.", ja: "早く終わらせようとして逆にやり直しがち。一段階だけゆっくり進めば二度手間が消える。" },
  { ko: "끼니를 거르거나 빈속에 커피만 마시기 쉬운 날이에요. 따뜻한 한 끼를 챙기면 오후가 든든해집니다.", en: "Easy to skip meals or run on coffee alone today — one warm meal keeps your afternoon steady.", ja: "食事を抜いたり空腹でコーヒーだけになりがち。温かい一食をとれば午後が安定する。" },
]
const ADVICE: L[] = [
  { ko: '미뤄둔 연락 하나를 오늘 끝내세요. 마음의 짐 하나가 사라지면 다른 운도 함께 풀립니다.', en: 'Finish one postponed message today — a weight lifts and other luck loosens too.', ja: '先延ばしの連絡を一つ片付けて。心の荷が消え、他の運も解ける。' },
  { ko: '평소 고맙던 사람에게 짧게라도 감사를 표현해 보세요. 오늘 한 말이 멀리까지 좋은 인연으로 퍼집니다.', en: 'Thank someone you appreciate, even briefly — today’s words spread far as good ties.', ja: '感謝している人へ短くでも一言。今日の言葉が遠くまで良縁に広がる。' },
  { ko: '오래 망설이던 작은 일을 딱 하나만 시작해 보세요. 시작 자체가 오늘의 가장 큰 행운입니다.', en: 'Start just one thing you’ve hesitated on — starting itself is today’s biggest luck.', ja: '迷っていた小さな事を一つだけ始めて。始める事こそ今日最大の幸運。' },
  { ko: '오늘은 새로운 것을 배우기 좋은 날이에요. 짧은 영상 하나, 책 한 챕터가 미래의 씨앗이 됩니다.', en: 'A good day to learn — one short video or book chapter is a seed for your future.', ja: '学びに良い日。短い動画一本、本一章が未来の種に。' },
  { ko: '몸을 움직이면 운이 따라와요. 한 정거장 먼저 내려 걷거나 계단을 이용해 보세요.', en: 'Move your body and luck follows — get off a stop early or take the stairs.', ja: '体を動かすと運がつく。一駅前で降りて歩く、階段を使う。' },
  { ko: '오늘 번 작은 성취를 기록해 두세요. 적어두는 습관이 한 달 뒤 큰 자신감으로 돌아옵니다.', en: 'Log today’s small wins — the habit returns as big confidence in a month.', ja: '今日の小さな成果を記録して。書く習慣が一月後に大きな自信に。' },
  { ko: "책상 위 한 칸만 비워보세요. 손이 닿는 자리가 정리되면 마음도 따라 맑아집니다.", en: "Clear just one corner of your desk — a tidy spot at hand clears the mind too.", ja: "机の上を一区画だけ片付けて。手元が整うと心も澄む。" },
  { ko: "오늘은 잠깐의 쉼이 보약이에요. 10분만 눈을 감고 멍하니 있으면 오후의 운이 되살아납니다.", en: "A short rest is medicine today — close your eyes for 10 min and the afternoon revives.", ja: "今日は少しの休みが薬。10分目を閉じてぼんやりすれば午後の運が戻る。" },
  { ko: "거울 보고 한 번 웃어보세요. 가벼운 미소 하나가 오늘 만나는 사람들의 기운까지 바꿉니다.", en: "Smile once at the mirror — one light smile shifts the mood of everyone you meet today.", ja: "鏡に向かって一度笑って。軽い微笑みが今日会う人の気分まで変える。" },
  { ko: "늘 가던 길을 살짝 바꿔보세요. 낯선 골목 하나가 뜻밖의 좋은 발견으로 이어집니다.", en: "Take a slightly different route — one unfamiliar alley leads to a happy find.", ja: "いつもの道を少し変えて。見知らぬ路地が思わぬ良い発見に。" },
  { ko: "오늘은 제대로 된 한 끼가 운을 채워줘요. 좋아하는 음식을 천천히 음미하면 기운이 돕니다.", en: "A proper meal fills your luck today — savor a favorite dish slowly and energy returns.", ja: "今日はちゃんとした一食が運を満たす。好きな料理をゆっくり味わえば元気が巡る。" },
  { ko: "자신에게 따뜻한 한마디를 건네보세요. \"잘하고 있어\"라는 말이 오늘 하루를 든든하게 받쳐줍니다.", en: "Give yourself a kind word — \"you're doing well\" steadies your whole day.", ja: "自分に温かい一言を。「よくやってる」が今日一日を支えてくれる。" },
]
const RELATION: L[] = [
  { ko: '대인관계운이 활짝 열려요. 먼저 다가가면 오래 가는 인연이 시작될 수 있는 날입니다.', en: 'Relationships open wide — reach out first and a lasting bond may begin.', ja: '対人運が開く。先に近づけば長く続く縁が始まるかも。' },
  { ko: '오해가 생기기 쉬운 날이에요. 문자보다 직접 목소리로 전하면 마음이 정확히 전달됩니다.', en: 'Misunderstandings come easy — a voice call lands your heart better than text.', ja: '誤解が生じやすい。文字より声で伝えると心が正確に届く。' },
  { ko: '누군가 당신의 도움을 기다리고 있어요. 작은 손길 하나가 큰 고마움으로 돌아옵니다.', en: 'Someone awaits your help — a small hand returns as big gratitude.', ja: '誰かがあなたの助けを待っている。小さな手助けが大きな感謝に。' },
  { ko: '오늘은 듣는 사람이 이기는 날이에요. 말을 줄이고 끄덕여 주면 신뢰가 한 뼘 자랍니다.', en: 'Today the listener wins — talk less, nod more, and trust grows.', ja: '今日は聞く人が勝つ。言葉を減らし頷けば信頼が育つ。' },
  { ko: '가까운 사이일수록 예의를 챙기면 관계가 더 단단해져요. 익숙함에 무례해지지 않도록.', en: 'Mind manners even with the close — familiarity shouldn’t turn rude.', ja: '近い相手ほど礼を。慣れが無礼にならないように。' },
  { ko: '새로운 만남의 기운이 있어요. 평소 안 가던 모임이나 자리에 한 번 나가보면 좋은 인연이 있습니다.', en: 'A new-meeting vibe is here — show up somewhere unfamiliar and good ties await.', ja: '新しい出会いの気配。普段行かない集まりに顔を出すと良縁が。' },
  { ko: "오래 연락 못 한 사람에게서 소식이 올 수 있어요. 반갑게 답하면 끊겼던 인연이 다시 이어집니다.", en: "Word may come from someone long out of touch — answer warmly and a faded bond revives.", ja: "長く連絡が途絶えた人から便りが来るかも。快く返せば途切れた縁が再びつながる。" },
  { ko: "오늘은 칭찬 한마디가 큰 힘이 돼요. 누군가의 잘한 점을 콕 집어 말해주면 분위기가 환해집니다.", en: "A single compliment carries weight today — point out someone's good side and the mood brightens.", ja: "今日は褒め言葉が大きな力に。誰かの良い点を具体的に伝えると場が明るくなる。" },
  { ko: "작은 다툼이 있었다면 화해하기 좋은 날이에요. 먼저 손을 내밀면 관계가 전보다 더 깊어집니다.", en: "If there was a small spat, today is good for making up — offer your hand first and the bond deepens.", ja: "小さな諍いがあったなら仲直りに良い日。先に手を差し伸べれば関係はより深まる。" },
  { ko: "두 사람 사이에서 다리 역할을 하기 좋은 날이에요. 당신의 한마디가 어색함을 자연스럽게 풀어줍니다.", en: "A good day to bridge two people — a word from you eases the awkwardness naturally.", ja: "二人の間を取り持つのに良い日。あなたの一言が気まずさを自然にほぐす。" },
  { ko: "거절도 다정할 수 있어요. 부드럽게 선을 그으면 무리한 부탁에서 자유로워지고 마음도 편해집니다.", en: "Even a no can be kind — draw a gentle line and you'll be free of overreach and feel lighter.", ja: "断り方も優しくできる。柔らかく線を引けば無理な頼みから自由になり心も軽くなる。" },
  { ko: "고마운 마음을 미루지 말고 표현해 보세요. 짧은 감사 인사 하나가 오래 기억될 인연을 만듭니다.", en: "Don't put off saying thanks — one short note of gratitude builds a bond long remembered.", ja: "感謝の気持ちを後回しにせず伝えてみて。短いお礼の一言が長く心に残る縁を作る。" },
]
const WORK: L[] = [
  { ko: '집중력이 살아나는 날이에요. 가장 어려운 과제를 먼저 잡으면 나머지는 가볍게 끝납니다.', en: 'Focus is alive — grab the hardest task first and the rest goes light.', ja: '集中が冴える日。一番難しい課題を先に掴めば残りは軽い。' },
  { ko: '협업운이 좋아요. 혼자 끙끙대지 말고 한 사람에게 물어보면 길이 빨리 열립니다.', en: 'Teamwork luck is good — ask one person instead of struggling alone.', ja: '協業運が良い。一人で抱えず誰かに尋ねると道が早く開く。' },
  { ko: '꼼꼼함이 빛나는 날이에요. 마지막에 한 번 더 검토하면 큰 실수를 막고 신뢰를 얻습니다.', en: 'A day for thoroughness — one final review prevents a big mistake and earns trust.', ja: '丁寧さが光る日。最後にもう一度確認すれば大ミスを防ぎ信頼を得る。' },
  { ko: '새 아이디어가 인정받기 좋은 날이에요. 작게라도 제안해 두면 기회로 이어집니다.', en: 'New ideas land well today — propose even a small one and it leads to a chance.', ja: '新しい案が認められやすい。小さくても提案すれば機会に。' },
  { ko: '욕심내면 탈이 나요. 오늘은 벌여둔 일을 마무리하는 데 집중하는 게 이득입니다.', en: 'Overreaching backfires — focus on finishing what’s open and you gain.', ja: '欲張ると崩れる。今日は広げた仕事の仕上げに集中が得。' },
  { ko: '윗사람·거래처와의 자리에서 운이 트여요. 예의 바른 한마디가 의외의 기회를 부릅니다.', en: 'Luck opens with seniors or clients — a courteous word invites a surprise chance.', ja: '目上・取引先との場で運が開く。礼儀ある一言が思わぬ機会を呼ぶ。' },
  { ko: "오전 컨디션이 가장 좋은 날이에요. 중요한 일을 점심 전에 끝내두면 오후가 한결 수월해집니다.", en: "Your morning is at its best — finish the important work before lunch and the afternoon turns easy.", ja: "午前の調子が一番いい日。大事な仕事を昼前に片づければ午後がぐっと楽になる。" },
  { ko: "배움이 술술 들어오는 날이에요. 미뤄둔 공부나 새 기술을 오늘 조금만 손대면 기억에 오래 남습니다.", en: "Learning sinks in smoothly today — touch that delayed study or new skill a little and it stays with you.", ja: "学びがすっと入る日。後回しの勉強や新しい技術に少し触れれば長く記憶に残る。" },
  { ko: "책상과 폴더를 정리하면 운이 따라와요. 어수선함을 걷어내는 순간 막혔던 일이 풀리기 시작합니다.", en: "Tidy your desk and folders and luck follows — clearing the clutter unblocks what was stuck.", ja: "机とフォルダを整えると運がついてくる。散らかりを片づけた瞬間、詰まっていた仕事が動き出す。" },
  { ko: "흐름을 탄 일은 멈추지 않는 게 좋아요. 한 번에 끝까지 밀어붙이면 오늘 안에 마침표를 찍습니다.", en: "Once you’re in the flow, don’t stop — push it through in one go and you’ll close it out today.", ja: "流れに乗った仕事は止めない方がいい。一気に押し切れば今日のうちに区切りがつく。" },
  { ko: "말과 글이 또렷해지는 날이에요. 요점부터 먼저 전하면 오해 없이 일이 빠르게 진행됩니다.", en: "Your words and writing come out clear — lead with the point and things move fast without misunderstanding.", ja: "言葉も文章もはっきりする日。要点から先に伝えれば誤解なく仕事が早く進む。" },
  { ko: "반복되던 일에서 요령이 보이는 날이에요. 작은 방법 하나만 바꿔도 시간이 눈에 띄게 줄어듭니다.", en: "You’ll spot a knack in your routine work — change one small method and your time visibly shrinks.", ja: "繰り返しの仕事にコツが見える日。小さなやり方を一つ変えるだけで時間が目に見えて減る。" },
]
const WEALTH: L[] = [
  { ko: '금전운이 안정적이에요. 큰 지출은 미루고 작은 저축을 시작하면 흐름이 좋아집니다.', en: 'Money luck is stable — delay big spends, start small savings, and flow improves.', ja: '金運は安定。大きな出費は先送り、小さな貯蓄を始めると流れが良い。' },
  { ko: '예상 밖의 작은 수입이나 환급이 있을 수 있어요. 들어온 돈의 일부는 꼭 남겨두세요.', en: 'A small unexpected income or refund may come — keep part of it aside.', ja: '予想外の小収入や還付があるかも。入った分の一部は必ず残して。' },
  { ko: '충동구매를 조심할 날이에요. 장바구니에 담고 하루만 기다리면 절반은 안 사게 됩니다.', en: 'Beware impulse buys — leave it in the cart a day and half won’t be bought.', ja: '衝動買いに注意。カートに入れて一日待てば半分は買わずに済む。' },
  { ko: '돈 관련 정보가 들어오기 좋은 날이에요. 솔깃한 말은 출처를 한 번 더 확인하면 안전합니다.', en: 'Money info comes in — double-check the source of any tempting tip to stay safe.', ja: 'お金の情報が入りやすい。うまい話は出所を再確認すれば安全。' },
  { ko: '나눔이 복을 부르는 날이에요. 작은 한턱이나 기부가 더 큰 금전운으로 돌아옵니다.', en: 'Sharing invites fortune — a small treat or donation returns as bigger money luck.', ja: '分かち合いが福を呼ぶ。小さなおごりや寄付が大きな金運に。' },
  { ko: '고정 지출을 점검하기 좋은 날이에요. 안 쓰는 구독 하나만 정리해도 한 달이 가벼워집니다.', en: 'Good day to review fixed costs — cancel one unused subscription and the month lightens.', ja: '固定費の見直しに良い日。使わない定期課金を一つ整理で一月が軽く。' },
  { ko: "빌려준 돈이나 받을 돈이 떠오르는 날이에요. 가볍게 안부 한마디 건네면 자연스럽게 정리됩니다.", en: "Money owed to you comes to mind today — a light hello settles it naturally.", ja: "貸したお金や受け取る分が浮かぶ日。軽く一声かければ自然に片づく。" },
  { ko: "잊고 있던 포인트나 상품권이 쏠쏠한 날이에요. 지갑과 앱을 한 번 들여다보면 공돈이 보입니다.", en: "Forgotten points or gift cards pay off today — peek in your wallet and apps for free cash.", ja: "忘れていたポイントや商品券が役立つ日。財布とアプリを覗けば臨時収入が。" },
  { ko: "값을 깎거나 더 싼 길을 찾기 좋은 날이에요. 같은 물건도 한 번 비교하면 만족이 커집니다.", en: "A good day to haggle or find a cheaper route — compare once and satisfaction grows.", ja: "値切りや安い道を探すのに良い日。同じ物も一度比べれば満足が増す。" },
  { ko: "투자나 큰 결정은 서두르지 않는 게 이득이에요. 하루 더 지켜보면 흐름이 또렷해집니다.", en: "With investing or big calls, patience pays — watch one more day and the flow clears.", ja: "投資や大きな決断は急がぬが得。もう一日見れば流れが見えてくる。" },
  { ko: "오늘 쓴 돈을 적어두면 신기하게 새는 곳이 보여요. 작은 메모 하나가 다음 달을 바꿉니다.", en: "Jot down today's spending and the leaks reveal themselves — one note shifts next month.", ja: "今日使ったお金を書けば漏れが見える。小さなメモが来月を変える。" },
  { ko: "들어온 여윳돈은 나를 위한 배움에 쓰면 좋은 날이에요. 작은 자기투자가 더 큰 보답으로 돌아옵니다.", en: "Spare money flows in — spend it on learning, and small self-investment returns bigger.", ja: "入った余裕資金は学びに使うと良い日。小さな自己投資が大きく返る。" },
]
const HEALTH: L[] = [
  { ko: '목·어깨에 피로가 몰리기 쉬워요. 한 시간에 한 번 어깨를 돌려주면 컨디션이 유지됩니다.', en: 'Fatigue gathers in neck and shoulders — roll them once an hour to hold your condition.', ja: '首・肩に疲れが溜まりやすい。一時間に一度回すと調子を保てる。' },
  { ko: '수분이 부족하면 집중력이 떨어져요. 물병을 곁에 두고 자주 한 모금씩 마시세요.', en: 'Dehydration drops focus — keep a bottle nearby and sip often.', ja: '水分不足は集中を下げる。ボトルを置いてこまめに一口。' },
  { ko: '소화 기운이 약해지는 날이에요. 과식을 피하고 천천히 먹으면 오후가 가벼워집니다.', en: 'Digestion runs weak — avoid overeating and eat slowly for a lighter afternoon.', ja: '消化が弱まる日。食べ過ぎを避け、ゆっくり食べると午後が軽い。' },
  { ko: '햇볕과 산책이 보약인 날이에요. 짧게라도 바깥 공기를 쐬면 기분과 면역이 함께 올라갑니다.', en: 'Sun and a walk are medicine today — brief fresh air lifts mood and immunity.', ja: '日光と散歩が薬の日。短くても外の空気で気分と免疫が上がる。' },
  { ko: '잠의 질이 운을 좌우해요. 오늘은 평소보다 30분 일찍 누우면 내일의 운이 달라집니다.', en: 'Sleep quality steers luck — lie down 30 min earlier and tomorrow shifts.', ja: '睡眠の質が運を左右。今日は30分早く横になると明日が変わる。' },
  { ko: '눈의 피로를 챙기세요. 화면을 20분 보면 20초 먼 곳을 보는 것만으로 컨디션이 유지됩니다.', en: 'Mind your eyes — after 20 min of screen, look far for 20 sec to hold up.', ja: '目の疲れに注意。20分画面を見たら20秒遠くを見れば保てる。' },
  { ko: "숨이 얕아지기 쉬운 날이에요. 일하다 한 번씩 깊게 들이쉬고 길게 내쉬면 뭉친 긴장이 스르르 풀립니다.", en: "Your breathing runs shallow today — pause to inhale deep and exhale long, and knotted tension melts away.", ja: "呼吸が浅くなりやすい日。時々深く吸って長く吐けば、こわばった緊張がほどける。" },
  { ko: "손발이 차가워지기 쉬운 날이에요. 따뜻한 차 한 잔이나 양말 한 켤레로 몸을 데우면 기운이 돕니다.", en: "Hands and feet chill easily today — warm up with a hot cup or an extra pair of socks and your energy circulates.", ja: "手足が冷えやすい日。温かいお茶や靴下一足で体を温めると、気が巡る。" },
  { ko: "오래 앉아 있으면 다리가 무거워져요. 한 시간에 한 번 일어나 종아리를 풀면 저녁까지 가뿐합니다.", en: "Sitting long makes the legs heavy — stand once an hour and loosen your calves to stay light till evening.", ja: "長く座ると脚が重くなる。一時間に一度立ってふくらはぎをほぐすと夕方まで軽い。" },
  { ko: "카페인에 기대고 싶어지는 날이에요. 커피 한 잔을 줄이고 견과류로 바꾸면 오후의 흔들림이 줄어듭니다.", en: "You may lean on caffeine today — swap one coffee for some nuts and your afternoon steadies.", ja: "カフェインに頼りたくなる日。コーヒーを一杯減らしてナッツに変えると午後のぶれが減る。" },
  { ko: "허리가 뻐근해지기 쉬운 날이에요. 의자에 깊이 앉아 등을 한 번 펴주면 자세도 운도 바로 섭니다.", en: "Your lower back may stiffen today — sit back deep and straighten up once, and both posture and luck align.", ja: "腰が張りやすい日。椅子に深く座り背を一度伸ばすと、姿勢も運も整う。" },
  { ko: "마음이 바빠 몸을 잊기 쉬운 날이에요. 좋아하는 노래 한 곡에 어깨 힘을 빼면 피로가 절반으로 줄어요.", en: "A busy mind makes you forget the body today — drop your shoulders to one favorite song and fatigue halves.", ja: "心が忙しく体を忘れがちな日。好きな一曲で肩の力を抜くと疲れが半分に。" },
]
const SUMMARY: L[] = [
  { ko: '서두르지 않으면 다 잘 풀리는 하루예요. 오늘의 키워드는 "천천히, 그러나 확실히".', en: 'A day that works out if you don’t rush. Keyword: “slow but sure.”', ja: '焦らなければ全て上手くいく一日。キーワードは「ゆっくり、確実に」。' },
  { ko: '먼저 손 내미는 사람이 이기는 하루예요. 오늘의 키워드는 "용기 있는 한 걸음".', en: 'The one who reaches first wins today. Keyword: “one brave step.”', ja: '先に手を差し出す人が勝つ一日。キーワードは「勇気ある一歩」。' },
  { ko: '작은 것을 챙기면 큰 것이 따라오는 하루예요. 오늘의 키워드는 "디테일이 운을 만든다".', en: 'Mind the small and the big follows. Keyword: “detail makes luck.”', ja: '小さな事を大切にすれば大きな事がついてくる。キーワードは「細部が運を作る」。' },
  { ko: '쉬어가는 것도 전략인 하루예요. 오늘의 키워드는 "비움이 채움".', en: 'Resting is strategy too. Keyword: “emptying is filling.”', ja: '休むのも戦略の一日。キーワードは「空けることが満たすこと」。' },
  { ko: '마음먹은 일을 시작하기 딱 좋은 하루예요. 오늘의 키워드는 "지금이 적기".', en: 'A perfect day to start what you’ve planned. Keyword: “now is the time.”', ja: '決めた事を始めるのに最適な一日。キーワードは「今が好機」。' },
  { ko: '주변과의 조화가 운을 키우는 하루예요. 오늘의 키워드는 "함께라서 더 멀리".', en: 'Harmony with others grows your luck. Keyword: “further, together.”', ja: '周りとの調和が運を育てる一日。キーワードは「一緒だからより遠くへ」。' },
  { ko: "고민하던 답이 마음속에 이미 있는 하루예요. 오늘의 키워드는 \"직감을 믿어요\".", en: "The answer you’ve puzzled over is already inside you. Keyword: “trust your gut.”", ja: "悩んでいた答えはもう心の中にある一日。キーワードは「直感を信じて」。" },
  { ko: "솔직한 한마디가 오해를 푸는 하루예요. 오늘의 키워드는 \"진심은 통한다\".", en: "One honest word clears up the misunderstanding. Keyword: “sincerity gets through.”", ja: "正直な一言が誤解を解く一日。キーワードは「真心は伝わる」。" },
  { ko: "가진 것을 헤아리면 마음이 넉넉해지는 하루예요. 오늘의 키워드는 \"감사가 복을 부른다\".", en: "Counting what you have leaves your heart full. Keyword: “gratitude calls fortune.”", ja: "持っているものを数えると心が豊かになる一日。キーワードは「感謝が福を呼ぶ」。" },
  { ko: "계획이 어긋나도 웃으며 돌아가면 되는 하루예요. 오늘의 키워드는 \"유연하게 흘러가요\".", en: "Even if the plan bends, smile and take the long way. Keyword: “flow flexibly.”", ja: "計画がずれても笑って回り道すればいい一日。キーワードは「柔軟に流れて」。" },
  { ko: "미뤄둔 일을 마무리하면 속이 후련해지는 하루예요. 오늘의 키워드는 \"끝맺음의 기쁨\".", en: "Wrapping up what you put off feels like a weight lifting. Keyword: “the joy of finishing.”", ja: "後回しにした事を片づけるとすっきりする一日。キーワードは「やり遂げる喜び」。" },
  { ko: "남과 비교하지 않으면 더 빛나는 하루예요. 오늘의 키워드는 \"나답게가 정답\".", en: "You shine brighter when you stop comparing. Keyword: “being yourself is the answer.”", ja: "人と比べなければもっと輝く一日。キーワードは「自分らしさが正解」。" },
]
const TIMES = ['오전 5~7시', '오전 7~9시', '오전 9~11시', '오전 11시~오후 1시', '오후 1~3시', '오후 3~5시', '오후 5~7시', '저녁 7~9시', '밤 9~11시', '밤 11시~새벽 1시', '새벽 1~3시', '새벽 3~5시']

export interface FortuneDetail {
  morning: L
  noon: L
  evening: L
  luckyTime: string
  place: L
  item: L
  food: L
  caution: L
  advice: L
  relation: L
  work: L
  wealth: L
  health: L
  summary: L
}

/** 일주 인덱스(생일·오늘)로 상세 운세 구성. 결정론적 — 같은 날 같은 결과. */
export function buildDetail(birthIdx: number, todayIdx: number): FortuneDetail {
  const i = todayIdx
  const j = birthIdx
  return {
    morning: pick(MORNING, i),
    noon: pick(NOON, i + 1),
    evening: pick(EVENING, i + 2),
    luckyTime: pick(TIMES, i + j),
    place: pick(PLACE, i * 2 + j),
    item: pick(ITEM, i * 3 + j),
    food: pick(FOOD, i + j * 2),
    caution: pick(CAUTION, i * 5 + j),
    advice: pick(ADVICE, i * 7 + j),
    relation: pick(RELATION, i * 2 + j * 3),
    work: pick(WORK, i * 4 + j),
    wealth: pick(WEALTH, i * 6 + j),
    health: pick(HEALTH, i * 8 + j),
    summary: pick(SUMMARY, i + j),
  }
}
