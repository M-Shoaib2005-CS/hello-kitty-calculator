import { icon } from "./icons";

const COLOURS = ["var(--pink-hot)", "var(--gold)", "var(--blue-edge)", "var(--green)"];

/** A one-off burst of falling stars and sparkles for a 3-star win. Pure decoration, hidden from screen readers. */
export function confetti(count = 16): string {
  return `<div class="confetti" aria-hidden="true">${Array.from({ length: count }, (_, i) => {
    const left = Math.round(Math.random() * 100);
    const delay = (Math.random() * 0.5).toFixed(2);
    const dur = (1.6 + Math.random() * 1.2).toFixed(2);
    const drift = Math.round(Math.random() * 60 - 30);
    const size = 12 + Math.round(Math.random() * 10);
    return `<i style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;--dx:${drift}px;color:${COLOURS[i % COLOURS.length]}">${icon(i % 3 ? "star" : "sparkles", { size, fill: i % 3 !== 0, sw: 2 })}</i>`;
  }).join("")}</div>`;
}
