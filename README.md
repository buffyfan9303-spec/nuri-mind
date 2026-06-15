# 🧠 누리 마인드 (NURI MIND)

ADHD · 이기주의(개인주의) · 유동 IQ를 측정하는 **다면 기질 검사** + **설문 리워드 부업** 플랫폼.
듀오링고 스타일의 부드러운 인터랙션, 정규분포 CDF/라플라스 평활화 통계 엔진, 광고 수익 모델 내장.

## 실행

```bash
npm install
npm run dev      # http://localhost:5179
npm run build    # dist/ 프로덕션 빌드 (Vercel 배포용)
```

## 구조 요약

| 영역 | 위치 | 비고 |
|---|---|---|
| 검사 문항 뱅크 | `src/data/adhd.ts` `ego.ts` `iq.ts` | ASRS v1.1 / LSRP·SVO / ICAR 기반, ko·en·ja 내장 |
| 통계 엔진 | `src/lib/scoring.ts` | Normal CDF(백분위), 라플라스 평활화(+0.6/+1.2), ASRS 스크리너, 가면(타당도) 필터 |
| 페르소나 | `src/i18n/animalTranslations.ts` | 8종 동물 + 팩트폭행/솔루션 카피 (3개 국어) |
| UI 딕셔너리 | `src/i18n/translations.ts` | ko/en/ja 키-값 독립 |
| 상태/경제 | `src/store/useStore.ts` | zustand persist — 포인트·출석·설문·교환·승인 |
| 광고 | `src/lib/ads.ts` `components/AdSlot.tsx` `AdGate.tsx` | 아래 '수익화' 참고 |

## 💰 수익화 (광고)

1. **웹(AdSense)**: 승인 후 `.env` 작성(`.env.example` 복사) + `index.html`의 AdSense `<script>` 주석 해제.
   - 배치: 홈/인트로/결과/리워드 배너 + **검사완료→결과 사이 AdGate(5초)** 가 핵심 수익 지점.
   - 미설정 시 동일 레이아웃의 플레이스홀더가 표시되어 UX 검증 가능.
2. **APK(AdMob)**: 네이티브에서는 AdSense 대신 AdMob 사용.
   - `npm i @capacitor/core @capacitor/cli @capacitor-community/admob`
   - `src/lib/ads.ts`의 `isNative()` / `showInterstitial()` TODO 지점에 AdMob 전면광고 연결.
   - 보상형(리워드) 광고는 리워드 센터 '포인트 2배' 버튼으로 확장 추천.

## 📱 APK 패키징 (2가지 경로)

**A. TWA (웹 그대로, 가장 빠름)** — Vercel 배포 후:
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://<배포도메인>/manifest.webmanifest
bubblewrap build   # → app-release-signed.apk / .aab
```
단, TWA에서는 AdMob 불가(웹 AdSense만 동작).

**B. Capacitor (AdMob·오퍼월 SDK 쓰려면 필수)**:
```bash
npm i @capacitor/core @capacitor/cli && npx cap init "NURI MIND" kr.nuri.mind
npm run build && npx cap add android && npx cap sync && npx cap open android
```

## 🛠 운영

- 운영자 콘솔: **프로필 → 운영자 콘솔**, PIN `nuri2026` (`src/store/useStore.ts`의 `OPERATOR_PIN` — 배포 전 변경!)
- 설문 승인/반려, 포인트 교환 승인(반려 시 자동 환불), 현황 통계 제공.
- 현재 저장소는 **로컬(localStorage)** — 실서비스 전 Supabase로 교체 지점: `useStore.ts` 액션들 + `data/seed.ts`.

## ⚖️ 출시 전 체크리스트

- [ ] ADHD 검사 의료 면책 고지 유지 (Google Play 건강 정책 필수)
- [ ] OPERATOR_PIN 변경 + 운영자 인증을 Supabase Auth로 이전
- [ ] 포인트 경제 실측 조정 (현재: 검사 30P, 출석 10P, 설문 30~80P, 상품 3,400P~)
- [ ] 오퍼월 SDK(애드팝콘/탭조이 등) 연동 — `data/seed.ts`의 OFFERS 교체
- [ ] 개인정보처리방침 페이지 추가 (AdSense/AdMob 승인 요건)

## 학술 참고 문헌

- Kessler et al. (2005). *The WHO Adult ADHD Self-Report Scale (ASRS)*. Psychological Medicine 35.
- Levenson, Kiehl & Fitzpatrick (1995). *Assessing psychopathic attributes*. JPSP 68.
- Christie & Geis (1970). *Studies in Machiavellianism*. / Murphy et al. (2011). *SVO*. 
- Condon & Revelle (2014). *The ICAR*. Intelligence 43.
- Batson (1991). *The Altruism Question*. / Crowne & Marlowe (1960). 사회적 바람직성 척도.
