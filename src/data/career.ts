import type { L, LikertItem } from './types'

/**
 * 진로 흥미 검사 — 홀랜드(Holland) RIASEC 이론 기반 **자체 문항** 30개(유형별 5문항). 표준화 규준 없음.
 *
 * 왜 공개 문항(O*NET Interest Profiler·Mini-IP)을 쓰지 않았나 (2026-09-27 확인):
 *  - https://www.onetcenter.org/license_tools.html — 원문 그대로 재배포는 CC BY-ND 4.0(번역본 배포 불가),
 *    수정·번역은 O*NET Tools Developer License만 허용.
 *  - https://www.onetcenter.org/license_toolsdev.html §3(b) — 번역·일부 사용 등 수정본을 내놓으려면 출시 **전에**
 *    표준(AERA/APA/NCME)에 맞는 타당화 연구(Validation Study)를 해야 하고, 실행 화면에 수정 고지를 띄워야 한다.
 *    한국어·일본어 타당화 연구가 없으므로 O*NET 문항은 쓰지 않고, 이론(6유형 정의)만 빌려 문항을 새로 썼다.
 *
 * 이론 근거: Holland, J. L. (1997). Making Vocational Choices (3rd ed.). PAR. — 6유형(현실·탐구·예술·사회·진취·관습).
 * 문항은 '활동'을 묘사하고 "얼마나 좋아하나"(1 싫다 ~ 5 좋다)로 답한다. 능력·적성을 묻지 않는다(흥미 ≠ 적성).
 * 결과는 점수 하나가 아니라 6유형 프로필 + 상위 3유형 코드(예: SAE). 인구 백분위를 만들지 않는다.
 */

export const HOLLAND = ['R', 'I', 'A', 'S', 'E', 'C'] as const
export type HollandType = (typeof HOLLAND)[number]

/** 유형 → 결과 페르소나 키 (animalTranslations.ts) */
export const HOLLAND_PERSONA: Record<HollandType, string> = {
  R: 'ox',
  I: 'monkey',
  A: 'dragon',
  S: 'llama',
  E: 'pony',
  C: 'pig',
}

/** 유형별 직업 예시 — 흥미가 맞는 사람이 많은 분야의 '예시'일 뿐, 적성·합격·성공을 뜻하지 않는다 */
export const HOLLAND_CAREERS: Record<HollandType, L> = {
  R: {
    ko: '정비사 · 항공 정비사 · 로봇·드론 기술자 · 소방관 · 목공 · 조경사 · 요리사',
    en: 'Mechanic · aircraft technician · robot/drone technician · firefighter · carpenter · landscaper · chef',
    ja: '整備士・航空整備士・ロボット/ドローン技術者・消防士・大工・造園士・料理人',
  },
  I: {
    ko: '연구원 · 데이터 분석가 · 개발자 · 의사 · 약사 · 엔지니어',
    en: 'Researcher · data analyst · software developer · doctor · pharmacist · engineer',
    ja: '研究員・データアナリスト・開発者・医師・薬剤師・エンジニア',
  },
  A: {
    ko: '디자이너 · 작가 · 음악가 · 영상 제작자 · 일러스트레이터 · 배우',
    en: 'Designer · writer · musician · video creator · illustrator · actor',
    ja: 'デザイナー・作家・音楽家・映像制作者・イラストレーター・俳優',
  },
  S: {
    ko: '교사 · 상담사 · 간호사 · 사회복지사 · 물리치료사 · 인사 담당자',
    en: 'Teacher · counselor · nurse · social worker · physical therapist · HR specialist',
    ja: '教師・カウンセラー・看護師・社会福祉士・理学療法士・人事担当',
  },
  E: {
    ko: '창업가 · 영업 · 마케터 · 관리자 · 변호사 · 기획자',
    en: 'Entrepreneur · sales · marketer · manager · lawyer · project planner',
    ja: '起業家・営業・マーケター・管理職・弁護士・企画職',
  },
  C: {
    ko: '회계사 · 세무사 · 사무 행정 · 은행원 · 데이터 관리자 · 품질 관리',
    en: 'Accountant · tax adviser · office administrator · bank clerk · data manager · quality control',
    ja: '会計士・税理士・事務職・銀行員・データ管理者・品質管理',
  },
}

