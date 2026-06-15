import type { LikertItem } from './types'

/**
 * 번아웃 진단 — 20문항, 0~4 빈도 척도
 *
 * 학술 기반: Maslach 번아웃 3요인 구조 (Maslach & Jackson 1981; WHO ICD-11 직업 현상 정의)
 * - EX(정서적 소진) 8 / CY(냉소·거리두기) 7 / EF(직업 효능감, 역채점 — 높을수록 건강) 5
 * ※ 원척도(MBI)는 상업 라이선스 문항이므로, 3요인 구조만 차용해 전 문항을
 *   일상 시나리오로 독자 개발 (백서 §1의 윤색 원칙)
 * - ADHD 검사와 교차 분석: 소진은 주의력 증상을 흉내 냄 (결과 페이지 인사이트)
 */
export const BURNOUT_ITEMS: LikertItem[] = [
  { id: 'bo01', sub: 'EX', text: {
    ko: '아침에 눈을 뜨자마자 이미 퇴근(하교)하고 싶다',
    en: 'The moment I wake up, I already want to clock out',
    ja: '朝目覚めた瞬間、もう退勤（下校）したい' } },
  { id: 'bo02', sub: 'EX', text: {
    ko: '일과가 끝나면 사람을 만날 에너지가 1도 남아 있지 않다',
    en: 'After the day ends, zero energy remains for people',
    ja: '一日が終わると人に会うエネルギーが1ミリも残っていない' } },
  { id: 'bo03', sub: 'EX', text: {
    ko: '출근(등교) 생각만 해도 가슴이 답답해진다',
    en: 'Just thinking about going in makes my chest tighten',
    ja: '出勤（登校）を考えるだけで胸が苦しくなる' } },
  { id: 'bo04', sub: 'EX', text: {
    ko: '주말 내내 쉬어도 월요일엔 충전이 안 된 상태로 시작한다',
    en: 'Even after a full weekend, Monday starts uncharged',
    ja: '週末ずっと休んでも月曜は未充電のまま始まる' } },
  { id: 'bo05', sub: 'EX', text: {
    ko: '예전엔 쉽게 하던 일이 요즘은 산처럼 크게 느껴진다',
    en: 'Tasks that used to be easy now feel like mountains',
    ja: '昔は簡単だったことが最近は山のように感じる' } },
  { id: 'bo06', sub: 'EX', text: {
    ko: '별일 아닌 일에도 눈물이 나거나 울컥한다',
    en: 'Small things bring tears or a lump in my throat',
    ja: '大したことでもないのに涙が出たり込み上げたりする' } },
  { id: 'bo07', sub: 'EX', text: {
    ko: '몸의 경고 신호(두통·소화불량·불면)가 부쩍 잦아졌다',
    en: 'Body alarms — headaches, indigestion, insomnia — have spiked',
    ja: '体の警告（頭痛・消化不良・不眠）が急に増えた' } },
  { id: 'bo08', sub: 'EX', text: {
    ko: '"이러다 쓰러질 것 같다"는 생각이 진심으로 든다',
    en: '"I might actually collapse at this rate" feels genuinely true',
    ja: '「このままだと倒れそう」と本気で思う' } },
  { id: 'bo09', sub: 'CY', text: {
    ko: '일의 의미를 찾으려는 노력 자체를 그만뒀다',
    en: 'I\'ve stopped even trying to find meaning in the work',
    ja: '仕事の意味を探す努力自体をやめた' } },
  { id: 'bo10', sub: 'CY', text: {
    ko: '동료·고객·팀원의 요청이 전부 귀찮은 소음처럼 들린다',
    en: 'Requests from colleagues or clients all sound like annoying noise',
    ja: '同僚や顧客の依頼が全部面倒な雑音に聞こえる' } },
  { id: 'bo11', sub: 'CY', text: {
    ko: '"어차피 해도 안 바뀐다"가 입버릇이 됐다',
    en: '"Nothing changes anyway" has become my catchphrase',
    ja: '「どうせやっても変わらない」が口癖になった' } },
  { id: 'bo12', sub: 'CY', text: {
    ko: '회의 중에 몸만 앉아 있고 마음은 이미 딴 세상에 가 있다',
    en: 'In meetings my body attends while my mind has left the building',
    ja: '会議中、体だけ座って心は別世界に行っている' } },
  { id: 'bo13', sub: 'CY', text: {
    ko: '열정적이던 예전의 내가 다른 사람처럼 낯설게 느껴진다',
    en: 'The passionate old me feels like a stranger now',
    ja: '情熱的だった昔の自分が他人のように感じる' } },
  { id: 'bo14', sub: 'CY', text: {
    ko: '일 얘기가 나오면 비꼬는 말부터 튀어나온다',
    en: 'When work comes up, sarcasm fires first',
    ja: '仕事の話になると皮肉が先に飛び出す' } },
  { id: 'bo15', sub: 'CY', text: {
    ko: '조직(학교)의 목표가 나와 상관없는 남의 일처럼 느껴진다',
    en: 'The organization\'s goals feel like someone else\'s business',
    ja: '組織（学校）の目標が自分と無関係な他人事に感じる' } },
  { id: 'bo16', sub: 'EF', reverse: true, text: {
    ko: '내 일을 여전히 잘 해내고 있다고 느낀다',
    en: 'I still feel I\'m doing my job well',
    ja: '自分の仕事を今もうまくこなせていると感じる' } },
  { id: 'bo17', sub: 'EF', reverse: true, text: {
    ko: '문제가 생겨도 해결할 수 있다는 자신이 있다',
    en: 'When problems arise, I\'m confident I can solve them',
    ja: '問題が起きても解決できる自信がある' } },
  { id: 'bo18', sub: 'EF', reverse: true, text: {
    ko: '내 일이 누군가에게 도움이 되고 있다고 느낀다',
    en: 'I feel my work genuinely helps someone',
    ja: '自分の仕事が誰かの役に立っていると感じる' } },
  { id: 'bo19', sub: 'EF', reverse: true, text: {
    ko: '하루를 마치면 작게라도 성취감을 느낀다',
    en: 'At day\'s end I feel at least a small sense of achievement',
    ja: '一日の終わりに小さくても達成感を感じる' } },
  { id: 'bo20', sub: 'EF', reverse: true, text: {
    ko: '새로운 과제가 주어지면 "해볼 만하다"는 생각이 든다',
    en: 'New challenges still feel "worth a shot"',
    ja: '新しい課題が来ると「やれそう」と思える' } },
]
