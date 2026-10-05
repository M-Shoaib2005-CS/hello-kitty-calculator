export type Theme = "day" | "night";
export type CalcMode = "basic" | "sci";
export type AngleMode = "deg" | "rad";

export type LevelResult = { stars: number; best: number };

export type SaveState = {
  muted: boolean;
  theme: Theme;
  reducedMotion: boolean;
  calcMode: CalcMode;
  angle: AngleMode;
  /** key = `${pathId}:${level}` */
  progress: Record<string, LevelResult>;
  /** story chapters already read: `${pathId}:${chapter}` */
  seenStories: string[];
  favourites: string[];
  hat: string;
  streak: number;
  /** local date YYYY-MM-DD of the last day a level was finished */
  lastPlay: string;
  haptics: boolean;
  /** first-run welcome has been shown */
  onboarded: boolean;
  /** newest first, capped at HISTORY_MAX */
  history: HistoryItem[];
};

export type HistoryItem = { expr: string; result: string };
export const HISTORY_MAX = 20;

const KEY = "catularor-save";

const defaults: SaveState = {
  muted: false,
  theme: "day",
  reducedMotion: false,
  calcMode: "basic",
  angle: "deg",
  progress: {},
  seenStories: [],
  favourites: [],
  hat: "none",
  streak: 0,
  lastPlay: "",
  haptics: true,
  onboarded: false,
  history: [],
};

function readRaw(): unknown {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function isTheme(v: unknown): v is Theme {
  return v === "day" || v === "night";
}

function strings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function progressFrom(v: unknown): Record<string, LevelResult> {
  const out: Record<string, LevelResult> = {};
  if (!v || typeof v !== "object") return out;
  for (const [k, r] of Object.entries(v as Record<string, unknown>)) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    const stars = typeof o.stars === "number" ? Math.max(0, Math.min(3, Math.floor(o.stars))) : 0;
    const best = typeof o.best === "number" ? Math.max(0, Math.floor(o.best)) : 0;
    out[k] = { stars, best };
  }
  return out;
}

function historyFrom(v: unknown): HistoryItem[] {
  if (!Array.isArray(v)) return [];
  const out: HistoryItem[] = [];
  for (const h of v) {
    if (!h || typeof h !== "object") continue;
    const o = h as Record<string, unknown>;
    if (typeof o.expr === "string" && typeof o.result === "string") {
      out.push({ expr: o.expr.slice(0, 120), result: o.result.slice(0, 40) });
    }
    if (out.length >= HISTORY_MAX) break;
  }
  return out;
}

export function parseSave(parsed: unknown): SaveState {
  if (!parsed || typeof parsed !== "object") return { ...defaults, progress: {}, seenStories: [], favourites: [], history: [] };
  const o = parsed as Record<string, unknown>;
  return {
    muted: typeof o.muted === "boolean" ? o.muted : defaults.muted,
    theme: isTheme(o.theme) ? o.theme : defaults.theme,
    reducedMotion: typeof o.reducedMotion === "boolean" ? o.reducedMotion : defaults.reducedMotion,
    calcMode: o.calcMode === "sci" ? "sci" : "basic",
    angle: o.angle === "rad" ? "rad" : "deg",
    progress: progressFrom(o.progress),
    seenStories: strings(o.seenStories),
    favourites: strings(o.favourites),
    hat: typeof o.hat === "string" ? o.hat : defaults.hat,
    streak: typeof o.streak === "number" && o.streak >= 0 ? Math.floor(o.streak) : 0,
    lastPlay: typeof o.lastPlay === "string" ? o.lastPlay : "",
    haptics: typeof o.haptics === "boolean" ? o.haptics : defaults.haptics,
    onboarded: typeof o.onboarded === "boolean" ? o.onboarded : defaults.onboarded,
    history: historyFrom(o.history),
  };
}

export function loadSave(): SaveState {
  return parseSave(readRaw());
}

export function persist(partial: Partial<SaveState>): SaveState {
  const next = { ...loadSave(), ...partial };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota — app still works this session */
  }
  return next;
}

export function resetProgress(): SaveState {
  return persist({ progress: {}, seenStories: [], streak: 0, lastPlay: "", hat: "none" });
}

export function totalStars(save: SaveState): number {
  return Object.values(save.progress).reduce((n, r) => n + r.stars, 0);
}

function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Pure streak maths: same day keeps, next day +1, longer gap restarts at 1. */
export function nextStreak(streak: number, lastPlay: string, today: Date): { streak: number; lastPlay: string } {
  const t = dayKey(today);
  if (lastPlay === t) return { streak: Math.max(1, streak), lastPlay: t };
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  if (lastPlay === dayKey(y)) return { streak: streak + 1, lastPlay: t };
  return { streak: 1, lastPlay: t };
}

/** Streak as it should be *shown* today (a missed day shows 0). */
export function liveStreak(save: SaveState, today: Date = new Date()): number {
  if (!save.lastPlay) return 0;
  if (save.lastPlay === dayKey(today)) return save.streak;
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  return save.lastPlay === dayKey(y) ? save.streak : 0;
}

/* ---- backup code: a pasteable text copy of the save ---- */

const CODE_PREFIX = "CATU1:";

function toB64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function fromB64(b64: string): string {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Only the things worth moving between devices (not history or the welcome flag). */
export function exportCode(save: SaveState): string {
  const { progress, seenStories, favourites, hat, streak, lastPlay } = save;
  return CODE_PREFIX + toB64(JSON.stringify({ progress, seenStories, favourites, hat, streak, lastPlay }));
}

/** Returns the restored fields, or null if the text is not a valid backup code. */
export function importCode(text: string): Partial<SaveState> | null {
  const t = text.trim().replace(/\s+/g, "");
  if (!t.startsWith(CODE_PREFIX)) return null;
  try {
    const parsed = JSON.parse(fromB64(t.slice(CODE_PREFIX.length))) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const clean = parseSave(parsed);
    return {
      progress: clean.progress,
      seenStories: clean.seenStories,
      favourites: clean.favourites,
      hat: clean.hat,
      streak: clean.streak,
      lastPlay: clean.lastPlay,
    };
  } catch {
    return null;
  }
}
