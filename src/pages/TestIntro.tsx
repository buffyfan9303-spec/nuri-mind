import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { SPRING } from '../lib/motion'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import { TopBar, Card } from '../components/ui'
import { testMeta } from '../data/tests'
import type { TestId } from '../data/types'
import { useT, useL } from '../i18n/useT'
import { useStore, IQ_DIA_COST } from '../store/useStore'

export default function TestIntro() {
  const { id } = useParams<{ id: TestId }>()
  const t = useT()
  const l = useL()
  const nav = useNavigate()
  const tm = testMeta(id as TestId)
  const iqUnlocked = useStore((s) => s.iqUnlocked)

  // 알 수 없는 검사 id(오타·구링크)면 크래시 대신 홈으로 — tm 단언(!) 사용처 보호
  if (!tm) return <Navigate to="/" replace />

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/" title={t(`test.${id}.name`)} />
      <main className="mx-auto max-w-md px-5">
        {/* 마스코트 인사 — 검사 시작 전 긴장을 낮추는 톤(결과 스포 방지용 중립 아이콘) */}
        <div className="mt-3 flex items-start gap-2.5 rounded-3xl bg-surface2 px-4 py-3">
          <span className="text-[20px] leading-none">🧠</span>
          <p className="min-w-0 flex-1 break-keep text-[13px] font-medium leading-relaxed text-ink-sub">
            {l({
              ko: '정답은 없어요. 지금의 나를 솔직하게 고르면 그게 가장 정확한 결과예요.',
              en: 'There are no right answers — the honest one is the most accurate.',
              ja: '正解はありません。今の自分に正直に選ぶのが一番正確です。',
            })}
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={SPRING.ui}
          className="rounded-3xl p-6 text-center shadow-pop"
          style={{ background: `linear-gradient(135deg, ${tm.gradFrom}, ${tm.gradTo})` }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            className="text-6xl"
          >
            {tm.emoji}
          </motion.div>
          <h1 className="mt-3 text-[24px] font-extrabold tracking-tight text-white">{t(`test.${id}.name`)}</h1>
          <p className="mt-1.5 text-[15px] font-bold leading-relaxed text-white/90">{t(`test.${id}.desc`)}</p>
          <div className="mt-4 flex justify-center gap-2 text-[13px] font-semibold">
            <span className="rounded-full bg-white/25 px-3 py-1.5 text-white">
              {tm.count} {t('intro.questions')}
            </span>
            <span className="rounded-full bg-white/25 px-3 py-1.5 text-white">
              ⏱ {tm.minutes}
              {t('common.min')}
            </span>
            {id === 'iq' && <span className="rounded-full bg-white/25 px-3 py-1.5 text-white">{t('intro.timed')}</span>}
          </div>
        </motion.div>

        <Card className="mt-4">
          <h2 className="flex items-center gap-2 text-[16px] font-semibold">{t('intro.basis')}</h2>
          <p className="mt-2.5 text-[15px] font-medium leading-[1.8] text-ink-sub">
            {t(`intro.${id}.basis`)}
          </p>
        </Card>

        <Card className="mt-4">
          <h2 className="flex items-center gap-2 text-[16px] font-semibold">{t('intro.caution')}</h2>
          <ul className="mt-3 space-y-2.5">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex items-start gap-2.5 text-[15px] font-bold leading-relaxed">
                <span className="mt-0.5 text-mind-600">✓</span>
                {t(`intro.${id}.c${n}`)}
              </li>
            ))}
          </ul>
        </Card>

        {id === 'adhd' && (
          <p className="mt-3 px-2 text-[12px] font-medium leading-relaxed text-ink-faint">{t('result.medical')}</p>
        )}

        {id === 'iq' ? (
          <>
            {/* IQ란? 직관 설명 */}
            <Card className="mt-4">
              <h2 className="flex items-center gap-2 text-[16px] font-semibold">{l({ ko: 'IQ 테스트가 뭔가요?', en: 'What is an IQ test?', ja: 'IQテストとは？' })}</h2>
              <p className="mt-2 break-keep text-[14px] font-medium leading-[1.8] text-ink-sub">
                {l({
                  ko: '숫자·도형·규칙 같은 문제로 추론력·패턴 파악·공간 지각을 재서, 언어나 지식의 영향을 빼고 순수 사고력(유동지능)을 IQ 점수로 추정하는 검사예요. 정답을 빠르고 정확하게 맞힐수록 점수가 높아져요.',
                  en: 'With number, shape, and rule puzzles it measures reasoning, pattern-finding, and spatial sense — estimating pure thinking ability (fluid intelligence) as an IQ score, free of language or knowledge. Faster, more accurate answers raise the score.',
                  ja: '数字・図形・規則の問題で推論力・パターン把握・空間認知を測り、言語や知識の影響を除いた純粋な思考力（流動性知能）をIQで推定する検査です。速く正確に解くほど高得点。',
                })}
              </p>
            </Card>

            {/* 두 가지 모드 */}
            <p className="mt-4 px-1 text-[13px] font-semibold text-ink-sub">{l({ ko: '두 가지 중에 골라보세요', en: 'Pick one of two', ja: '2つから選んで' })}</p>
            <div className="mt-2 space-y-2.5">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => nav('/test/iq/run?mode=fast')}
                className="flex w-full items-center gap-3 rounded-3xl border-2 border-line bg-surface p-4 text-left shadow-card"
              >
                <span className="text-[28px]">⚡</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-semibold">{l({ ko: '빠른 IQ 테스트', en: 'Quick IQ test', ja: 'クイックIQ' })}</h3>
                  <p className="mt-0.5 break-keep text-[12px] font-medium text-ink-sub">{l({ ko: '10문항 · 약 5분 · 무료 · 결과 바로 공개', en: '10 Qs · ~5 min · free · instant result', ja: '10問・約5分・無料・即結果' })}</p>
                </div>
                <span className="shrink-0 text-lg text-ink-faint">›</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => nav('/test/iq/run?mode=pro')}
                className="flex w-full items-center gap-3 rounded-3xl p-4 text-left text-white shadow-pop"
                style={{ background: `linear-gradient(135deg, ${tm.gradFrom}, ${tm.gradTo})` }}
              >
                <span className="text-[28px]">🔬</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-semibold">{l({ ko: '정밀 IQ 검사', en: 'Precision IQ test', ja: '精密IQ検査' })}</h3>
                  <p className="mt-0.5 break-keep text-[12px] font-medium text-white/90">
                    {l({
                      ko: `20문항 · 약 12분 · 정밀 점수·인지영역 분석${iqUnlocked ? ' · 해제됨 ✅' : ` · 상세결과 💎${IQ_DIA_COST}`}`,
                      en: `20 Qs · ~12 min · precise score & breakdown${iqUnlocked ? ' · unlocked ✅' : ` · detail 💎${IQ_DIA_COST}`}`,
                      ja: `20問・約12分・精密スコア&分析${iqUnlocked ? '・解除済 ✅' : `・詳細💎${IQ_DIA_COST}`}`,
                    })}
                  </p>
                </div>
                <span className="shrink-0 text-lg text-white/80">›</span>
              </motion.button>
            </div>
            {/* 난이도별 제한시간 안내 — 검사 설계의 근거를 공개해 신뢰도↑ */}
            <div className="mt-3 rounded-2xl bg-surface2 px-4 py-3">
              <p className="break-keep text-center text-[12px] font-medium leading-relaxed text-ink-sub">
                ⏱ {l({
                  ko: '제한시간은 문항 난이도에 따라 45·60·75초로 달라져요. 어려운 문항일수록 시간이 더 걸린다는 연구에 맞춰, 시간 압박이 아닌 실제 추론 능력을 재도록 설계했어요.',
                  en: 'Time limits scale with difficulty: 45·60·75s per item. Following research that harder items simply take longer, the test measures reasoning — not time pressure.',
                  ja: '制限時間は難易度に応じて45・60・75秒。難しい問題ほど時間がかかるという研究に沿い、時間圧でなく推論力を測る設計です。',
                })}
              </p>
            </div>
            <p className="mt-2.5 px-2 text-center text-[11px] font-medium leading-relaxed text-ink-faint">
              🔬 {l({ ko: '두뇌 능력 측정은 계속 새로 나와요.', en: 'More precision tests are coming soon.', ja: '精密検査シリーズは今後追加予定です。' })}
            </p>
          </>
        ) : id === 'memory' ? (
          <>
            {/* 기억력 검사란? 직관 설명 */}
            <Card className="mt-4">
              <h2 className="flex items-center gap-2 text-[16px] font-semibold">{l({ ko: '어떤 검사인가요?', en: 'What is this memory test?', ja: '精密記憶力検査とは？' })}</h2>
              <p className="mt-2 break-keep text-[14px] font-medium leading-[1.8] text-ink-sub">
                {l({
                  ko: '설문이 아니라 직접 숫자를 외워 되짚는 문제예요. 본 순서대로 맞히면 기억할 수 있는 길이를, 거꾸로 맞히면 머릿속에서 굴려 다루는 힘을 봐요. 100을 평균으로 한 점수로 알려드리고, 약 4분 걸려요.',
                  en: 'Not a survey — you actually memorize and recall digits. Forward (same order) gauges your immediate span; backward (reversed) gauges the working memory that juggles information. You get a Working-Memory Quotient (MQ) centered on 100. About 4 minutes.',
                  ja: 'アンケートではなく、実際に数字を覚えて辿る認知課題です。順唱（見た順）で即時記憶幅を、逆唱（逆向き）で頭の中で情報を操る作業記憶を測り、100を基準にしたワーキングメモリ指数(MQ)でお伝えします。約4分。',
                })}
              </p>
            </Card>
            <div className="mt-5">
              <Button color={tm.btn} size="lg" onClick={() => nav('/memory/run')}>
                {t('common.start')} →
              </Button>
            </div>
          </>
        ) : id === 'focus' ? (
          <>
            {/* 집중력 검사란? 직관 설명 */}
            <Card className="mt-4">
              <h2 className="flex items-center gap-2 text-[16px] font-semibold">{l({ ko: '어떤 검사인가요?', en: 'What is this focus test?', ja: '精密集中力検査とは？' })}</h2>
              <p className="mt-2 break-keep text-[14px] font-medium leading-[1.8] text-ink-sub">
                {l({
                  ko: '설문이 아니라 직접 반응하는 인지과제예요. 초록불이 뜨면 최대한 빠르게 탭하고, 빨간불엔 누르지 않고 참아요. 빠르고 정확한 반응(처리속도)·끝까지 놓치지 않는 집중지속·충동을 참는 억제력을 한 번에 재서, 100을 기준으로 한 집중 지수(FQ)로 알려드려요. 약 3분.',
                  en: 'Not a survey — a task where you actually react. Tap as fast as you can when the light turns green, and hold (don’t tap) on red. It measures fast accurate responses (processing speed), staying on task (sustained attention), and impulse control at once — giving a Focus Quotient (FQ) centered on 100. About 3 minutes.',
                  ja: 'アンケートではなく、実際に反応する認知課題です。緑が出たら最速でタップ、赤は押さずに我慢。速く正確な反応（処理速度）・最後まで取りこぼさない持続的注意・衝動を抑える力を一度に測り、100を基準にした集中指数(FQ)でお伝えします。約3分。',
                })}
              </p>
            </Card>
            <div className="mt-5">
              <Button color={tm.btn} size="lg" onClick={() => nav('/focus/run')}>
                {t('common.start')} →
              </Button>
            </div>
          </>
        ) : id === 'speed' ? (
          <>
            {/* 처리속도 검사란? 직관 설명 */}
            <Card className="mt-4">
              <h2 className="flex items-center gap-2 text-[16px] font-semibold">{l({ ko: '어떤 검사인가요?', en: 'What is this speed test?', ja: '精密処理速度検査とは？' })}</h2>
              <p className="mt-2 break-keep text-[14px] font-medium leading-[1.8] text-ink-sub">
                {l({
                  ko: '설문이 아니라 직접 손이 반응하는 인지과제예요. 위에 뜬 기호↔숫자 대응표를 보고, 나오는 기호에 맞는 숫자를 최대한 빠르고 정확하게 눌러 40개를 풀어요. 웩슬러 지능검사의 기호쓰기 방식으로 정보 처리속도를 재서, 100을 기준으로 한 처리속도 지수(SQ)로 알려드려요. 약 1~2분.',
                  en: 'Not a survey — a task where your hands react. Read the symbol↔digit key shown above and press the matching digit for each symbol as fast and accurately as you can, over 40 items. Modeled on the WAIS Digit-Symbol Coding, it measures processing speed as a Speed Quotient (SQ) centered on 100. About 1–2 minutes.',
                  ja: 'アンケートではなく、手が反応する認知課題です。上の記号↔数字対応表を見て、出てくる記号に合う数字を最速・正確に押し、40問を解きます。ウェクスラー知能検査の符号方式で処理速度を測り、100を基準にした処理速度指数(SQ)でお伝えします。約1〜2分。',
                })}
              </p>
            </Card>
            <div className="mt-5">
              <Button color={tm.btn} size="lg" onClick={() => nav('/speed/run')}>
                {t('common.start')} →
              </Button>
            </div>
          </>
        ) : id === 'spatial' ? (
          <>
            {/* 공간지각 검사란? 직관 설명 */}
            <Card className="mt-4">
              <h2 className="flex items-center gap-2 text-[16px] font-semibold">{l({ ko: '어떤 검사인가요?', en: 'What is this spatial test?', ja: '精密空間知覚検査とは？' })}</h2>
              <p className="mt-2 break-keep text-[14px] font-medium leading-[1.8] text-ink-sub">
                {l({
                  ko: '설문이 아니라 머릿속에서 도형을 돌려보는 인지과제예요. 회전하거나 뒤집힌 글자가 나오면, 머릿속에서 똑바로 세워 "정상"인지 좌우가 뒤집힌 "거울상"인지 20문항을 판별해요. Shepard의 심적 회전 방식으로 공간 지각력을 재서, 100을 기준으로 한 공간 지수(XQ)로 알려드려요. 약 3분.',
                  en: 'Not a survey — a task where you rotate shapes in your head. When a rotated or flipped letter appears, mentally upright it and judge across 20 items whether it is "normal" or a left-right "mirror image". Using Shepard\'s mental rotation, it measures spatial ability as a Spatial Quotient (XQ) centered on 100. About 3 minutes.',
                  ja: 'アンケートではなく、頭の中で図形を回す認知課題です。回転・反転した文字が出たら、頭の中でまっすぐ起こして「正常」か左右反転の「鏡像」かを20問判別します。Shepardの心的回転方式で空間能力を測り、100を基準にした空間指数(XQ)でお伝えします。約3分。',
                })}
              </p>
            </Card>
            <div className="mt-5">
              <Button color={tm.btn} size="lg" onClick={() => nav('/spatial/run')}>
                {t('common.start')} →
              </Button>
            </div>
          </>
        ) : id === 'switch' ? (
          <>
            {/* 주의전환 검사란? 직관 설명 */}
            <Card className="mt-4">
              <h2 className="flex items-center gap-2 text-[16px] font-semibold">{l({ ko: '어떤 검사인가요?', en: 'What is this switching test?', ja: '精密注意切替検査とは？' })}</h2>
              <p className="mt-2 break-keep text-[14px] font-medium leading-[1.8] text-ink-sub">
                {l({
                  ko: '설문이 아니라 규칙이 계속 바뀌는 과제를 처리하는 인지과제예요. 신호가 "크기"면 숫자가 5보다 큰지, "홀짝"이면 홀수인지 짝수인지 빠르게 갈아타며 32문항을 판단해요. 과제 전환(Task-switching) 방식으로 집행기능·인지 유연성을 재서, 100을 기준으로 한 전환 지수(WQ)로 알려드려요. 약 2~3분.',
                  en: 'Not a survey — a task where the rule keeps changing. When the cue is "size" judge if the number is over 5; when it\'s "odd/even" judge parity — swapping fast across 32 items. Using Task-switching, it measures executive function and cognitive flexibility as a Switching Quotient (WQ) centered on 100. About 2–3 minutes.',
                  ja: 'アンケートではなく、ルールが変わり続ける課題を処理する認知課題です。合図が「大きさ」なら5より大きいか、「偶奇」なら奇数か偶数かを素早く切り替えて32問判断します。課題切替（Task-switching）方式で実行機能・認知的柔軟性を測り、100を基準にした切替指数(WQ)でお伝えします。約2〜3分。',
                })}
              </p>
            </Card>
            <div className="mt-5">
              <Button color={tm.btn} size="lg" onClick={() => nav('/switch/run')}>
                {t('common.start')} →
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-5">
            <Button color={tm.btn} size="lg" onClick={() => nav(`/test/${id}/run`)}>
              {t('common.start')} →
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
