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
]
const NOON: L[] = [
  { ko: '점심 전후로 사람과의 대화에서 좋은 정보가 흘러나와요. 가볍게 묻고 잘 들어주면 뜻밖의 힌트를 얻습니다.', en: 'Around midday, good info slips out in conversation — ask lightly, listen well, gain a hint.', ja: '昼前後、会話から良い情報が。軽く尋ね、よく聞くとヒントが。' },
  { ko: '오후엔 집중력이 잠깐 흐트러질 수 있어요. 중요한 일은 오전에 끝내고, 오후엔 사람을 만나는 게 유리합니다.', en: 'Focus dips in the afternoon — finish key work by noon, save the afternoon for people.', ja: '午後は集中が一瞬乱れがち。重要な事は午前に、午後は人と会うのが吉。' },
  { ko: '점심 메뉴를 평소와 다르게 골라보세요. 작은 변화가 오후의 기분과 운의 흐름을 바꿉니다.', en: 'Pick a different lunch than usual — a small change shifts your afternoon mood and luck.', ja: '昼を普段と違うものに。小さな変化が午後の運を変える。' },
  { ko: '한낮엔 잠깐 햇볕을 쬐며 걸으면 막혔던 생각이 풀려요. 5분 산책이 오후의 능률을 두 배로 만듭니다.', en: 'A short sunny walk at noon unblocks stuck thoughts — 5 minutes doubles your afternoon.', ja: '日中、日を浴びて歩くと詰まりが解ける。5分の散歩が午後を倍に。' },
  { ko: '오후엔 돈 쓸 일이 생기기 쉬워요. 지갑을 열기 전에 "정말 필요한가" 한 번만 물어보세요.', en: 'Spending temptations rise in the afternoon — ask “do I really need this?” once first.', ja: '午後は出費が増えがち。財布を開く前に「本当に必要？」と一度。' },
  { ko: '점심 이후의 나른함은 당신 탓이 아니에요. 짧은 휴식을 죄책감 없이 챙기면 저녁까지 운이 갑니다.', en: 'Post-lunch drowsiness isn’t your fault — take a guilt-free break and luck carries to evening.', ja: '昼後のだるさはあなたのせいではない。罪悪感なく休めば夕方まで運が続く。' },
]
const EVENING: L[] = [
  { ko: '저녁엔 하루를 돌아보기 좋아요. 잘한 일 하나를 떠올리며 스스로를 칭찬하면 내일의 운이 쌓입니다.', en: 'Evening is for reflection — recall one thing you did well, and tomorrow’s luck builds.', ja: '夕方は振り返りに。よくやった事を一つ思い、自分を褒めると明日の運が貯まる。' },
  { ko: '밤엔 충동적인 연락이나 결정을 피하세요. 하루 자고 나면 생각이 또렷해져 더 좋은 선택을 합니다.', en: 'Avoid impulsive messages or decisions at night — sleep on it for a clearer, better choice.', ja: '夜は衝動的な連絡や決断を避けて。一晩寝れば、より良い選択ができる。' },
  { ko: '저녁의 따뜻한 한 끼와 가벼운 정리가 운을 마무리해요. 오늘의 피로를 내일로 넘기지 마세요.', en: 'A warm dinner and light tidy seal the day’s luck — don’t carry today’s fatigue to tomorrow.', ja: '夕の温かい一食と軽い片付けが運を締める。今日の疲れを明日へ持ち越さないで。' },
  { ko: '밤늦게 좋은 아이디어가 떠오를 수 있어요. 메모해 두되 실행은 내일 아침으로 미루는 게 좋습니다.', en: 'A good idea may strike late — note it, but act on it tomorrow morning.', ja: '夜遅く良い案が浮かぶかも。メモして、実行は明朝に。' },
  { ko: '저녁엔 가까운 사람에게 먼저 안부를 전해 보세요. 오늘 쌓인 인연의 점수가 한 단계 올라갑니다.', en: 'Reach out to someone close this evening — your relationship score levels up.', ja: '夕方、近しい人へ先に一言を。縁の点数が一段上がる。' },
  { ko: '잠들기 전 휴대폰을 30분만 멀리하면 수면운이 좋아져 내일 컨디션이 확 달라집니다.', en: 'Put the phone away 30 min before bed — sleep luck rises and tomorrow feels different.', ja: '就寝30分前にスマホを離すと睡眠運が上がり、明日の調子が変わる。' },
]
const PLACE: L[] = [
  { ko: '물이 보이는 곳(강·바다·카페 창가)', en: 'somewhere with water in view (river, sea, a window café)', ja: '水が見える場所（川・海・窓際カフェ）' },
  { ko: '높은 곳이나 전망 좋은 자리', en: 'a high place or spot with a good view', ja: '高い場所や見晴らしの良い席' },
  { ko: '초록이 있는 공원·산책로', en: 'a green park or walking path', ja: '緑のある公園・散歩道' },
  { ko: '사람이 적당히 북적이는 번화가', en: 'a moderately lively downtown', ja: '程よく賑わう繁華街' },
  { ko: '조용한 서점이나 도서관', en: 'a quiet bookstore or library', ja: '静かな書店や図書館' },
  { ko: '평소 잘 안 가던 새로운 동네', en: 'a new neighborhood you rarely visit', ja: '普段行かない新しい街' },
]
const ITEM: L[] = [
  { ko: '손목시계나 팔찌 등 손목에 닿는 것', en: 'a watch or bracelet — something on the wrist', ja: '腕時計やブレスレットなど手首に触れる物' },
  { ko: '향이 좋은 작은 소품(립밤·핸드크림)', en: 'a nice-scented small item (lip balm, hand cream)', ja: '良い香りの小物（リップ・ハンドクリーム）' },
  { ko: '평소 안 쓰던 색의 펜이나 노트', en: 'a pen or notebook in an unusual color', ja: '普段使わない色のペンやノート' },
  { ko: '동전 지갑이나 작은 파우치', en: 'a coin purse or small pouch', ja: '小銭入れや小さなポーチ' },
  { ko: '귀걸이·반지 같은 작은 금속 장신구', en: 'a small metal accessory (earrings, ring)', ja: 'ピアス・指輪など小さな金属の装身具' },
  { ko: '손수건이나 작은 거울', en: 'a handkerchief or pocket mirror', ja: 'ハンカチや小さな鏡' },
]
const FOOD: L[] = [
  { ko: '따뜻한 국물 요리', en: 'a warm soup dish', ja: '温かい汁物' },
  { ko: '제철 과일이나 샐러드', en: 'seasonal fruit or salad', ja: '旬の果物やサラダ' },
  { ko: '견과류와 차 한 잔', en: 'nuts with a cup of tea', ja: 'ナッツとお茶一杯' },
  { ko: '매콤한 음식(스트레스 해소)', en: 'something spicy (to release stress)', ja: '辛い物（ストレス解消）' },
  { ko: '담백한 흰살 생선이나 두부', en: 'mild white fish or tofu', ja: 'あっさりした白身魚や豆腐' },
  { ko: '달콤한 디저트 한 조각', en: 'a slice of sweet dessert', ja: '甘いデザート一切れ' },
]
const CAUTION: L[] = [
  { ko: '말이 평소보다 빨라지기 쉬워요. 중요한 자리에선 한 박자 늦춰 말하면 오해를 막습니다.', en: 'You may speak faster than usual — slow a beat in important moments to avoid misreads.', ja: '言葉が早くなりがち。大事な場面では一拍遅く話すと誤解を防ぐ。' },
  { ko: '작은 지출이 새어나가기 쉬운 날이에요. 카드보다 현금을 쓰면 씀씀이가 눈에 보입니다.', en: 'Small spends leak today — use cash over card to see where it goes.', ja: '小さな出費が漏れやすい日。カードより現金で使うと見える。' },
  { ko: '욱하는 감정이 올라올 수 있어요. 답장을 보내기 전에 3초만 멈추면 후회할 일이 사라집니다.', en: 'A flare of temper may rise — pause 3 seconds before replying and regret vanishes.', ja: 'カッとなりやすい。返信前に3秒止まれば後悔が消える。' },
  { ko: '약속 시간을 착각하기 쉬운 날이에요. 오늘만큼은 일정을 한 번 더 확인하세요.', en: 'Easy to mix up appointment times today — double-check your schedule.', ja: '約束の時間を勘違いしやすい。今日は予定を再確認して。' },
  { ko: '귀가 얇아지기 쉬워요. 솔깃한 제안일수록 하루 자고 결정하면 손해를 피합니다.', en: 'You’re easily swayed — sleep on any tempting offer to dodge a loss.', ja: '人の話に流されやすい。うまい話ほど一晩置いて決めると損を避ける。' },
  { ko: '몸이 보내는 작은 신호(두통·뻐근함)를 무시하지 마세요. 일찍 쉬는 게 가장 큰 이득입니다.', en: 'Don’t ignore small body signals (headache, stiffness) — resting early pays most.', ja: '体の小さな信号（頭痛・こり）を無視しないで。早めの休息が一番得。' },
]
const ADVICE: L[] = [
  { ko: '미뤄둔 연락 하나를 오늘 끝내세요. 마음의 짐 하나가 사라지면 다른 운도 함께 풀립니다.', en: 'Finish one postponed message today — a weight lifts and other luck loosens too.', ja: '先延ばしの連絡を一つ片付けて。心の荷が消え、他の運も解ける。' },
  { ko: '평소 고맙던 사람에게 짧게라도 감사를 표현해 보세요. 오늘 한 말이 멀리까지 좋은 인연으로 퍼집니다.', en: 'Thank someone you appreciate, even briefly — today’s words spread far as good ties.', ja: '感謝している人へ短くでも一言。今日の言葉が遠くまで良縁に広がる。' },
  { ko: '오래 망설이던 작은 일을 딱 하나만 시작해 보세요. 시작 자체가 오늘의 가장 큰 행운입니다.', en: 'Start just one thing you’ve hesitated on — starting itself is today’s biggest luck.', ja: '迷っていた小さな事を一つだけ始めて。始める事こそ今日最大の幸運。' },
  { ko: '오늘은 새로운 것을 배우기 좋은 날이에요. 짧은 영상 하나, 책 한 챕터가 미래의 씨앗이 됩니다.', en: 'A good day to learn — one short video or book chapter is a seed for your future.', ja: '学びに良い日。短い動画一本、本一章が未来の種に。' },
  { ko: '몸을 움직이면 운이 따라와요. 한 정거장 먼저 내려 걷거나 계단을 이용해 보세요.', en: 'Move your body and luck follows — get off a stop early or take the stairs.', ja: '体を動かすと運がつく。一駅前で降りて歩く、階段を使う。' },
  { ko: '오늘 번 작은 성취를 기록해 두세요. 적어두는 습관이 한 달 뒤 큰 자신감으로 돌아옵니다.', en: 'Log today’s small wins — the habit returns as big confidence in a month.', ja: '今日の小さな成果を記録して。書く習慣が一月後に大きな自信に。' },
]
const RELATION: L[] = [
  { ko: '대인관계운이 활짝 열려요. 먼저 다가가면 오래 가는 인연이 시작될 수 있는 날입니다.', en: 'Relationships open wide — reach out first and a lasting bond may begin.', ja: '対人運が開く。先に近づけば長く続く縁が始まるかも。' },
  { ko: '오해가 생기기 쉬운 날이에요. 문자보다 직접 목소리로 전하면 마음이 정확히 전달됩니다.', en: 'Misunderstandings come easy — a voice call lands your heart better than text.', ja: '誤解が生じやすい。文字より声で伝えると心が正確に届く。' },
  { ko: '누군가 당신의 도움을 기다리고 있어요. 작은 손길 하나가 큰 고마움으로 돌아옵니다.', en: 'Someone awaits your help — a small hand returns as big gratitude.', ja: '誰かがあなたの助けを待っている。小さな手助けが大きな感謝に。' },
  { ko: '오늘은 듣는 사람이 이기는 날이에요. 말을 줄이고 끄덕여 주면 신뢰가 한 뼘 자랍니다.', en: 'Today the listener wins — talk less, nod more, and trust grows.', ja: '今日は聞く人が勝つ。言葉を減らし頷けば信頼が育つ。' },
  { ko: '가까운 사이일수록 예의를 챙기면 관계가 더 단단해져요. 익숙함에 무례해지지 않도록.', en: 'Mind manners even with the close — familiarity shouldn’t turn rude.', ja: '近い相手ほど礼を。慣れが無礼にならないように。' },
  { ko: '새로운 만남의 기운이 있어요. 평소 안 가던 모임이나 자리에 한 번 나가보면 좋은 인연이 있습니다.', en: 'A new-meeting vibe is here — show up somewhere unfamiliar and good ties await.', ja: '新しい出会いの気配。普段行かない集まりに顔を出すと良縁が。' },
]
const WORK: L[] = [
  { ko: '집중력이 살아나는 날이에요. 가장 어려운 과제를 먼저 잡으면 나머지는 가볍게 끝납니다.', en: 'Focus is alive — grab the hardest task first and the rest goes light.', ja: '集中が冴える日。一番難しい課題を先に掴めば残りは軽い。' },
  { ko: '협업운이 좋아요. 혼자 끙끙대지 말고 한 사람에게 물어보면 길이 빨리 열립니다.', en: 'Teamwork luck is good — ask one person instead of struggling alone.', ja: '協業運が良い。一人で抱えず誰かに尋ねると道が早く開く。' },
  { ko: '꼼꼼함이 빛나는 날이에요. 마지막에 한 번 더 검토하면 큰 실수를 막고 신뢰를 얻습니다.', en: 'A day for thoroughness — one final review prevents a big mistake and earns trust.', ja: '丁寧さが光る日。最後にもう一度確認すれば大ミスを防ぎ信頼を得る。' },
  { ko: '새 아이디어가 인정받기 좋은 날이에요. 작게라도 제안해 두면 기회로 이어집니다.', en: 'New ideas land well today — propose even a small one and it leads to a chance.', ja: '新しい案が認められやすい。小さくても提案すれば機会に。' },
  { ko: '욕심내면 탈이 나요. 오늘은 벌여둔 일을 마무리하는 데 집중하는 게 이득입니다.', en: 'Overreaching backfires — focus on finishing what’s open and you gain.', ja: '欲張ると崩れる。今日は広げた仕事の仕上げに集中が得。' },
  { ko: '윗사람·거래처와의 자리에서 운이 트여요. 예의 바른 한마디가 의외의 기회를 부릅니다.', en: 'Luck opens with seniors or clients — a courteous word invites a surprise chance.', ja: '目上・取引先との場で運が開く。礼儀ある一言が思わぬ機会を呼ぶ。' },
]
const WEALTH: L[] = [
  { ko: '금전운이 안정적이에요. 큰 지출은 미루고 작은 저축을 시작하면 흐름이 좋아집니다.', en: 'Money luck is stable — delay big spends, start small savings, and flow improves.', ja: '金運は安定。大きな出費は先送り、小さな貯蓄を始めると流れが良い。' },
  { ko: '예상 밖의 작은 수입이나 환급이 있을 수 있어요. 들어온 돈의 일부는 꼭 남겨두세요.', en: 'A small unexpected income or refund may come — keep part of it aside.', ja: '予想外の小収入や還付があるかも。入った分の一部は必ず残して。' },
  { ko: '충동구매를 조심할 날이에요. 장바구니에 담고 하루만 기다리면 절반은 안 사게 됩니다.', en: 'Beware impulse buys — leave it in the cart a day and half won’t be bought.', ja: '衝動買いに注意。カートに入れて一日待てば半分は買わずに済む。' },
  { ko: '돈 관련 정보가 들어오기 좋은 날이에요. 솔깃한 말은 출처를 한 번 더 확인하면 안전합니다.', en: 'Money info comes in — double-check the source of any tempting tip to stay safe.', ja: 'お金の情報が入りやすい。うまい話は出所を再確認すれば安全。' },
  { ko: '나눔이 복을 부르는 날이에요. 작은 한턱이나 기부가 더 큰 금전운으로 돌아옵니다.', en: 'Sharing invites fortune — a small treat or donation returns as bigger money luck.', ja: '分かち合いが福を呼ぶ。小さなおごりや寄付が大きな金運に。' },
  { ko: '고정 지출을 점검하기 좋은 날이에요. 안 쓰는 구독 하나만 정리해도 한 달이 가벼워집니다.', en: 'Good day to review fixed costs — cancel one unused subscription and the month lightens.', ja: '固定費の見直しに良い日。使わない定期課金を一つ整理で一月が軽く。' },
]
const HEALTH: L[] = [
  { ko: '목·어깨에 피로가 몰리기 쉬워요. 한 시간에 한 번 어깨를 돌려주면 컨디션이 유지됩니다.', en: 'Fatigue gathers in neck and shoulders — roll them once an hour to hold your condition.', ja: '首・肩に疲れが溜まりやすい。一時間に一度回すと調子を保てる。' },
  { ko: '수분이 부족하면 집중력이 떨어져요. 물병을 곁에 두고 자주 한 모금씩 마시세요.', en: 'Dehydration drops focus — keep a bottle nearby and sip often.', ja: '水分不足は集中を下げる。ボトルを置いてこまめに一口。' },
  { ko: '소화 기운이 약해지는 날이에요. 과식을 피하고 천천히 먹으면 오후가 가벼워집니다.', en: 'Digestion runs weak — avoid overeating and eat slowly for a lighter afternoon.', ja: '消化が弱まる日。食べ過ぎを避け、ゆっくり食べると午後が軽い。' },
  { ko: '햇볕과 산책이 보약인 날이에요. 짧게라도 바깥 공기를 쐬면 기분과 면역이 함께 올라갑니다.', en: 'Sun and a walk are medicine today — brief fresh air lifts mood and immunity.', ja: '日光と散歩が薬の日。短くても外の空気で気分と免疫が上がる。' },
  { ko: '잠의 질이 운을 좌우해요. 오늘은 평소보다 30분 일찍 누우면 내일의 운이 달라집니다.', en: 'Sleep quality steers luck — lie down 30 min earlier and tomorrow shifts.', ja: '睡眠の質が運を左右。今日は30分早く横になると明日が変わる。' },
  { ko: '눈의 피로를 챙기세요. 화면을 20분 보면 20초 먼 곳을 보는 것만으로 컨디션이 유지됩니다.', en: 'Mind your eyes — after 20 min of screen, look far for 20 sec to hold up.', ja: '目の疲れに注意。20分画面を見たら20秒遠くを見れば保てる。' },
]
const SUMMARY: L[] = [
  { ko: '서두르지 않으면 다 잘 풀리는 하루예요. 오늘의 키워드는 "천천히, 그러나 확실히".', en: 'A day that works out if you don’t rush. Keyword: “slow but sure.”', ja: '焦らなければ全て上手くいく一日。キーワードは「ゆっくり、確実に」。' },
  { ko: '먼저 손 내미는 사람이 이기는 하루예요. 오늘의 키워드는 "용기 있는 한 걸음".', en: 'The one who reaches first wins today. Keyword: “one brave step.”', ja: '先に手を差し出す人が勝つ一日。キーワードは「勇気ある一歩」。' },
  { ko: '작은 것을 챙기면 큰 것이 따라오는 하루예요. 오늘의 키워드는 "디테일이 운을 만든다".', en: 'Mind the small and the big follows. Keyword: “detail makes luck.”', ja: '小さな事を大切にすれば大きな事がついてくる。キーワードは「細部が運を作る」。' },
  { ko: '쉬어가는 것도 전략인 하루예요. 오늘의 키워드는 "비움이 채움".', en: 'Resting is strategy too. Keyword: “emptying is filling.”', ja: '休むのも戦略の一日。キーワードは「空けることが満たすこと」。' },
  { ko: '마음먹은 일을 시작하기 딱 좋은 하루예요. 오늘의 키워드는 "지금이 적기".', en: 'A perfect day to start what you’ve planned. Keyword: “now is the time.”', ja: '決めた事を始めるのに最適な一日。キーワードは「今が好機」。' },
  { ko: '주변과의 조화가 운을 키우는 하루예요. 오늘의 키워드는 "함께라서 더 멀리".', en: 'Harmony with others grows your luck. Keyword: “further, together.”', ja: '周りとの調和が運を育てる一日。キーワードは「一緒だからより遠くへ」。' },
]
const TIMES = ['오전 5~7시', '오전 9~11시', '정오 12~1시', '오후 2~4시', '저녁 6~8시', '밤 9~11시']

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
