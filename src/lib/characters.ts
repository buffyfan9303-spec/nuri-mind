/**
 * 결과 캐릭터 일러스트 — 이모지 대신 쓰는 자체 플랫 마스코트 SVG(브랜드화).
 * viewBox 200×200, 외부 참조 없는 순수 도형(캔버스 toBlob 오염 없음 → 공유 이미지 OK).
 * 이모지 키로 매핑하며, 없는 동물은 호출부에서 이모지로 폴백.
 */

const tiger = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<circle cx="60" cy="60" r="22" fill="#EE8C3A"/><circle cx="140" cy="60" r="22" fill="#EE8C3A"/>
<circle cx="60" cy="60" r="10" fill="#F8C79B"/><circle cx="140" cy="60" r="10" fill="#F8C79B"/>
<circle cx="100" cy="106" r="62" fill="#F6A24A"/>
<ellipse cx="100" cy="128" rx="38" ry="27" fill="#FFF4E5"/>
<path d="M100 54 l-6 20 12 0 z" fill="#3b2a1c"/>
<path d="M68 94 q-7 8 -3 18" stroke="#3b2a1c" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M132 94 q7 8 3 18" stroke="#3b2a1c" stroke-width="6" fill="none" stroke-linecap="round"/>
<circle cx="82" cy="104" r="7" fill="#2c241d"/><circle cx="118" cy="104" r="7" fill="#2c241d"/>
<circle cx="70" cy="122" r="9" fill="#FBB6C0" opacity="0.7"/><circle cx="130" cy="122" r="9" fill="#FBB6C0" opacity="0.7"/>
<path d="M92 124 h16 l-8 8 z" fill="#E0728A"/><path d="M100 132 v6" stroke="#7A5A3A" stroke-width="3" stroke-linecap="round"/>
</svg>`

const fox = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<path d="M50 44 L84 92 L42 88 Z" fill="#ED7A42"/><path d="M150 44 L116 92 L158 88 Z" fill="#ED7A42"/>
<path d="M57 54 L78 86 L52 82 Z" fill="#3b2a1c"/><path d="M143 54 L122 86 L148 82 Z" fill="#3b2a1c"/>
<circle cx="100" cy="104" r="60" fill="#F2823F"/>
<path d="M68 112 Q100 178 132 112 Z" fill="#FFF4E5"/>
<circle cx="82" cy="100" r="7" fill="#2c241d"/><circle cx="118" cy="100" r="7" fill="#2c241d"/>
<circle cx="70" cy="116" r="8" fill="#FBB6C0" opacity="0.65"/><circle cx="130" cy="116" r="8" fill="#FBB6C0" opacity="0.65"/>
<circle cx="100" cy="138" r="7" fill="#2c241d"/>
</svg>`

const owl = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<path d="M64 56 l10 22 -24 -4 z" fill="#8E6A45"/><path d="M136 56 l-10 22 24 -4 z" fill="#8E6A45"/>
<circle cx="100" cy="106" r="62" fill="#B0855B"/>
<path d="M100 64 a44 44 0 0 1 0 84 a30 44 0 0 0 0 -84z" fill="#C79A6E"/>
<circle cx="80" cy="100" r="23" fill="#FFF7EC"/><circle cx="120" cy="100" r="23" fill="#FFF7EC"/>
<circle cx="80" cy="102" r="10" fill="#2c241d"/><circle cx="120" cy="102" r="10" fill="#2c241d"/>
<circle cx="84" cy="98" r="3" fill="#fff"/><circle cx="124" cy="98" r="3" fill="#fff"/>
<path d="M100 116 l-9 12 18 0 z" fill="#F2A33C"/>
</svg>`

const koala = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<circle cx="52" cy="74" r="30" fill="#A7B0B8"/><circle cx="148" cy="74" r="30" fill="#A7B0B8"/>
<circle cx="52" cy="74" r="16" fill="#C9D0D6"/><circle cx="148" cy="74" r="16" fill="#C9D0D6"/>
<circle cx="100" cy="108" r="58" fill="#AEB7BF"/>
<circle cx="80" cy="104" r="7" fill="#2c241d"/><circle cx="120" cy="104" r="7" fill="#2c241d"/>
<circle cx="70" cy="120" r="8" fill="#FBB6C0" opacity="0.6"/><circle cx="130" cy="120" r="8" fill="#FBB6C0" opacity="0.6"/>
<ellipse cx="100" cy="126" rx="15" ry="18" fill="#5C6168"/>
</svg>`

