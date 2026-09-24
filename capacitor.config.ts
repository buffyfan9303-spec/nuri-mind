import type { CapacitorConfig } from '@capacitor/cli'

/**
 * 스토어 앱(안드로이드·iOS) 셸 설정.
 * appId는 src/lib/platform.ts의 NATIVE_APP_ID와 같아야 한다(OAuth 딥링크 스킴 kr.nuri.mind://).
 * 빌드: npm run cap:sync → Android Studio / Xcode에서 서명·업로드 (docs/STORE.md)
 */
const config: CapacitorConfig = {
  appId: 'kr.nuri.mind',
  appName: '누리 마인드',
  webDir: 'dist',
  plugins: {
    // 첫 화면이 그려진 뒤 native.ts가 직접 숨긴다
    SplashScreen: { launchAutoHide: false, backgroundColor: '#6E7BF2', showSpinner: false },
  },
}

export default config
