import type { HatId } from "../quest/progress";

/**
 * Original kitty mascot (also the app icon art). Drawn on a 200x200 grid with fixed colours so it
 * stays a white kitty with a dark outline in both day and night themes.
 */
const INK = "#2b2b2b";

const HATS: Record<Exclude<HatId, "none">, string> = {
  bow: `
    <path d="M150 74 L130 63 L130 85 Z" fill="#ff8fb3" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M150 74 L170 63 L170 85 Z" fill="#ff8fb3" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="150" cy="74" r="6" fill="#ffd34d" stroke="${INK}" stroke-width="3.5"/>`,
  cap: `
    <path d="M62 56 C62 26 80 16 100 16 C120 16 138 26 138 56 Z" fill="#6bb8ea" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M136 52 C158 50 176 54 182 62 C166 66 148 63 136 58 Z" fill="#4e9fd6" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <circle cx="100" cy="16" r="5" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
    <path d="M100 18 V52" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".35"/>`,
  top: `
    <path d="M72 46 V14 Q72 8 78 8 H122 Q128 8 128 14 V46 Z" fill="#3a3a44" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <rect x="72" y="32" width="56" height="10" fill="#ff8fb3" stroke="${INK}" stroke-width="3.5"/>
    <ellipse cx="100" cy="47" rx="40" ry="8" fill="#3a3a44" stroke="${INK}" stroke-width="4.5"/>`,
  grad: `
    <path d="M78 44 V62 Q100 74 122 62 V44 Z" fill="#3a3a44" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M100 18 L162 40 L100 62 L38 40 Z" fill="#4a4a58" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M100 40 L150 48 V70" fill="none" stroke="#ffd34d" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="150" cy="73" r="5" fill="#ffd34d" stroke="${INK}" stroke-width="3"/>`,
  crown: `
    <path d="M64 52 L60 22 L82 38 L100 14 L118 38 L140 22 L136 52 Z" fill="#ffd34d" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <circle cx="60" cy="20" r="4.5" fill="#ff8fb3" stroke="${INK}" stroke-width="3"/>
    <circle cx="100" cy="12" r="4.5" fill="#ff8fb3" stroke="${INK}" stroke-width="3"/>
    <circle cx="140" cy="20" r="4.5" fill="#ff8fb3" stroke="${INK}" stroke-width="3"/>`,
};

export function kittySvg(hat: HatId = "none", size = 64, cls = ""): string {
  const hatMarkup = hat === "none" ? "" : HATS[hat];
  // Tall hats need extra headroom, so the viewBox starts a little higher.
  return `<svg class="kitty ${cls}" width="${size}" height="${size}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
    <path d="M52 76 L58 28 L96 52 Z" fill="#fff" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M148 76 L142 28 L104 52 Z" fill="#fff" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M62 66 L65 42 L86 54 Z" fill="#ffc9dd"/>
    <path d="M138 66 L135 42 L114 54 Z" fill="#ffc9dd"/>
    <ellipse cx="100" cy="108" rx="72" ry="58" fill="#fff" stroke="${INK}" stroke-width="4.5"/>
    <ellipse cx="70" cy="110" rx="7" ry="9" fill="${INK}"/><ellipse cx="130" cy="110" rx="7" ry="9" fill="${INK}"/>
    <circle cx="72.5" cy="106" r="2.6" fill="#fff"/><circle cx="132.5" cy="106" r="2.6" fill="#fff"/>
    <ellipse cx="100" cy="125" rx="6.5" ry="4.8" fill="#ffb703" stroke="${INK}" stroke-width="3"/>
    <path d="M89 135 Q94.5 143 100 135 Q105.5 143 111 135" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="55" cy="130" rx="11" ry="7" fill="#ffc9dd"/><ellipse cx="145" cy="130" rx="11" ry="7" fill="#ffc9dd"/>
    <path d="M22 122 L58 124 M22 134 L58 130 M178 122 L142 124 M178 134 L142 130" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    ${hatMarkup}
  </svg>`;
}