const penguin = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<ellipse cx="100" cy="108" rx="58" ry="64" fill="#39465E"/>
<ellipse cx="100" cy="120" rx="38" ry="48" fill="#FFFFFF"/>
<circle cx="84" cy="92" r="7" fill="#2c241d"/><circle cx="116" cy="92" r="7" fill="#2c241d"/>
<path d="M90 104 q10 12 20 0 z" fill="#F4A93C"/>
<circle cx="74" cy="110" r="8" fill="#FBB6C0" opacity="0.6"/><circle cx="126" cy="110" r="8" fill="#FBB6C0" opacity="0.6"/>
</svg>`

const turtle = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<circle cx="100" cy="150" r="20" fill="#7DC48A"/>
<path d="M44 116 a56 50 0 0 1 112 0 z" fill="#4FAE6B"/>
<path d="M100 70 v46 M60 92 l40 24 M140 92 l-40 24" stroke="#3C8A52" stroke-width="6" stroke-linecap="round" fill="none"/>
<circle cx="100" cy="98" r="20" fill="#67B97E"/>
<circle cx="92" cy="150" r="5" fill="#2c241d"/><circle cx="108" cy="150" r="5" fill="#2c241d"/>
<circle cx="84" cy="158" r="6" fill="#FBB6C0" opacity="0.6"/><circle cx="116" cy="158" r="6" fill="#FBB6C0" opacity="0.6"/>
</svg>`

const hamster = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<circle cx="68" cy="60" r="16" fill="#E9B985"/><circle cx="132" cy="60" r="16" fill="#E9B985"/>
<circle cx="68" cy="60" r="8" fill="#F7DAB6"/><circle cx="132" cy="60" r="8" fill="#F7DAB6"/>
<circle cx="100" cy="108" r="62" fill="#F2C78C"/>
<circle cx="62" cy="124" r="22" fill="#F8DCB4"/><circle cx="138" cy="124" r="22" fill="#F8DCB4"/>
<circle cx="84" cy="104" r="7" fill="#2c241d"/><circle cx="116" cy="104" r="7" fill="#2c241d"/>
<path d="M93 120 h14 l-7 7 z" fill="#C77D6A"/>
<path d="M100 127 v5" stroke="#9A6B4F" stroke-width="3" stroke-linecap="round"/>
</svg>`

const hedgehog = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<path d="M100 30 L120 64 L150 50 L146 86 L176 92 L150 112 L96 120 L44 108 L28 86 L54 80 L48 50 L80 64 Z" fill="#7A6AA8"/>
<path d="M44 112 a56 46 0 0 0 112 0 z" fill="#F3E2C7"/>
<circle cx="100" cy="132" r="40" fill="#F6E7CF"/>
<circle cx="86" cy="124" r="6" fill="#2c241d"/><circle cx="114" cy="124" r="6" fill="#2c241d"/>
<circle cx="76" cy="136" r="7" fill="#FBB6C0" opacity="0.6"/><circle cx="124" cy="136" r="7" fill="#FBB6C0" opacity="0.6"/>
<circle cx="100" cy="142" r="7" fill="#6B4F8A"/>
</svg>`

