import "@fontsource/baloo-2/latin-500.css";
import "@fontsource/baloo-2/latin-600.css";
import "@fontsource/baloo-2/latin-700.css";
import "@fontsource/baloo-2/latin-800.css";
import "@fontsource/nunito/latin-400.css";
import "@fontsource/nunito/latin-600.css";
import "@fontsource/nunito/latin-700.css";

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/shell.css";
import "./styles/calculator.css";
import "./styles/quest.css";
import "./styles/formulas.css";
import "./styles/icons.css";
import "./styles/polish.css";

import { loadSave, persist } from "./storage/store";
import { bootApp } from "./app";
import { paintChrome } from "./ui/chrome";
import { showFatal } from "./ui/fatal";

window.addEventListener("error", (e) => showFatal(e.error ?? e.message));
window.addEventListener("unhandledrejection", (e) => showFatal(e.reason));

try {
  paintChrome();
  const save = loadSave();
  if (!save.onboarded && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    persist({ reducedMotion: true });
    save.reducedMotion = true;
  }

  const fonts = document.fonts?.ready ?? Promise.resolve();
  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, 1800));
  void Promise.race([fonts, timeout])
    .finally(() => {
      try {
        bootApp(save);
      } catch (err) {
        showFatal(err);
      }
    });
} catch (err) {
  showFatal(err);
}

// Offline support for the web version. The Android app already ships its files, so skip it there.
const inCapacitor = Boolean((window as unknown as { Capacitor?: unknown }).Capacitor);
if ("serviceWorker" in navigator && location.protocol.startsWith("http") && !inCapacitor) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => undefined);
  });
}
