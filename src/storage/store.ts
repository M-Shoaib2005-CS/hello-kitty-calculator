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
};

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

export function parseSave(parsed: unknown): SaveState {
  if (!parsed || typeof parsed !== "object") return { ...defaults, progress: {}, seenStories: [], favourites: [] };
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
