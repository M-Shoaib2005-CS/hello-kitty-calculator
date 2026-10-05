import { icon, type IconName } from "./icons";
import { kittySvg } from "./kitty";
import { sfx } from "../audio/sfx";

type Step = { ico: IconName; title: string; body: string };

const STEPS: Step[] = [
  { ico: "calculator", title: "A calculator with whiskers", body: "Basic and Scientific modes, a history of your last sums, and tap-to-copy results." },
  { ico: "map", title: "Math Quest", body: "Six story paths, 180 levels, tiny lessons and gentle hints. Earn stars and unlock hats." },
  { ico: "book-open", title: "Formula book", body: "69 formulas you can search, star and read offline. No account. No ads. No internet needed." },
];

/** First-run welcome. Resolves when the person finishes or skips. */
export function showWelcome(): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    const back = document.createElement("div");
    back.className = "welcome";
    back.setAttribute("role", "dialog");
    back.setAttribute("aria-modal", "true");
    back.setAttribute("aria-label", "Welcome to Catularor");
    document.body.appendChild(back);
    const previous = document.activeElement as HTMLElement | null;

    const close = (): void => {
      back.classList.add("out");
      window.setTimeout(() => {
        back.remove();
        previous?.focus?.();
        resolve();
      }, 220);
    };

    const paint = (): void => {
      const s = STEPS[i];
      const last = i === STEPS.length - 1;
      back.innerHTML = `
        <div class="welcome-card">
          <div class="welcome-kitty" aria-hidden="true">${i === 0 ? kittySvg("bow", 92) : `<div class="badge">${icon(s.ico, { size: 44 })}</div>`}</div>
          <h2>${i === 0 ? "Hello, I'm Mochi!" : s.title}</h2>
          <p>${i === 0 ? "Welcome to Catularor. " : ""}${s.body}</p>
          <div class="dots" aria-hidden="true">${STEPS.map((_, n) => `<i class="${n === i ? "on" : ""}"></i>`).join("")}</div>
          <button type="button" class="wide pink" id="wNext">${last ? "Let's go" : "Next"}</button>
          ${last ? "" : `<button type="button" class="link" id="wSkip">Skip</button>`}
        </div>`;
      back.querySelector<HTMLButtonElement>("#wNext")?.focus();
      back.querySelector("#wNext")?.addEventListener("click", () => {
        sfx("tap");
        if (last) close();
        else {
          i += 1;
          paint();
        }
      });
      back.querySelector("#wSkip")?.addEventListener("click", close);
    };

    back.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
    paint();
  });
}
