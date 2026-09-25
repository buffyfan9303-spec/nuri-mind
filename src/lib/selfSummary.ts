/**
 * 여러 검사를 가로지르는 '나' 요약 — LLM 없이 동물 캐릭터의 강점·약한 면을 모아 만든다.
 * 심층 리포트의 무료 티저와 '나에 관하여' 종합 카드가 같은 문장을 쓴다(한곳에서만 고친다).
 *
 * 동물 캐릭터 데이터(animalTranslations, 약 184KB)는 호출부가 넘긴다 — 이 파일이 직접 import하면
 * 이 함수를 쓰는 화면마다 큰 청크가 정적으로 딸려 온다.
 */
import type { L } from '../data/types'
import type { Persona } from '../i18n/animalTranslations'

export interface SelfSummary {
  strengths: string[]
  risks: string[]
  core: string
}

export function summarizePersonas(personas: Persona[], testCount: number, l: (x: L) => string): SelfSummary {
  // 같은 캐릭터가 여러 검사에 걸릴 수 있어 문구가 겹친다 — 겹침을 지운 뒤 자른다
  const uniq = (arr: string[], n: number) => [...new Set(arr)].slice(0, n)
  const strengths = uniq(personas.flatMap((p) => p.strengths.slice(0, 1)).map((x) => l(x)), 3)
  const risks = uniq(personas.flatMap((p) => p.risks.slice(0, 1)).map((x) => l(x)), 2)
  if (!strengths.length) return { strengths, risks, core: '' }
  const core = l({
    ko: `${testCount}개 검사가 공통으로 가리키는 건 이런 모습이에요. ${strengths.join(', ')}. 동시에 ${risks.join(', ')} 같은 면도 함께 보여요. 강점과 약한 면은 대개 같은 성향의 앞뒷면이라, 하나만 떼어 고치기보다 둘을 같이 이해할 때 훨씬 다루기 쉬워요.`,
    en: `Across ${testCount} tests, a consistent picture emerges — ${strengths.join(', ')}. Alongside it: ${risks.join(', ')}. Strengths and vulnerabilities are usually two sides of one trait, so understanding both together works better than fixing one alone.`,
    ja: `${testCount}件の検査が共通して示すのは — ${strengths.join('、')}。同時に${risks.join('、')}という面も見えます。強みと弱さは同じ傾向の表裏であることが多く、両方をまとめて理解するほうがうまく扱えます。`,
  })
  return { strengths, risks, core }
}