/* ── 꽃 6종 (꽃 테스트 결과) ── */
const rose = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<rect x="95" y="92" width="10" height="68" rx="5" fill="#3E8E5A"/>
<ellipse cx="70" cy="126" rx="24" ry="12" fill="#52A86E" transform="rotate(-22 70 126)"/>
<ellipse cx="132" cy="140" rx="20" ry="10" fill="#46996099" transform="rotate(24 132 140)"/>
<circle cx="100" cy="80" r="50" fill="#E63950"/>
<circle cx="100" cy="80" r="37" fill="#F2536B"/>
<circle cx="100" cy="80" r="24" fill="#E63950"/>
<circle cx="100" cy="80" r="11" fill="#C92A40"/>
</svg>`
const sunflower = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<rect x="95" y="112" width="10" height="52" rx="5" fill="#3E8E5A"/>
<ellipse cx="74" cy="138" rx="18" ry="9" fill="#52A86E" transform="rotate(-20 74 138)"/>
<g fill="#FFC02E">
<ellipse cx="100" cy="46" rx="11" ry="24" transform="rotate(0 100 90)"/><ellipse cx="100" cy="46" rx="11" ry="24" transform="rotate(45 100 90)"/>
<ellipse cx="100" cy="46" rx="11" ry="24" transform="rotate(90 100 90)"/><ellipse cx="100" cy="46" rx="11" ry="24" transform="rotate(135 100 90)"/>
<ellipse cx="100" cy="46" rx="11" ry="24" transform="rotate(180 100 90)"/><ellipse cx="100" cy="46" rx="11" ry="24" transform="rotate(225 100 90)"/>
<ellipse cx="100" cy="46" rx="11" ry="24" transform="rotate(270 100 90)"/><ellipse cx="100" cy="46" rx="11" ry="24" transform="rotate(315 100 90)"/>
</g>
<circle cx="100" cy="90" r="28" fill="#7A4B23"/><circle cx="100" cy="90" r="19" fill="#90592C"/>
</svg>`
const lavender = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<rect x="96" y="84" width="8" height="80" rx="4" fill="#52A86E"/>
<g fill="#9B7CD6">
<ellipse cx="100" cy="46" rx="13" ry="17"/><ellipse cx="87" cy="66" rx="11" ry="14"/><ellipse cx="113" cy="66" rx="11" ry="14"/>
<ellipse cx="89" cy="88" rx="10" ry="13"/><ellipse cx="111" cy="88" rx="10" ry="13"/><ellipse cx="91" cy="108" rx="9" ry="12"/><ellipse cx="109" cy="108" rx="9" ry="12"/>
</g>
<g fill="#C3A6E6"><circle cx="100" cy="44" r="5"/><circle cx="87" cy="64" r="4"/><circle cx="113" cy="64" r="4"/><circle cx="89" cy="86" r="4"/><circle cx="111" cy="86" r="4"/></g>
</svg>`
const cherry = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<g fill="#F49AC1">
<ellipse cx="100" cy="62" rx="16" ry="24" transform="rotate(0 100 96)"/><ellipse cx="100" cy="62" rx="16" ry="24" transform="rotate(72 100 96)"/>
<ellipse cx="100" cy="62" rx="16" ry="24" transform="rotate(144 100 96)"/><ellipse cx="100" cy="62" rx="16" ry="24" transform="rotate(216 100 96)"/><ellipse cx="100" cy="62" rx="16" ry="24" transform="rotate(288 100 96)"/>
</g>
<circle cx="100" cy="96" r="14" fill="#FFE0EC"/>
<g fill="#E86BA0"><circle cx="100" cy="96" r="5"/><circle cx="100" cy="84" r="2.5"/><circle cx="111" cy="100" r="2.5"/><circle cx="89" cy="100" r="2.5"/></g>
</svg>`
const camellia = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<g fill="#D6336C">
<ellipse cx="100" cy="60" rx="18" ry="27" transform="rotate(0 100 96)"/><ellipse cx="100" cy="60" rx="18" ry="27" transform="rotate(60 100 96)"/><ellipse cx="100" cy="60" rx="18" ry="27" transform="rotate(120 100 96)"/>
<ellipse cx="100" cy="60" rx="18" ry="27" transform="rotate(180 100 96)"/><ellipse cx="100" cy="60" rx="18" ry="27" transform="rotate(240 100 96)"/><ellipse cx="100" cy="60" rx="18" ry="27" transform="rotate(300 100 96)"/>
</g>
<g fill="#F06595">
<ellipse cx="100" cy="76" rx="12" ry="18" transform="rotate(30 100 96)"/><ellipse cx="100" cy="76" rx="12" ry="18" transform="rotate(150 100 96)"/><ellipse cx="100" cy="76" rx="12" ry="18" transform="rotate(270 100 96)"/>
</g>
<circle cx="100" cy="96" r="13" fill="#FFD43B"/>
</svg>`
const tulip = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<rect x="95" y="104" width="10" height="60" rx="5" fill="#3E8E5A"/>
<ellipse cx="76" cy="122" rx="17" ry="9" fill="#52A86E" transform="rotate(-30 76 122)"/>
<path d="M68 74 C68 110 82 134 100 134 C118 134 132 110 132 74 C124 92 118 92 110 78 C104 96 96 96 90 78 C82 92 76 92 68 74 Z" fill="#FF6F91"/>
<path d="M90 78 C96 96 104 96 110 78 L110 122 C100 132 100 132 90 122 Z" fill="#FF9EC0"/>
</svg>`

