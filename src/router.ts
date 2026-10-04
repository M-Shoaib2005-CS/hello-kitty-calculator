export type ScreenId = "calc" | "quest" | "formulas" | "profile";

const TITLES: Record<ScreenId, { title: string; kicker: string }> = {
  calc: { title: "Catularor", kicker: "meow-th" },
  quest: { title: "Math Quest", kicker: "paths ahead" },
  formulas: { title: "Formulas", kicker: "cheat-sheet" },
  profile: { title: "Profile", kicker: "your den" },
};

const VALID: ScreenId[] = ["calc", "quest", "formulas", "profile"];

export function isScreen(id: string): id is ScreenId {
  return VALID.includes(id as ScreenId);
}

export function screenFromHash(): ScreenId {
  const raw = location.hash.replace(/^#\/?/, "").split("/")[0] || "calc";
  return isScreen(raw) ? raw : "calc";
}

export function hashFor(id: ScreenId): string {
  return `#/${id}`;
}

export function copyFor(id: ScreenId): { title: string; kicker: string } {
  return TITLES[id];
}
