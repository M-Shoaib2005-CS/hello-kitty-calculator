import type { PathId } from "./generators";
import { isBoss, LEVELS_PER_PATH, PATHS, pathIndex, QUESTIONS_PER_BOSS, QUESTIONS_PER_LEVEL } from "./paths";
import { nextStreak, type LevelResult, type SaveState } from "../storage/store";

/** Stars needed to move on: boss levels have a 2-star gate. */
export function starsToPass(level: number): number {
  return isBoss(level) ? 2 : 1;
}

export function questionCount(level: number): number {
  return isBoss(level) ? QUESTIONS_PER_BOSS : QUESTIONS_PER_LEVEL;
}

export function starsFor(correct: number, total: number): number {
  if (total <= 0) return 0;
  const r = correct / total;
  if (r >= 0.9) return 3;
  if (r >= 0.75) return 2;
  if (r >= 0.5) return 1;
  return 0;
}

export const keyOf = (path: PathId, level: number): string => `${path}:${level}`;

export function resultOf(save: SaveState, path: PathId, level: number): LevelResult {
  return save.progress[keyOf(path, level)] ?? { stars: 0, best: 0 };
}

export function isPassed(save: SaveState, path: PathId, level: number): boolean {
  return resultOf(save, path, level).stars >= starsToPass(level);
}

export function passedCount(save: SaveState, path: PathId): number {
  let n = 0;
  for (let l = 1; l <= LEVELS_PER_PATH; l++) if (isPassed(save, path, l)) n++;
  return n;
}

export function pathUnlocked(save: SaveState, path: PathId): boolean {
  const i = pathIndex(path);
  if (i <= 0) return true;
  return passedCount(save, PATHS[i - 1].id) >= 10;
}

export function levelUnlocked(save: SaveState, path: PathId, level: number): boolean {
  if (!pathUnlocked(save, path)) return false;
  if (level <= 1) return true;
  return isPassed(save, path, level - 1);
}

/** The next level the player should tackle on this path (30 if all done). */
export function frontier(save: SaveState, path: PathId): number {
  for (let l = 1; l <= LEVELS_PER_PATH; l++) if (!isPassed(save, path, l)) return l;
  return LEVELS_PER_PATH;
}

export type Outcome = {
  stars: number;
  passed: boolean;
  newBest: boolean;
  gateMissed: boolean;
  save: Partial<SaveState>;
};

/** Pure: compute what to persist after finishing a level. Stars never go down. */
export function applyResult(save: SaveState, path: PathId, level: number, correct: number, total: number, today: Date = new Date()): Outcome {
  const stars = starsFor(correct, total);
  const prev = resultOf(save, path, level);
  const best = Math.max(prev.best, correct);
  const keep = Math.max(prev.stars, stars);
  const s = nextStreak(save.streak, save.lastPlay, today);
  return {
    stars,
    passed: stars >= starsToPass(level),
    newBest: stars > prev.stars,
    gateMissed: isBoss(level) && stars < starsToPass(level),
    save: {
      progress: { ...save.progress, [keyOf(path, level)]: { stars: keep, best } },
      streak: s.streak,
      lastPlay: s.lastPlay,
    },
  };
}

export type HatId = "none" | "bow" | "cap" | "top" | "grad" | "crown";

export type Hat = { id: HatId; name: string; stars: number };

export const HATS: Hat[] = [
  { id: "none", name: "Plain kitty", stars: 0 },
  { id: "bow", name: "Pink bow", stars: 5 },
  { id: "cap", name: "Sporty cap", stars: 15 },
  { id: "top", name: "Top hat", stars: 40 },
  { id: "grad", name: "Graduate cap", stars: 80 },
  { id: "crown", name: "Golden crown", stars: 150 },
];

export function asHat(id: string): HatId {
  return HATS.some((h) => h.id === id) ? (id as HatId) : "none";
}
