# 웹 푸시 알림 설정 (NURI MIND)

푸시는 **VAPID 키 생성 + Supabase 엣지 배포**가 필요합니다. 아래 4단계를 끝내면 프로필 설정에 "🔔 푸시 알림" 토글이 자동으로 나타나고, 구독한 사용자에게 발송할 수 있습니다. (설정 전에는 토글이 숨겨져 앱은 정상 동작)

## 1. VAPID 키 생성

```bash
npx web-push generate-vapid-keys
```

→ `Public Key` / `Private Key` 두 개가 출력됩니다.

## 2. 클라이언트 환경변수 (Vercel)

Vercel → Project → Settings → Environment Variables:

- `VITE_VAPID_PUBLIC_KEY` = `<Public Key>`

저장 후 **재배포** (Vite 빌드 시 인라인됨).

## 3. Supabase SQL

SQL Editor에서 `supabase/push.sql` 실행 — `push_subscriptions` 테이블 + `save_push_subscription` RPC 생성.

## 4. 엣지 함수 배포 + 시크릿

```bash
supabase functions deploy push-send --project-ref xdcglyavndiwbbaryocx
supabase secrets set \
  VAPID_PUBLIC_KEY=<Public Key> \
  VAPID_PRIVATE_KEY=<Private Key> \
  VAPID_SUBJECT=mailto:buffyfan9303@gmail.com \
  PUSH_ADMIN_TOKEN=<임의의 비밀 문자열>
```

(`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`는 Supabase가 자동 주입)

## 발송 (운영자 / 크론)

```bash
curl -X POST "https://xdcglyavndiwbbaryocx.functions.supabase.co/push-send" \
  -H "x-admin-token: <PUSH_ADMIN_TOKEN>" \
  -H "content-type: application/json" \
  -d '{"title":"누리 마인드","body":"오늘의 운세 보러 오세요 🔮","url":"/fortune"}'
```

**재방문 후크**: Supabase **Scheduled Functions(cron)**로 매일 정해진 시각에 위 호출을 자동화하면, 앱이 꺼져 있어도 알림이 갑니다. 만료된 구독(410)은 발송 시 자동 정리됩니다.
