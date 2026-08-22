import { DICT } from './translations'

/**
 * 성향 나침반(MBTI) UI 키 — translations.ts(대형 파일) 무수정으로 추가하는 증강 모듈.
 * main.tsx에서 부팅 시 1회 import(부수효과) → 이후 t()에서 일반 키처럼 조회됨.
 */
Object.assign(DICT.ko, {
  'test.mbti.name': '성향 나침반',
  'test.mbti.short': '성향(MBTI)',
  'test.mbti.desc': '에너지·정보·판단·생활 4축의 내 선호를 연속 점수로 재는 융 유형론 기반 검사',
  'intro.mbti.basis':
    '융의 심리유형론(1921)과 마이어스-브릭스 4축(E/I·S/N·T/F·J/P)을 바탕으로, 유형 꼬리표 대신 축별 연속 점수(%)를 주 결과로 보여주는 검사예요. 각 축은 성격심리학의 빅파이브 요인과 상당 부분 겹친다는 것이 확인되어 있어요(McCrae & Costa 1989).',
  'intro.mbti.c1': '정답도 좋은 유형도 없어요 — 평소의 나로 답해요',
  'intro.mbti.c2': '되고 싶은 모습 말고, 실제로 편한 쪽을 골라요',
  'intro.mbti.c3': '결과는 유형 확정이 아니라 오늘의 선호 스냅샷이에요',
  'result.gauge.mbti': '선호 명료도',
  'result.mbtiClarity': '4축 선호가 얼마나 뚜렷한지 (경계 축이 많을수록 낮아요)',
  'result.mbtiBorder': '경계',
  'sub.EI': '에너지 방향 (E–I)',
  'sub.SN': '정보 수집 (N–S)',
  'sub.TF': '판단 기준 (T–F)',
  'sub.JP': '생활 양식 (P–J)',
})

Object.assign(DICT.en, {
  'test.mbti.name': 'Type Compass',
  'test.mbti.short': 'MBTI Style',
  'test.mbti.desc': 'A Jungian-typology test scoring your preferences on 4 axes as continuous percentages',
  'intro.mbti.basis':
    "Based on Jung's Psychological Types (1921) and the Myers-Briggs axes (E/I·S/N·T/F·J/P), this test reports continuous per-axis scores instead of a fixed type label. Each axis substantially overlaps a Big Five factor (McCrae & Costa 1989).",
  'intro.mbti.c1': 'No right answers, no good types — answer as your usual self',
  'intro.mbti.c2': 'Pick what actually feels comfortable, not who you want to be',
  'intro.mbti.c3': "The result is today's preference snapshot, not a fixed type",
  'result.gauge.mbti': 'Preference clarity',
  'result.mbtiClarity': 'How distinct your 4-axis preferences are (borderline axes lower it)',
  'result.mbtiBorder': 'borderline',
  'sub.EI': 'Energy (E–I)',
  'sub.SN': 'Information (N–S)',
  'sub.TF': 'Decisions (T–F)',
  'sub.JP': 'Lifestyle (P–J)',
})

Object.assign(DICT.ja, {
  'test.mbti.name': '性向コンパス',
  'test.mbti.short': '性向(MBTI)',
  'test.mbti.desc': 'エネルギー・情報・判断・生活の4軸の選好を連続スコアで測るユング類型論ベースの検査',
  'intro.mbti.basis':
    'ユングの心理学的類型(1921)とマイヤーズ・ブリッグスの4軸(E/I・S/N・T/F・J/P)に基づき、類型のラベルではなく軸ごとの連続スコア(%)を主結果として示す検査です。各軸はビッグファイブ要因と大きく重なることが確認されています(McCrae & Costa 1989)。',
  'intro.mbti.c1': '正解も良い類型もありません――普段の自分で答えて',
  'intro.mbti.c2': 'なりたい姿ではなく、実際に楽な方を選んで',
  'intro.mbti.c3': '結果は類型の確定ではなく、今日の選好スナップショットです',
  'result.gauge.mbti': '選好の明瞭度',
  'result.mbtiClarity': '4軸の選好がどれだけ明確か（境界の軸が多いほど低下）',
  'result.mbtiBorder': '境界',
  'sub.EI': 'エネルギー (E–I)',
  'sub.SN': '情報収集 (N–S)',
  'sub.TF': '判断基準 (T–F)',
  'sub.JP': '生活様式 (P–J)',
})
