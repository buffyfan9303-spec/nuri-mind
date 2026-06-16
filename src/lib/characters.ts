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

export const CHARACTERS: Record<string, string> = {
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
