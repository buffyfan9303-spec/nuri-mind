import type { LikertItem } from './types'

/**
 * 도파민 디톡스 검사 (디지털 절제력) — 20문항, 0~4 빈도 척도
 *
 * 학술 기반: SAS-SV (Smartphone Addiction Scale-Short Version, Kwon et al. 2013, PLOS ONE)
 * + 행동중독 4요소 모델(Griffiths 2005): 갈망/금단 · 조절 실패 · 일상 침식 · 내성
 * - CR(갈망·금단) 5 / CT(조절 실패) 5 / LF(일상 침식) 5 / TL(내성) 5
 * - 숏폼·새로고침·스크린타임 등 2020년대 디지털 시나리오로 윤색
 * - 결과 → 스트릭·데일리 퀴즈로 "절제력 훈련" 퍼널 연결
 */
export const DOPA_ITEMS: LikertItem[] = [
  { id: 'dp01', sub: 'CR', text: {
    ko: '폰이 손에 없으면 5분도 안 돼 허전하고 초조해진다',
    en: 'Without my phone, restlessness kicks in within 5 minutes',
    ja: 'スマホが手元にないと5分も経たず落ち着かなくなる' } },
  { id: 'dp02', sub: 'CR', text: {
    ko: '알림이 오지 않았는데도 진동을 느낀 것 같아 폰을 확인한다',
    en: 'I check my phone for vibrations that never happened',
    ja: '通知が来てないのに振動を感じた気がして確認する' } },
  { id: 'dp03', sub: 'CR', text: {
    ko: '화장실에 폰 없이 들어가면 뭔가 잘못된 기분이 든다',
    en: 'Entering the bathroom phoneless feels fundamentally wrong',
    ja: 'トイレにスマホなしで入ると何かが間違っている気がする' } },
  { id: 'dp04', sub: 'CR', text: {
    ko: '잠들기 직전까지 "딱 하나만 더"를 반복한다',
    en: 'Right up to sleep, it\'s "just one more" on repeat',
    ja: '寝る直前まで「あと1本だけ」を繰り返す' } },
  { id: 'dp05', sub: 'CR', text: {
    ko: '인터넷이 끊기면 짜증 게이지가 즉시 차오른다',
    en: 'When the internet drops, my irritation meter fills instantly',
    ja: 'ネットが切れるとイライラゲージが即満タンになる' } },
  { id: 'dp06', sub: 'CT', text: {
    ko: '"5분만 봐야지"가 정신 차리면 1시간이 되어 있다',
    en: '"Just 5 minutes" becomes an hour before I snap out of it',
    ja: '「5分だけ」が気づけば1時間になっている' } },
  { id: 'dp07', sub: 'CT', text: {
    ko: '숏폼 앱을 닫고 3초 만에 다시 여는 나를 발견한다',
    en: 'I close the short-form app and reopen it 3 seconds later',
    ja: 'ショート動画アプリを閉じて3秒後また開く自分に気づく' } },
  { id: 'dp08', sub: 'CT', text: {
    ko: '사용 시간을 줄이려는 시도가 번번이 실패로 끝났다',
    en: 'Every attempt to cut screen time has ended in failure',
    ja: '使用時間を減らす試みがことごとく失敗に終わった' } },
  { id: 'dp09', sub: 'CT', text: {
    ko: '공부·일 중에도 폰이 시야에 있으면 결국 집어 들게 된다',
    en: 'If my phone is in sight while working, I eventually grab it',
    ja: '勉強・仕事中でも視界にスマホがあると結局手に取る' } },
  { id: 'dp10', sub: 'CT', text: {
    ko: '스크린타임 경고를 보고도 "오늘은 계속"을 누른다',
    en: 'I see the screen-time warning and tap "ignore for today"',
    ja: 'スクリーンタイム警告を見ても「今日は続行」を押す' } },
  { id: 'dp11', sub: 'LF', text: {
    ko: '숏폼을 보느라 수면 시간이 밀리는 날이 잦다',
    en: 'Short-form videos regularly push back my bedtime',
    ja: 'ショート動画のせいで睡眠時間がずれる日が多い' } },
  { id: 'dp12', sub: 'LF', text: {
    ko: '밥 먹을 때 영상이 없으면 밥이 잘 넘어가지 않는다',
    en: 'Eating without a video feels incomplete — food barely goes down',
    ja: '食事中に動画がないとご飯が進まない' } },
  { id: 'dp13', sub: 'LF', text: {
    ko: '해야 할 일을 미뤄두고 피드를 새로고침하고 있다',
    en: 'I refresh feeds while my to-dos sit untouched',
    ja: 'やるべきことを放置してフィードを更新している' } },
  { id: 'dp14', sub: 'LF', text: {
    ko: '가족·친구와 함께 있을 때도 대화보다 폰을 본다',
    en: 'Even with family or friends, the phone wins over conversation',
    ja: '家族や友人といる時も会話よりスマホを見る' } },
  { id: 'dp15', sub: 'LF', text: {
    ko: '영화 한 편(2시간)을 끊지 않고 보는 게 어려워졌다',
    en: 'Watching a 2-hour film without pausing has become hard',
    ja: '映画1本（2時間）を途切れず観るのが難しくなった' } },
  { id: 'dp16', sub: 'TL', text: {
    ko: '전보다 더 자극적인 콘텐츠를 찾게 된다',
    en: 'I keep seeking more extreme content than before',
    ja: '以前より刺激的なコンテンツを求めるようになった' } },
  { id: 'dp17', sub: 'TL', text: {
    ko: '같은 시간을 봐도 예전만큼의 재미가 느껴지지 않는다',
    en: 'The same hours of watching deliver less fun than they used to',
    ja: '同じ時間見ても昔ほどの楽しさを感じない' } },
  { id: 'dp18', sub: 'TL', text: {
    ko: '1.5배속이나 스킵 없이는 영상이 답답하게 느껴진다',
    en: 'Without 1.5x speed or skipping, videos feel unbearably slow',
    ja: '1.5倍速やスキップなしでは動画がもどかしい' } },
  { id: 'dp19', sub: 'TL', text: {
    ko: '하루 사용 시간이 6개월 전보다 확실히 늘었다',
    en: 'My daily usage has clearly grown over the past 6 months',
    ja: '1日の使用時間が半年前より確実に増えた' } },
  { id: 'dp20', sub: 'TL', text: {
    ko: '긴 글을 읽다가 중간에 요약본부터 찾는 습관이 생겼다',
    en: 'Mid-article, I now hunt for the summary instead',
    ja: '長文を読む途中で要約を探す癖がついた' } },
]
