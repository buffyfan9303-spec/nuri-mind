import { useEffect, useRef } from 'react'
import { isNative, showInterstitial } from '../lib/ads'

/**
 * 결과 준비 게이트 — 예전엔 검사·운세 완료 → 결과 사이에 5초 대기 전면 화면을 띄웠다.
 *
 * ⚠️ AdSense 정책(게시자 콘텐츠가 없는 화면 광고 금지, support.google.com/publisherpolicies/answer/11112688):
 *   '알림·탐색·기타 행동 목적 화면'엔 광고를 둘 수 없다. 이 게이트는 전형적인 행동 목적(이동·대기) 화면이라
 *   웹에선 광고를 둘 수 없고, 광고 없이 5초를 붙잡아 두는 것도 사용자에게 가치가 없어 웹에선 **즉시 통과**시킨다.
 *   (TestResult·AiReport는 게이트 자체를 걷어냈다. 운세 화면은 다른 작업이 진행 중이라 호출부를 그대로 두고
 *    여기서 무력화한다 — 호출부를 정리하면 이 파일을 지워도 된다.)
 * APK(네이티브) 전환 시엔 showInterstitial()이 AdMob 전면광고(앱 정책상 허용 지점)로 대체될 수 있다.
 */
export default function AdGate({ onDone }: { onDone: () => void }) {
  // StrictMode 이중 실행에서도 onDone(보상 지급·해금)이 두 번 불리지 않게
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    if (isNative()) void showInterstitial().finally(onDone)
    else onDone()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
