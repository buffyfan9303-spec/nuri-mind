// 스토어 앱 번들 전 확인 — Supabase 공개(anon) 키 없이 빌드하면 supabase=null 이라
// 로그인·커뮤니티·계정 삭제가 전부 죽은 앱이 조용히 만들어진다(src/lib/supabase.ts). 값은 출력하지 않는다.
import { loadEnv } from 'vite'

const env = loadEnv('production', process.cwd(), 'VITE_')
const key = env.VITE_SUPABASE_ANON_KEY ?? ''
if (key.length <= 20) {
  console.error('[check-native-env] VITE_SUPABASE_ANON_KEY 가 없습니다 — .env(.production) 또는 환경변수에 넣고 다시 실행하세요. (docs/PLAY-RELEASE.md)')
  process.exit(1)
}
console.log('[check-native-env] OK — Supabase 공개 키 있음' + (env.VITE_SENTRY_DSN ? ', Sentry DSN 있음(Data safety: 비정상 종료 로그·진단 수집 = 예)' : ', Sentry DSN 없음'))
