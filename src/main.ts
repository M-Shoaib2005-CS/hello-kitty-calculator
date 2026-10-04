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

import { loadSave, persist } from "./storage/store";
import { bootApp } from "./app";
import { paintChrome } from "./ui/chrome";

paintChrome();
const save = loadSave();
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  persist({ reducedMotion: true });
}

const fonts = document.fonts?.ready ?? Promise.resolve();
const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, 1800));
void Promise.race([fonts, timeout]).finally(() => bootApp(save));