export const CAREER_ITEMS: LikertItem[] = [
  /* R 현실형 — 손·도구·기계·몸을 쓰는 활동, 야외, 동식물 */
  { id: 'cr1', sub: 'R', text: { ko: '고장 난 물건을 직접 뜯어보고 고치기', en: 'Taking apart something broken and fixing it myself', ja: '壊れた物を自分で分解して直す' } },
  { id: 'cr2', sub: 'R', text: { ko: '공구로 가구나 선반을 조립하기', en: 'Putting together furniture or shelves with tools', ja: '工具で家具や棚を組み立てる' } },
  { id: 'cr3', sub: 'R', text: { ko: '텃밭이나 화분의 식물을 가꾸기', en: 'Looking after plants in a garden or pots', ja: '家庭菜園や鉢植えの植物を育てる' } },
  { id: 'cr4', sub: 'R', text: { ko: '기계나 장비를 직접 다뤄 보며 익히기', en: 'Learning by operating machines or equipment hands-on', ja: '機械や装置を実際に扱いながら覚える' } },
  { id: 'cr5', sub: 'R', text: { ko: '야외에서 나무를 심거나 무언가를 짓는 일 하기', en: 'Planting trees or building something outdoors', ja: '屋外で木を植えたり、何かを建てたりする' } },
  /* I 탐구형 — 원리 탐구·분석·실험·논리 */
  { id: 'ci1', sub: 'I', text: { ko: '어떤 일이 왜 일어나는지 원리를 파고들기', en: 'Digging into why something happens', ja: '物事がなぜ起きるのか原理を掘り下げる' } },
  { id: 'ci2', sub: 'I', text: { ko: '자료를 모아 분석하고 결론 내리기', en: 'Gathering data, analyzing it, and drawing a conclusion', ja: 'データを集めて分析し、結論を出す' } },
  { id: 'ci3', sub: 'I', text: { ko: '실험을 설계하고 결과를 확인하기', en: 'Designing an experiment and checking the results', ja: '実験を計画して結果を確かめる' } },
  { id: 'ci4', sub: 'I', text: { ko: '퍼즐이나 문제의 답을 스스로 따져 찾기', en: 'Reasoning my way to the answer of a puzzle or problem', ja: 'パズルや問題の答えを自分で考えて見つける' } },
  { id: 'ci5', sub: 'I', text: { ko: '과학·기술 이야기를 찾아 읽거나 보기', en: 'Looking up science and technology stories to read or watch', ja: '科学・技術の話を探して読んだり見たりする' } },
  /* A 예술형 — 창작·표현·디자인, 정해진 틀이 적은 활동 */
  { id: 'ca1', sub: 'A', text: { ko: '그림을 그리거나 무언가를 디자인하기', en: 'Drawing or designing something', ja: '絵を描いたり、何かをデザインしたりする' } },
  { id: 'ca2', sub: 'A', text: { ko: '이야기나 글을 직접 지어 쓰기', en: 'Writing my own stories or other writing', ja: '物語や文章を自分で作って書く' } },
  { id: 'ca3', sub: 'A', text: { ko: '음악을 연주하거나 불러 보기', en: 'Playing or singing music', ja: '音楽を演奏したり歌ったりする' } },
  { id: 'ca4', sub: 'A', text: { ko: '사진이나 영상을 찍고 편집하기', en: 'Shooting and editing photos or videos', ja: '写真や動画を撮って編集する' } },
  { id: 'ca5', sub: 'A', text: { ko: '연극·춤처럼 몸이나 목소리로 무언가를 표현하기', en: 'Expressing something with my body or voice, like acting or dance', ja: '演劇やダンスのように体や声で何かを表現する' } },
  /* S 사회형 — 가르치기·돌봄·상담·협력 */
  { id: 'cs1', sub: 'S', text: { ko: '다른 사람에게 무언가를 알려 주고 가르치기', en: 'Explaining and teaching something to others', ja: '人に何かを説明して教える' } },
  { id: 'cs2', sub: 'S', text: { ko: '고민이 있는 사람의 이야기를 들어 주기', en: 'Listening to someone who has a worry', ja: '悩みのある人の話を聞く' } },
  { id: 'cs3', sub: 'S', text: { ko: '아프거나 도움이 필요한 사람을 돌보기', en: 'Caring for people who are ill or need help', ja: '病気や助けが必要な人の世話をする' } },
  { id: 'cs4', sub: 'S', text: { ko: '도움이 필요한 이웃을 돕는 봉사활동 하기', en: 'Volunteering to help neighbors in need', ja: '助けが必要な近所の人を手伝うボランティアをする' } },
  { id: 'cs5', sub: 'S', text: { ko: '여러 사람이 서로 잘 어울리도록 돕기', en: 'Helping a group of people get along well', ja: 'みんなが仲良くやれるように手助けする' } },
  /* E 진취형 — 이끌기·설득·판매·시작하기 */
  { id: 'ce1', sub: 'E', text: { ko: '모임이나 팀을 이끌고 결정 내리기', en: 'Leading a group or team and making the calls', ja: '集まりやチームを率いて物事を決める' } },
  { id: 'ce2', sub: 'E', text: { ko: '사람들 앞에서 내 생각을 말하며 설득하기', en: 'Speaking in front of people to win them over to my idea', ja: '人前で自分の考えを話して説得する' } },
  { id: 'ce3', sub: 'E', text: { ko: '물건이나 아이디어를 사람들에게 팔기', en: 'Selling products or ideas to people', ja: '商品やアイデアを人に売る' } },
  { id: 'ce4', sub: 'E', text: { ko: '새로운 사업이나 프로젝트를 직접 시작하기', en: 'Starting a new business or project myself', ja: '新しい事業やプロジェクトを自分で立ち上げる' } },
  { id: 'ce5', sub: 'E', text: { ko: '가격을 흥정하거나 조건을 협상하기', en: 'Bargaining over a price or negotiating terms', ja: '値段を交渉したり条件を話し合ったりする' } },
  /* C 관습형 — 정리·기록·숫자·절차·정확성 */
  { id: 'cc1', sub: 'C', text: { ko: '서류나 파일을 기준에 맞게 정리하기', en: 'Sorting documents or files by clear rules', ja: '書類やファイルを基準どおりに整理する' } },
  { id: 'cc2', sub: 'C', text: { ko: '숫자를 표로 정리하고 계산이 맞는지 확인하기', en: 'Putting numbers into a table and checking they add up', ja: '数字を表にまとめ、計算が合っているか確かめる' } },
  { id: 'cc3', sub: 'C', text: { ko: '용돈이나 일정을 표로 관리하기', en: 'Keeping track of my money or schedule in a table', ja: 'お小遣いや予定を表で管理する' } },
  { id: 'cc4', sub: 'C', text: { ko: '정해진 절차대로 일을 처리하기', en: 'Handling tasks by a set procedure', ja: '決まった手順どおりに物事を処理する' } },
  { id: 'cc5', sub: 'C', text: { ko: '기록을 다시 살펴 틀린 곳을 찾아내기', en: 'Going over records to catch mistakes', ja: '記録を見直して間違いを見つける' } },
]
