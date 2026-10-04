import { icon, type IconName } from "./icons";
import { kittySvg } from "./kitty";

const FLOATIES: { name: IconName; style: string }[] = [
  { name: "sparkles", style: "top: 8%; left: 6%" },
  { name: "paw-print", style: "top: 16%; right: 8%; animation-delay: 1.5s" },
  { name: "sparkles", style: "bottom: 22%; left: 10%; animation-delay: 3s" },
  { name: "paw-print", style: "bottom: 28%; right: 6%; animation-delay: 2s" },
];

/** Fills the static shell (splash kitty, background doodles, tab icons) with SVG icons. */
export function paintChrome(): void {
  const boot = document.getElementById("bootKitty");
  if (boot) boot.innerHTML = kittySvg("bow", 96);

  const floaties = document.getElementById("floaties");
  if (floaties) {
    floaties.innerHTML = FLOATIES.map(
      (f) => `<div class="floaty" aria-hidden="true" style="${f.style}">${icon(f.name, { size: 24, sw: 2 })}</div>`,
    ).join("");
  }

  document.querySelectorAll<HTMLElement>("[data-icon]").forEach((el) => {
    el.innerHTML = icon(el.dataset.icon as IconName, { size: 24, sw: 2.3 });
  });
}
