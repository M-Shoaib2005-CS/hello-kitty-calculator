import type { ScreenId } from "./router";
import { copyFor, hashFor, screenFromHash } from "./router";
import { persist, resetProgress, type SaveState } from "./storage/store";
import { setMuted, sfx, unlockAudio } from "./audio/sfx";
import { mountCalculator } from "./ui/calculator";
import { icon } from "./ui/icons";
import { mountFormulas, mountProfile } from "./ui/screens";
import { mountQuest } from "./ui/quest";

export function bootApp(initial: SaveState): void {
  let save = initial;
  applyTheme(save.theme);
  setMuted(save.muted);

  const app = document.getElementById("app")!;
  const boot = document.getElementById("boot")!;
  const title = document.getElementById("topTitle")!;
  const kicker = document.getElementById("topKicker")!;
  const muteBtn = document.getElementById("muteBtn") as HTMLButtonElement;
  const views: Record<ScreenId, HTMLElement> = {
    calc: document.getElementById("view-calc")!,
    quest: document.getElementById("view-quest")!,
    formulas: document.getElementById("view-formulas")!,
    profile: document.getElementById("view-profile")!,
  };

  const update = (partial: Partial<SaveState>): SaveState => {
    save = persist(partial);
    return save;
  };

  mountCalculator(views.calc, {
    mode: save.calcMode,
    angle: save.angle,
    onMode: (calcMode) => update({ calcMode }),
    onAngle: (angle) => update({ angle }),
  });
  mountFormulas(views.formulas, { getSave: () => save, update });

  const paintMute = (): void => {
    muteBtn.innerHTML = icon(save.muted ? "volume-x" : "volume-2", { size: 22 });
    muteBtn.setAttribute("aria-label", save.muted ? "Unmute sounds" : "Mute sounds");
    muteBtn.setAttribute("aria-pressed", String(save.muted));
  };

  const paintProfile = (): void => {
    mountProfile(views.profile, {
      save,
      onMute: (muted) => {
        update({ muted });
        setMuted(muted);
        paintMute();
        paintProfile();
      },
      onNight: (on) => {
        update({ theme: on ? "night" : "day" });
        applyTheme(save.theme);
        paintProfile();
      },
      onHat: (hat) => {
        update({ hat });
        paintProfile();
      },
      onReset: () => {
        save = resetProgress();
        quest.repaint();
        paintProfile();
      },
    });
  };

  const quest = mountQuest(views.quest, { getSave: () => save, update, onChange: () => paintProfile() });

  // Each tab remembers where you were scrolled to.
  const scrollPos: Partial<Record<ScreenId, number>> = {};
  let current: ScreenId | null = null;

  const show = (id: ScreenId, pushHash: boolean): void => {
    const main = document.getElementById("main");
    if (main && current) scrollPos[current] = main.scrollTop;
    (Object.keys(views) as ScreenId[]).forEach((key) => {
      const on = key === id;
      views[key].classList.toggle("on", on);
      views[key].hidden = !on;
    });
    document.querySelectorAll<HTMLButtonElement>("[data-nav]").forEach((btn) => {
      const on = btn.dataset.nav === id;
      btn.classList.toggle("on", on);
      if (on) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });
    const copy = copyFor(id);
    title.textContent = copy.title;
    kicker.textContent = copy.kicker;
    current = id;
    if (main) main.scrollTop = scrollPos[id] ?? 0;
    main?.focus({ preventScroll: true });
    if (pushHash && location.hash !== hashFor(id)) {
      history.pushState({ screen: id }, "", hashFor(id));
    }
  };

  paintMute();
  paintProfile();

  muteBtn.addEventListener("click", () => {
    unlockAudio();
    update({ muted: !save.muted });
    setMuted(save.muted);
    paintMute();
    paintProfile();
  });

  document.querySelector(".nav")?.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-nav]");
    if (!btn?.dataset.nav) return;
    unlockAudio();
    sfx("tap");
    show(btn.dataset.nav as ScreenId, true);
  });

  window.addEventListener("popstate", () => {
    show(screenFromHash(), false);
  });

  window.addEventListener("hashchange", () => {
    show(screenFromHash(), false);
  });

  if (!location.hash) history.replaceState({ screen: "calc" }, "", hashFor("calc"));
  show(screenFromHash(), false);

  app.hidden = false;
  boot.classList.add("is-done");
  boot.setAttribute("aria-hidden", "true");
  boot.setAttribute("hidden", "");
  window.setTimeout(() => boot.remove(), 400);
}

function applyTheme(theme: SaveState["theme"]): void {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", theme === "night" ? "#1a1520" : "#fff9fb");
}
