#!/usr/bin/env bash
# E2E 스펙이 "진짜"인지 검증한다 — 기능을 일부러 망가뜨렸을 때 해당 테스트가 실패해야 한다.
#
# 통과하는 테스트는 아무것도 증명하지 않는다. 구현을 지워도 초록불이면 그건 가짜 안전망이다.
# 각 뮤테이션마다: 소스 변조 → 대상 테스트 실행 → 반드시 git으로 원복.
#
# ⚠️ 복구는 trap으로 보장한다. 중간에 죽어도 소스는 되돌아간다
#    (E2E 에이전트가 이걸 안 해서 약관 본문 절단이 커밋까지 나갔다).
set -u
cd "$(dirname "$0")/.."

restore() { git checkout -- src/ 2>/dev/null; }
trap restore EXIT INT TERM

if [ -n "$(git status --porcelain src/)" ]; then
  echo "❌ src/에 커밋되지 않은 변경이 있습니다. 먼저 정리하세요(복구가 그걸 지웁니다)."
  exit 1
fi

pass=0
fail=0

# mutate <설명> <파일> <sed표현식> <테스트 grep>
mutate() {
  local name="$1" file="$2" expr="$3" grep_pat="$4"
  restore
  sed -i "$expr" "$file"
  if git diff --quiet -- "$file"; then
    echo "  ⚠️  $name — sed가 아무것도 못 바꿈(패턴 불일치). 검증 무효"
    fail=$((fail + 1))
    return
  fi
  if npx playwright test -g "$grep_pat" --reporter=line >/dev/null 2>&1; then
    echo "  ❌ $name — 구현을 망가뜨렸는데 테스트가 통과함(가짜 안전망)"
    fail=$((fail + 1))
  else
    echo "  ✅ $name — 테스트가 정확히 실패함"
    pass=$((pass + 1))
  fi
  restore
}

echo "뮤테이션 검증 시작 (각 항목마다 빌드+실행)"
echo

mutate "약관 시트 본문 400자 절단" \
  src/components/LegalSheet.tsx \
  "s|setBody(doc === 'terms' ? m.TERMS : m.PRIVACY)|setBody((doc === 'terms' ? m.TERMS : m.PRIVACY).slice(0, 400))|" \
  "약관 시트는 라우트를 바꾸지 않고"

mutate "미동의 상태 보상 차단 가드 제거" \
  src/store/useStore.ts \
  "s|if (!s.onboarded) return 0|if (false) return 0|" \
  "정독 보상은 적립되지 않는다"

mutate "성장 포커스 페르소나 중복제거 무력화" \
  src/lib/growth.ts \
  "s|if (personas.has(r.persona)) continue|if (false) continue|" \
  "포커스 3장"

# ⚠️ 패턴 안에 ||가 있어 sed 구분자를 #로 바꾼다(|를 쓰면 표현식 자체가 깨진다)
mutate "온보딩 필수 동의 게이트 제거" \
  src/components/Onboarding.tsx \
  "s#disabled={!nick.trim() || !agreed}#disabled={!nick.trim()}#" \
  "시작 버튼이 잠긴다"

mutate "16유형 심층 배점 반전" \
  src/pages/MbtiTest.tsx \
  "s|\[item.pole\]: (p\[item.pole\] ?? 0) + (v - 1)|[item.pole]: (p[item.pole] ?? 0) + (5 - v)|" \
  "심층검사 배점"

# 언어 전환 — 사전을 별도 청크로 뺀 뒤 생긴 '2단계 렌더'가 실제로 검증되는지.
# 구독을 끊으면 lang은 바뀌지만 화면은 한국어에 머문다(저장소만 보면 초록불인 상태).
mutate "사전 도착 구독 제거(언어 전환 무력화)" \
  src/i18n/useT.ts \
  "s#const version = useSyncExternalStore(subscribeDict, dictVersion, dictVersion)#const version = 0#" \
  "화면이 실제로 그 언어로 바뀐다"

# ⚠️ useT의 `?? ko[key]`가 아니라 dictFor의 폴백을 겨눈다. 전자는 dictFor가 이미 ko를
#    돌려주므로 이 경로에선 중복이라, 지워도 테스트가 통과한다(그래서 한 번 헛짚었다).
#    진짜 안전장치는 dictFor — 없으면 사전 청크 실패 시 undefined 접근으로 화면이 죽는다.
mutate "사전 폴백 제거(청크 실패 시 화면 붕괴)" \
  src/i18n/translations.ts \
  "s#return LOADED\[lang\] ?? ko#return LOADED[lang] as Record<string, string>#" \
  "한국어로 계속 동작한다"

echo
echo "진짜 안전망 $pass · 가짜/무효 $fail"
[ "$fail" -eq 0 ]