/* ── 오행 5종 (운세) ── */
const elWood = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<rect x="96" y="96" width="8" height="64" rx="4" fill="#2E7D52"/>
<path d="M100 116 C58 116 54 64 100 60 C100 100 100 116 100 116 Z" fill="#36B37E"/>
<path d="M100 128 C142 128 146 80 100 76 C100 112 100 128 100 128 Z" fill="#56C896"/>
<path d="M100 60 L100 132" stroke="#2E7D52" stroke-width="4" stroke-linecap="round"/>
</svg>`
const elFire = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<path d="M100 34 C120 70 138 92 118 126 C113 152 87 152 82 126 C64 96 80 72 100 34 Z" fill="#FF5630"/>
<path d="M100 72 C112 94 120 110 105 128 C101 140 92 136 92 122 C82 106 92 92 100 72 Z" fill="#FFC02E"/>
</svg>`
const elEarth = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<path d="M26 154 L74 84 L104 124 L140 72 L176 154 Z" fill="#C99A48"/>
<path d="M140 72 L126 92 L156 92 Z" fill="#F0E0C0"/><path d="M74 84 L62 102 L88 102 Z" fill="#F0E0C0"/>
<rect x="24" y="150" width="154" height="10" rx="5" fill="#A87B33"/>
</svg>`
const elMetal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<path d="M68 66 L132 66 L156 98 L100 156 L44 98 Z" fill="#E8C547"/>
<path d="M68 66 L132 66 L156 98 L44 98 Z" fill="#F5DE7A"/>
<path d="M44 98 L156 98 L100 156 Z" fill="#D4AF37"/>
<path d="M68 66 L88 98 L44 98 Z" fill="#FFF3B0" opacity="0.7"/>
</svg>`
const elWater = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<path d="M100 34 C100 34 152 98 152 124 A52 52 0 1 1 48 124 C48 98 100 34 100 34 Z" fill="#2B6FB5"/>
<path d="M122 118 a20 26 0 0 1 -12 34" stroke="#A7C9EE" stroke-width="8" fill="none" stroke-linecap="round"/>
</svg>`

/** 오행(목화토금수) 아이콘 SVG */
export const ELEMENT_SVG: Record<string, string> = { 목: elWood, 화: elFire, 토: elEarth, 금: elMetal, 수: elWater }

export const CHARACTERS: Record<string, string> = {
  '🌹': rose,
  '🌻': sunflower,
  '💜': lavender,
  '🌸': cherry,
  '🌺': camellia,
  '🌷': tulip,
  '🐯': tiger,
  '🦊': fox,
  '🦉': owl,
  '🐨': koala,
  '🐧': penguin,
  '🐢': turtle,
  '🐹': hamster,
  '🦔': hedgehog,
}

export function characterSvg(emoji: string): string | undefined {
  return CHARACTERS[emoji]
}
