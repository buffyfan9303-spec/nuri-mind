import type { LikertItem } from './types'

/**
 * 주의력 회로 검사 — 20문항, 0~4 빈도 척도
 *
 * 학술 기반: ASRS v1.1 (WHO·하버드 의대 공동, Kessler et al. 2005, Psychological Medicine)
 * - core 6문항은 ASRS Part A 스크리너 구조를 따름 (음영 임계: 1~3번 '가끔(2)+', 4~6번 '자주(3)+')
 * - Part A에서 4개 이상 음영 구간 응답 시 임상적 선별 양성과 일치하는 신호로 해석
 * - 하위 척도: IN(주의 지속) / OR(조직화·계획) / TM(시간 관리) / IM(충동·과잉행동)
 * - DSM-5 성인 ADHD 진단 기준(부주의/과잉행동-충동 9개 증상군)과 Barkley(2008)의
 *   성인 실행기능 결손 연구를 참조해 일상 시나리오로 윤색
 */
export const ADHD_ITEMS: LikertItem[] = [
  {
    id: 'a01',
    sub: 'OR',
    core: true,
    coreThreshold: 2,
    text: {
      ko: '프로젝트의 큰 산은 넘었는데, 마지막 세부 마무리 단계에서 손을 놓아버려 마감 직전까지 방치한다',
      en: 'After clearing the hard part of a project, I drop the final detail work and leave it untouched until right before the deadline',
      ja: 'プロジェクトの山場は越えたのに、最後の細かい仕上げ段階で手が止まり、締切直前まで放置してしまう',
    },
  },
  {
    id: 'a02',
    sub: 'OR',
    core: true,
    coreThreshold: 2,
    text: {
      ko: '체계가 필요한 일을 시작할 때, 순서를 정하는 단계에서부터 막혀 한참을 헤맨다',
      en: 'When a task needs structure, I get stuck at the very step of ordering what to do first',
      ja: '段取りが必要な仕事を始めるとき、順序を決める段階からつまずいて長くさまよう',
    },
  },
  {
    id: 'a03',
    sub: 'TM',
    core: true,
    coreThreshold: 2,
    text: {
      ko: '약속이나 해야 할 일을, 알림이 울려주지 않으면 깜빡하고 지나친다',
      en: 'I forget appointments or obligations unless a notification rings for me',
      ja: '約束ややるべきことを、通知が鳴ってくれないと忘れて通り過ぎる',
    },
  },
  {
    id: 'a04',
    sub: 'TM',
    core: true,
    coreThreshold: 3,
    text: {
      ko: '머리를 많이 써야 하는 일은 "이따 하자"며 미루다가 한밤중이나 마감 코앞에야 시작한다',
      en: 'For mentally heavy tasks I say "later" and end up starting at midnight or right before the deadline',
      ja: '頭をたくさん使う仕事は「後でやろう」と先送りし、深夜や締切間際になってやっと始める',
    },
  },
  {
    id: 'a05',
    sub: 'IM',
    core: true,
    coreThreshold: 3,
    text: {
      ko: '오래 앉아 있어야 하는 자리에서 손발을 꼼지락거리거나 다리를 떨며 버틴다',
      en: 'In long seated situations I survive by fidgeting my hands or bouncing my leg',
      ja: '長く座っていなければならない場で、手足をもぞもぞさせたり貧乏ゆすりで耐える',
    },
  },
  {
    id: 'a06',
    sub: 'IM',
    core: true,
    coreThreshold: 3,
    text: {
      ko: '모터가 달린 것처럼, 가만히 쉬는 시간에도 무언가를 하고 있어야 마음이 놓인다',
      en: 'Like I\'m motor-driven, even during rest I only feel at ease while doing something',
      ja: 'モーターが付いているかのように、休み時間でも何かをしていないと落ち着かない',
    },
  },
  {
    id: 'a07',
    sub: 'IN',
    text: {
      ko: '지루하거나 반복적인 작업에서 오타, 숫자 밀림 같은 사소한 실수가 반복된다',
      en: 'In boring or repetitive work, small mistakes like typos or shifted numbers keep recurring',
      ja: '退屈で反復的な作業では、誤字や数字のズレのような小さなミスが繰り返される',
    },
  },
  {
    id: 'a08',
    sub: 'IN',
    text: {
      ko: '재미없는 일을 할 때 주의를 붙잡아 두는 것이 남들보다 훨씬 힘들게 느껴진다',
      en: 'Holding my attention on uninteresting work feels far harder for me than for others',
      ja: '面白くない仕事で注意をつなぎ留めるのが、他の人よりずっと大変に感じる',
    },
  },
  {
    id: 'a09',
    sub: 'IN',
    text: {
      ko: '상대가 바로 앞에서 말하고 있는데도, 정신을 차려 보면 머릿속은 다른 생각으로 떠나 있다',
      en: 'Even with someone talking right in front of me, I snap back to find my mind wandered elsewhere',
      ja: '相手が目の前で話しているのに、気づけば頭の中は別の考えに飛んでいる',
    },
  },
  {
    id: 'a10',
    sub: 'IN',
    text: {
      ko: '유튜브 한 편만 보려다가, 정신을 차리면 알고리즘을 따라 한 시간이 사라져 있다',
      en: 'I open one video, then wake up an hour later somewhere deep in the algorithm',
      ja: '動画を1本だけ見るつもりが、気づけばアルゴリズムに乗って1時間消えている',
    },
  },
  {
    id: 'a11',
    sub: 'OR',
    text: {
      ko: '책상, 파일, 메신저가 정리되어 있지 않아 필요한 것을 찾는 데 시간을 자주 쓴다',
      en: 'My desk, files, and chats are messy enough that I often lose time searching for things',
      ja: '机・ファイル・メッセンジャーが整理されておらず、必要な物を探すのに時間をよく使う',
    },
  },
  {
    id: 'a12',
    sub: 'TM',
    text: {
      ko: '과제에 걸릴 시간을 너무 낙관적으로 잡아서, 늘 예상의 두 배쯤 걸리고 마감에 쫓긴다',
      en: 'I estimate task time so optimistically that everything takes twice as long and deadlines chase me',
      ja: '作業時間を楽観的に見積もりすぎて、いつも予想の2倍かかり締切に追われる',
    },
  },
  {
    id: 'a13',
    sub: 'IN',
    text: {
      ko: '두 가지 일을 동시에 처리하려 하면 그중 하나를 반드시 흘리고 만다',
      en: 'When I juggle two tasks at once, I inevitably drop one of them',
      ja: '二つのことを同時に処理しようとすると、必ずどちらかを取りこぼす',
    },
  },
  {
    id: 'a14',
    sub: 'IM',
    text: {
      ko: '대화나 회의에서 상대의 말이 끝나기 전에 답이 먼저 튀어나온다',
      en: 'In conversations or meetings, my answer jumps out before the other person finishes',
      ja: '会話や会議で、相手の話が終わる前に答えが先に飛び出す',
    },
  },
  {
    id: 'a15',
    sub: 'IM',
    text: {
      ko: '줄 서기, 로딩 화면, 신호 대기처럼 "기다려야 하는 시간"이 유난히 고통스럽다',
      en: 'Waiting — queues, loading screens, red lights — feels uniquely painful to me',
      ja: '行列・ローディング画面・信号待ちのような「待つ時間」が異常に苦痛だ',
    },
  },
  {
    id: 'a16',
    sub: 'IM',
    text: {
      ko: '결과를 따져보기 전에 일단 질러 놓고(구매·발언·약속) 나중에 후회한다',
      en: 'I leap before weighing outcomes — purchases, remarks, promises — and regret it later',
      ja: '結果を考える前にまずやってしまい（購入・発言・約束）、後で後悔する',
    },
  },
  {
    id: 'a17',
    sub: 'IN',
    text: {
      ko: '주변 소음이나 알림이 울리면 하던 일의 맥이 완전히 끊겨 복귀까지 한참 걸린다',
      en: 'A noise or notification fully derails my task, and getting back takes a long while',
      ja: '周囲の物音や通知が鳴ると作業の流れが完全に切れ、復帰までかなりかかる',
    },
  },
  {
    id: 'a18',
    sub: 'OR',
    text: {
      ko: '시작한 일을 끝내기 전에 새로운 일을 벌여서, 미완성 프로젝트가 탭처럼 쌓여 있다',
      en: 'I open new projects before closing old ones — unfinished work stacks up like browser tabs',
      ja: '始めたことを終える前に新しいことを広げ、未完成プロジェクトがタブのように積まれている',
    },
  },
  {
    id: 'a19',
    sub: 'OR',
    text: {
      ko: '열쇠, 지갑, 휴대폰 같은 물건을 어디에 뒀는지 몰라 찾아다니는 일이 잦다',
      en: 'I frequently hunt for keys, wallet, or phone because I can\'t recall where I put them',
      ja: '鍵・財布・携帯をどこに置いたか分からず探し回ることが多い',
    },
  },
  {
    id: 'a20',
    sub: 'IM',
    text: {
      ko: '감정이 확 올라오면, 조절하기도 전에 말과 표정으로 그대로 새어 나간다',
      en: 'When emotion surges, it leaks straight into my words and face before I can regulate it',
      ja: '感情が一気に上がると、調節する前に言葉と表情にそのまま漏れ出る',
    },
  },
]
