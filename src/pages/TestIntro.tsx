import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import AdSlot from '../components/AdSlot'
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

  return (
    <div className="min-h-dvh pb-36">
      <TopBar back="/" title={t(`test.${id}.name`)} />
      <main className="mx-auto max-w-md px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
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
          <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-white">{t(`test.${id}.name`)}</h1>
          <p className="mt-1.5 text-[15.5px] font-bold leading-relaxed tracking-wide text-white/90">{t(`test.${id}.desc`)}</p>
          <div className="mt-4 flex justify-center gap-2 text-[13px] font-extrabold">
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
          <h2 className="flex items-center gap-2 text-[16px] font-extrabold tracking-tight">📚 {t('intro.basis')}</h2>
          <p className="mt-2.5 text-[15px] font-medium leading-[1.8] tracking-wide text-ink-sub">
            {t(`intro.${id}.basis`)}
          </p>
        </Card>

        {/* 광고 — 본문 중단(고시선 영역) */}
        <div className="mt-4">
          <AdSlot variant="banner" />
        </div>

        <Card className="mt-4">
          <h2 className="flex items-center gap-2 text-[16px] font-extrabold tracking-tight">🤙 {t('intro.caution')}</h2>
          <ul className="mt-3 space-y-2.5">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex items-start gap-2.5 text-[15.5px] font-bold leading-relaxed">
                <span className="mt-0.5 text-mind-600">✓</span>
                {t(`intro.${id}.c${n}`)}
              </li>
            ))}
          </ul>
        </Card>

        {id === 'adhd' && (
          <p className="mt-3 px-2 text-[12.5px] font-medium leading-relaxed text-ink-faint">{t('result.medical')}</p>
        )}

        {id === 'iq' ? (
          <>
            {/* IQ란? 직관 설명 */}
            <Card className="mt-4">
              <h2 className="flex items-center gap-2 text-[16px] font-extrabold tracking-tight">🧩 {l({ ko: 'IQ 테스트가 뭔가요?', en: 'What is an IQ test?', ja: 'IQテストとは？' })}</h2>
              <p className="mt-2 break-keep text-[14.5px] font-medium leading-[1.8] text-ink-sub">
                {l({
                  ko: '숫자·도형·규칙 같은 문제로 추론력·패턴 파악·공간 지각을 재서, 언어나 지식의 영향을 빼고 순수 사고력(유동지능)을 IQ 점수로 추정하는 검사예요. 정답을 빠르고 정확하게 맞힐수록 점수가 높아집니다.',
                  en: 'With number, shape, and rule puzzles it measures reasoning, pattern-finding, and spatial sense — estimating pure thinking ability (fluid intelligence) as an IQ score, free of language or knowledge. Faster, more accurate answers raise the score.',
                  ja: '数字・図形・規則の問題で推論力・パターン把握・空間認知を測り、言語や知識の影響を除いた純粋な思考力（流動性知能）をIQで推定する検査です。速く正確に解くほど高得点。',
                })}
              </p>
            </Card>

            {/* 두 가지 모드 */}
            <p className="mt-4 px-1 text-[13px] font-extrabold text-ink-sub">{l({ ko: '두 가지 중에 골라보세요', en: 'Pick one of two', ja: '2つから選んで' })}</p>
            <div className="mt-2 space-y-2.5">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => nav('/test/iq/run?mode=fast')}
                className="flex w-full items-center gap-3 rounded-3xl border-2 border-line bg-surface p-4 text-left shadow-card"
              >
                <span className="text-[28px]">⚡</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15.5px] font-extrabold">{l({ ko: '빠른 IQ 테스트', en: 'Quick IQ test', ja: 'クイックIQ' })}</h3>
                  <p className="mt-0.5 break-keep text-[12.5px] font-bold text-ink-sub">{l({ ko: '10문항 · 약 5분 · 무료 · 결과 바로 공개', en: '10 Qs · ~5 min · free · instant result', ja: '10問・約5分・無料・即結果' })}</p>
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
                  <h3 className="text-[15.5px] font-extrabold">{l({ ko: '정밀 IQ 검사', en: 'Precision IQ test', ja: '精密IQ検査' })}</h3>
                  <p className="mt-0.5 break-keep text-[12.5px] font-bold text-white/90">
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
            <p className="mt-2.5 px-2 text-center text-[11.5px] font-medium leading-relaxed text-ink-faint">
              🔬 {l({ ko: '정밀검사 시리즈는 계속 추가될 예정이에요.', en: 'More precision tests are coming soon.', ja: '精密検査シリーズは今後追加予定です。' })}
            </p>
          </>
        ) : id === 'memory' ? (
          <>
            {/* 기억력 검사란? 직관 설명 */}
            <Card className="mt-4">
              <h2 className="flex items-center gap-2 text-[16px] font-extrabold tracking-tight">🧠 {l({ ko: '정밀 기억력 검사가 뭔가요?', en: 'What is this memory test?', ja: '精密記憶力検査とは？' })}</h2>
              <p className="mt-2 break-keep text-[14.5px] font-medium leading-[1.8] text-ink-sub">
                {l({
                  ko: '설문이 아니라 직접 숫자를 외워 되짚는 인지과제예요. 본 순서대로 맞히는 "정방향"으로 즉시 기억폭을, 거꾸로 맞히는 "역방향"으로 머릿속에서 정보를 굴리는 작업기억을 측정해, 100을 기준으로 한 작업기억 지수(MQ)로 알려드려요. 약 4분 걸려요.',
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
              <h2 className="flex items-center gap-2 text-[16px] font-extrabold tracking-tight">👁️ {l({ ko: '정밀 집중력 검사가 뭔가요?', en: 'What is this focus test?', ja: '精密集中力検査とは？' })}</h2>
              <p className="mt-2 break-keep text-[14.5px] font-medium leading-[1.8] text-ink-sub">
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
              <h2 className="flex items-center gap-2 text-[16px] font-extrabold tracking-tight">⚡ {l({ ko: '정밀 처리속도 검사가 뭔가요?', en: 'What is this speed test?', ja: '精密処理速度検査とは？' })}</h2>
              <p className="mt-2 break-keep text-[14.5px] font-medium leading-[1.8] text-ink-sub">
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
