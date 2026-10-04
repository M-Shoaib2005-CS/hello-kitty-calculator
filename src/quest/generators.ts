import { hintFor } from "./hints";

export type Rng = () => number;

export type Question = {
  prompt: string;
  answer: string;
  /** exactly 4 unique strings, includes `answer` */
  choices: string[];
  /** one friendly line shown after answering */
  explain: string;
  /** a nudge shown on request; never contains the answer */
  hint: string;
};

export type PathId = "add" | "mul" | "frac" | "alg" | "geo" | "trig";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const ri = (r: Rng, a: number, b: number): number => a + Math.floor(r() * (b - a + 1));
const pick = <T>(r: Rng, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];

export function shuffle<T>(r: Rng, xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

function frac(n: number, d: number): string {
  const g = gcd(n, d);
  const nn = n / g;
  const dd = d / g;
  return dd === 1 ? String(nn) : `${nn}/${dd}`;
}

function pool4(r: Rng, correct: string, distractors: string[]): string[] {
  const seen = new Set<string>([correct]);
  const out: string[] = [];
  for (const d of shuffle(r, distractors)) {
    if (!seen.has(d)) {
      seen.add(d);
      out.push(d);
    }
    if (out.length === 3) break;
  }
  // last-resort padding so a level can never crash
  let pad = 1;
  while (out.length < 3) {
    const d = `${correct}${"′".repeat(pad++)}`;
    if (!seen.has(d)) {
      seen.add(d);
      out.push(d);
    }
  }
  return shuffle(r, [correct, ...out]);
}

function numChoices(r: Rng, correct: number, allowNeg = false): string[] {
  const span = Math.max(2, Math.round(Math.abs(correct) * 0.1));
  const cands = new Set<number>();
  for (const d of [1, -1, 2, -2, 10, -10, span, -span, 3, -3, 5, -5]) cands.add(correct + d);
  cands.add(-correct);
  const list = [...cands].filter((n) => n !== correct && (allowNeg || n >= 0));
  return pool4(r, String(correct), list.map(String));
}

function decStr(x: number): string {
  return String(parseFloat(x.toFixed(4)));
}

function decChoices(r: Rng, correct: number): string[] {
  const c = [correct + 0.1, correct - 0.1, correct * 10, correct / 10, correct + 1, correct - 1, correct + 0.5]
    .filter((x) => x > 0 && Math.abs(x - correct) > 1e-9)
    .map(decStr);
  return pool4(r, decStr(correct), c);
}

function make(prompt: string, answer: string, choices: string[], explain: string): Question {
  return { prompt, answer, choices, explain, hint: "" };
}

const NAMES = ["Mochi", "Biscuit", "Pumpkin", "Noodle", "Luna", "Tofu"];
const TREATS = ["fish cookies", "yarn balls", "tuna bites", "milk drops", "toy mice"];

/* ------------------------------------------------------------------ */
/* Path 1 — Add & Subtract                                             */
/* ------------------------------------------------------------------ */

function qAdd(r: Rng, L: number): Question {
  let a: number;
  let b: number;
  const tier = L <= 10 ? 1 : L <= 20 ? 2 : 3;
  const sub = L >= 4 && r() < 0.5;

  if (tier === 1) {
    const max = L <= 5 ? 10 : 20;
    if (sub) {
      a = ri(r, 2, max);
      b = ri(r, 1, a - 1);
    } else {
      a = ri(r, 1, max - 1);
      b = ri(r, 1, max - a);
    }
  } else if (tier === 2) {
    a = ri(r, 21, 99);
    b = ri(r, 11, 89);
    if (L >= 16 && !sub && r() < 0.5) {
      const c = ri(r, 5, 40);
      return make(`${a} + ${b} + ${c} = ?`, String(a + b + c), numChoices(r, a + b + c), `Add two at a time: ${a} + ${b} = ${a + b}, then + ${c}.`);
    }
  } else {
    a = ri(r, 120, 999);
    b = ri(r, 101, 899);
    if (L >= 26 && r() < 0.35) {
      const total = a + b;
      return make(`? + ${b} = ${total}`, String(a), numChoices(r, a), `Undo the add: ${total} − ${b} = ${a}.`);
    }
    if (L >= 26 && r() < 0.3) {
      const x = ri(r, 12, 60);
      const y = ri(r, x + 5, x + 90);
      return make(`${x} − ${y} = ?`, String(x - y), numChoices(r, x - y, true), `Going below zero gives a negative: ${x} − ${y} = ${x - y}.`);
    }
  }
  if (sub) {
    if (b > a) [a, b] = [b, a];
    return make(`${a} − ${b} = ?`, String(a - b), numChoices(r, a - b), `${a} take away ${b} leaves ${a - b}.`);
  }
  return make(`${a} + ${b} = ?`, String(a + b), numChoices(r, a + b), `${a} and ${b} together make ${a + b}.`);
}

/* ------------------------------------------------------------------ */
/* Path 2 — Multiply & Divide                                          */
/* ------------------------------------------------------------------ */

function qMul(r: Rng, L: number): Question {
  const tier = L <= 10 ? 1 : L <= 20 ? 2 : 3;
  if (tier === 1) {
    const maxT = Math.min(7, 2 + Math.ceil(L / 2));
    const a = ri(r, 2, maxT);
    const b = ri(r, 1, 10);
    if (L >= 6 && r() < 0.4) {
      return make(`${a * b} ÷ ${a} = ?`, String(b), numChoices(r, b), `${a} × ${b} = ${a * b}, so ${a * b} ÷ ${a} = ${b}.`);
    }
    return make(`${a} × ${b} = ?`, String(a * b), numChoices(r, a * b), `${a} groups of ${b} make ${a * b}.`);
  }
  if (tier === 2) {
    const roll = r();
    if (roll < 0.25) {
      const boxes = ri(r, 3, 9);
      const each = ri(r, 4, 12);
      return make(`${pick(r, NAMES)} packs ${boxes} boxes with ${each} ${pick(r, TREATS)} each. How many in all?`, String(boxes * each), numChoices(r, boxes * each), `${boxes} × ${each} = ${boxes * each}.`);
    }
    if (L >= 16 && roll < 0.65) {
      const a = ri(r, 12, 49);
      const b = ri(r, 3, 9);
      return make(`${a} × ${b} = ?`, String(a * b), numChoices(r, a * b), `Split ${a} into tens and ones, multiply each by ${b}, then add.`);
    }
    if (roll < 0.8) {
      const a = ri(r, 3, 12);
      const b = ri(r, 3, 12);
      return make(`${a * b} ÷ ${a} = ?`, String(b), numChoices(r, b), `Think: ${a} × ? = ${a * b}.`);
    }
    const a = ri(r, 6, 12);
    const b = ri(r, 6, 12);
    return make(`${a} × ${b} = ?`, String(a * b), numChoices(r, a * b), `${a} × ${b} = ${a * b}.`);
  }
  const roll = r();
  if (roll < 0.3) {
    const a = ri(r, 12, 25);
    const b = ri(r, 11, 19);
    return make(`${a} × ${b} = ?`, String(a * b), numChoices(r, a * b), `${a} × ${b} = ${a} × 10 + ${a} × ${b - 10} = ${a * b}.`);
  }
  if (roll < 0.5) {
    const a = ri(r, 101, 399);
    const b = ri(r, 2, 6);
    return make(`${a} × ${b} = ?`, String(a * b), numChoices(r, a * b), `Hundreds, tens, ones — multiply each by ${b}.`);
  }
  if (roll < 0.75) {
    const d = ri(r, 3, 9);
    const q = ri(r, 4, 15);
    const rem = ri(r, 1, d - 1);
    const n = d * q + rem;
    const ans = `${q} r ${rem}`;
    const pool = [`${q + 1} r ${rem}`, `${q} r ${rem + 1}`, `${q - 1} r ${rem}`, `${q} r ${d - rem}`, `${q + 1} r ${Math.max(0, rem - 1)}`];
    return make(`${n} ÷ ${d} = ? (quotient r remainder)`, ans, pool4(r, ans, pool), `${d} × ${q} = ${d * q}, and ${n} − ${d * q} = ${rem} left over.`);
  }
  const a = ri(r, 2, 9);
  const b = ri(r, 2, 9);
  const c = ri(r, 2, 9);
  return make(`${a} + ${b} × ${c} = ?`, String(a + b * c), numChoices(r, a + b * c), `Multiply first: ${b} × ${c} = ${b * c}, then add ${a}.`);
}

/* ------------------------------------------------------------------ */
/* Path 3 — Fractions, decimals, percent                               */
/* ------------------------------------------------------------------ */

function fracChoices(r: Rng, n: number, d: number): string[] {
  const ans = frac(n, d);
  const c = [frac(n + 1, d), frac(Math.max(1, n - 1), d), frac(n, d + 1), frac(n + 1, d + 1), frac(d, n || 1), frac(n * 2, d + 2), frac(n + 2, d), frac(n, d + 2)];
  return pool4(r, ans, c.filter((x) => x !== ans));
}

function qFrac(r: Rng, L: number): Question {
  const tier = L <= 10 ? 1 : L <= 20 ? 2 : 3;
  if (tier === 1) {
    const roll = r();
    if (roll < 0.35) {
      const d = pick(r, [2, 3, 4, 5]);
      const k = ri(r, 2, 6);
      const whole = d * k;
      const n = d === 2 ? 1 : ri(r, 1, d - 1);
      const ans = (whole / d) * n;
      return make(`What is ${n}/${d} of ${whole}?`, String(ans), numChoices(r, ans), `Split ${whole} into ${d} equal parts (${whole / d} each), take ${n}.`);
    }
    if (roll < 0.6) {
      const d = ri(r, 4, 10);
      const a = ri(r, 1, d - 2);
      const b = ri(r, 1, d - a - 1);
      const ans = `${a + b}/${d}`;
      return make(`${a}/${d} + ${b}/${d} = ?`, ans, pool4(r, ans, [`${a + b}/${d * 2}`, `${a + b + 1}/${d}`, `${Math.max(1, a + b - 1)}/${d}`, `${a * b}/${d}`, `${a + b}/${d + 1}`]), `Same bottom number? Just add the tops: ${a} + ${b} = ${a + b}.`);
    }
    if (roll < 0.8) {
      const d = pick(r, [2, 3, 4, 5]);
      const m = ri(r, 2, 4);
      const n = ri(r, 1, d - 1 || 1);
      const ans = String(n * m);
      return make(`${n}/${d} = ?/${d * m}`, ans, numChoices(r, n * m), `Multiply top and bottom by ${m}: ${n} × ${m} = ${n * m}.`);
    }
    const d1 = ri(r, 2, 9);
    let d2 = ri(r, 2, 9);
    if (d1 === d2) d2 = d1 === 9 ? 8 : d1 + 1;
    const ans = d1 < d2 ? `1/${d1}` : `1/${d2}`;
    return make(`Which is bigger: 1/${d1} or 1/${d2}?`, ans, shuffle(r, [`1/${d1}`, `1/${d2}`, "They are equal", "Can't tell"]), `Fewer slices means bigger slices: ${ans} wins.`);
  }
  if (tier === 2) {
    const roll = r();
    if (roll < 0.3) {
      const g = ri(r, 2, 6);
      let n = ri(r, 1, 7);
      let d = ri(r, n + 1, 12);
      if (gcd(n, d) !== 1) {
        n = 1;
        d = ri(r, 2, 9);
      }
      return make(`Simplify ${n * g}/${d * g}`, frac(n, d), fracChoices(r, n, d), `Divide top and bottom by ${g}.`);
    }
    if (roll < 0.6) {
      const [d1, d2] = pick(r, [[2, 3], [2, 4], [3, 4], [2, 6], [3, 6], [4, 6], [2, 5]] as const);
      const n1 = ri(r, 1, d1 - 1 || 1);
      const n2 = ri(r, 1, d2 - 1);
      const den = (d1 * d2) / gcd(d1, d2);
      const num = n1 * (den / d1) + n2 * (den / d2);
      const ans = frac(num, den);
      return make(`${n1}/${d1} + ${n2}/${d2} = ?`, ans, fracChoices(r, num, den), `Match the bottoms to ${den}: ${n1 * (den / d1)}/${den} + ${n2 * (den / d2)}/${den} = ${ans}.`);
    }
    if (roll < 0.85) {
      const pairs: [string, string][] = [["0.5", "1/2"], ["0.25", "1/4"], ["0.75", "3/4"], ["0.2", "1/5"], ["0.4", "2/5"], ["0.125", "1/8"], ["0.6", "3/5"], ["0.8", "4/5"]];
      const [dec, fr] = pick(r, pairs);
      return make(`Write ${dec} as a fraction`, fr, pool4(r, fr, pairs.map((p) => p[1])), `${dec} is ${fr} in simplest form.`);
    }
    const a = ri(r, 11, 99) / 10;
    const b = ri(r, 11, 99) / 10;
    const ans = parseFloat((a + b).toFixed(1));
    return make(`${a} + ${b} = ?`, decStr(ans), decChoices(r, ans), `Line up the decimal points and add.`);
  }
  const roll = r();
  if (roll < 0.28) {
    const n1 = ri(r, 1, 4);
    const d1 = ri(r, n1 + 1, 7);
    const n2 = ri(r, 1, 4);
    const d2 = ri(r, n2 + 1, 7);
    return make(`${n1}/${d1} × ${n2}/${d2} = ?`, frac(n1 * n2, d1 * d2), fracChoices(r, n1 * n2, d1 * d2), `Tops × tops, bottoms × bottoms: ${n1 * n2}/${d1 * d2}.`);
  }
  if (roll < 0.5) {
    const n1 = ri(r, 1, 4);
    const d1 = ri(r, n1 + 1, 7);
    const n2 = ri(r, 1, 4);
    const d2 = ri(r, n2 + 1, 7);
    return make(`${n1}/${d1} ÷ ${n2}/${d2} = ?`, frac(n1 * d2, d1 * n2), fracChoices(r, n1 * d2, d1 * n2), `Flip the second fraction and multiply.`);
  }
  if (roll < 0.8) {
    const p = pick(r, [10, 20, 25, 50, 15, 5, 30, 75]);
    const base = pick(r, [40, 60, 80, 120, 200, 240]);
    const ans = (p * base) / 100;
    return make(`${p}% of ${base} = ?`, decStr(ans), pool4(r, decStr(ans), [decStr(ans * 2), decStr(ans / 2), decStr(ans + 10), decStr(Math.max(1, ans - 5)), decStr(base - ans)]), `${p}% = ${p}/100, and ${p}/100 × ${base} = ${decStr(ans)}.`);
  }
  const a = ri(r, 12, 99) / 10;
  const b = ri(r, 2, 9);
  const ans = parseFloat((a * b).toFixed(1));
  return make(`${a} × ${b} = ?`, decStr(ans), decChoices(r, ans), `Multiply ${a * 10} × ${b} = ${a * 10 * b}, then put the decimal point back.`);
}

/* ------------------------------------------------------------------ */
/* Path 4 — Algebra                                                    */
/* ------------------------------------------------------------------ */

const sgn = (n: number): string => (n < 0 ? `− ${-n}` : `+ ${n}`);

function qAlg(r: Rng, L: number): Question {
  const tier = L <= 10 ? 1 : L <= 20 ? 2 : 3;
  if (tier === 1) {
    const x = ri(r, 2, 6 + L);
    const k = ri(r, 2, 9);
    const roll = r();
    if (roll < 0.3) return make(`x + ${k} = ${x + k}`, String(x), numChoices(r, x), `Subtract ${k} from both sides: x = ${x}.`);
    if (roll < 0.55) return make(`x − ${k} = ${x - k}`, String(x), numChoices(r, x), `Add ${k} to both sides: x = ${x}.`);
    if (roll < 0.8) return make(`${k}x = ${k * x}`, String(x), numChoices(r, x), `Divide both sides by ${k}: x = ${x}.`);
    return make(`x ÷ ${k} = ${x}`, String(x * k), numChoices(r, x * k), `Multiply both sides by ${k}: x = ${x * k}.`);
  }
  if (tier === 2) {
    const roll = r();
    if (roll < 0.4) {
      const x = ri(r, 2, 12);
      const a = ri(r, 2, 6);
      const b = ri(r, 1, 15);
      return make(`${a}x + ${b} = ${a * x + b}`, String(x), numChoices(r, x), `Subtract ${b}, then divide by ${a}.`);
    }
    if (roll < 0.6) {
      const x = ri(r, 3, 12);
      const a = ri(r, 2, 6);
      const b = ri(r, 1, a * x - 1);
      return make(`${a}x − ${b} = ${a * x - b}`, String(x), numChoices(r, x), `Add ${b}, then divide by ${a}.`);
    }
    if (roll < 0.8) {
      const x = ri(r, 2, 9);
      const a = ri(r, 2, 7);
      const b = ri(r, 1, 9);
      return make(`If x = ${x}, what is ${a}x + ${b}?`, String(a * x + b), numChoices(r, a * x + b), `${a} × ${x} + ${b} = ${a * x + b}.`);
    }
    const a = ri(r, 2, 6);
    const b = ri(r, 1, 9);
    const ans = `${a}x + ${a * b}`;
    return make(`Expand ${a}(x + ${b})`, ans, pool4(r, ans, [`${a}x + ${b}`, `x + ${a * b}`, `${a + 1}x + ${a * b}`, `${a}x + ${a + b}`]), `Multiply both parts by ${a}.`);
  }
  const roll = r();
  if (roll < 0.25) {
    const x = ri(r, 2, 10);
    const c = ri(r, 1, 4);
    const a = c + ri(r, 1, 4);
    const d = ri(r, 1, 12);
    // ax + bb = cx + d has solution x when bb = d - (a - c)x
    const bb = d - (a - c) * x;
    return make(`${a}x ${sgn(bb)} = ${c}x + ${d}`, String(x), numChoices(r, x, true), `Collect x's on one side: ${a - c}x = ${d - bb}, so x = ${x}.`);
  }
  if (roll < 0.45) {
    const p = ri(r, 1, 6);
    let q = ri(r, 1, 6);
    if (q === p) q = p === 6 ? 5 : p + 1;
    const ans = `x² + ${p + q}x + ${p * q}`;
    return make(`Expand (x + ${p})(x + ${q})`, ans, pool4(r, ans, [`x² + ${p * q}x + ${p + q}`, `x² + ${p + q}x + ${p + q}`, `x² + ${p * q}`, `x² + ${p + q + 1}x + ${p * q}`]), `First, outer, inner, last: x² + ${q}x + ${p}x + ${p * q}.`);
  }
  if (roll < 0.65) {
    const x = ri(r, 3, 9);
    const y = ri(r, 1, x - 1);
    return make(`x + y = ${x + y} and x − y = ${x - y}. What is x?`, String(x), numChoices(r, x), `Add the equations: 2x = ${2 * x}, so x = ${x}.`);
  }
  if (roll < 0.85) {
    const p = ri(r, 1, 6);
    const q = ri(r, p + 1, 9);
    const ans = String(p);
    return make(`x² ${sgn(-(p + q))}x + ${p * q} = 0. What is the smaller root?`, ans, numChoices(r, p), `Find two numbers that multiply to ${p * q} and add to ${p + q}: ${p} and ${q}.`);
  }
  const x = ri(r, 2, 12);
  return make(`x² = ${x * x}, x > 0. What is x?`, String(x), numChoices(r, x), `${x} × ${x} = ${x * x}.`);
}

/* ------------------------------------------------------------------ */
/* Path 5 — Geometry                                                   */
/* ------------------------------------------------------------------ */

const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15]];

function qGeo(r: Rng, L: number): Question {
  const tier = L <= 10 ? 1 : L <= 20 ? 2 : 3;
  if (tier === 1) {
    const roll = r();
    const w = ri(r, 2, 6 + L);
    const h = ri(r, 2, 6 + L);
    if (roll < 0.25) return make(`A rectangle is ${w} by ${h}. What is its perimeter?`, String(2 * (w + h)), numChoices(r, 2 * (w + h)), `Add all four sides: 2 × (${w} + ${h}).`);
    if (roll < 0.5) return make(`A rectangle is ${w} by ${h}. What is its area?`, String(w * h), numChoices(r, w * h), `Area = length × width = ${w} × ${h}.`);
    if (roll < 0.65) {
      const s = ri(r, 2, 12);
      return make(`A square has side ${s}. What is its area?`, String(s * s), numChoices(r, s * s), `${s} × ${s} = ${s * s}.`);
    }
    if (roll < 0.85) {
      const a = ri(r, 30, 100);
      const b = ri(r, 20, 140 - a);
      return make(`Two angles of a triangle are ${a}° and ${b}°. The third is?`, `${180 - a - b}°`, numChoices(r, 180 - a - b).map((x) => `${x}°`), `Angles in a triangle add to 180°.`);
    }
    const a = ri(r, 20, 160);
    return make(`Two angles on a straight line: one is ${a}°. The other is?`, `${180 - a}°`, numChoices(r, 180 - a).map((x) => `${x}°`), `Angles on a straight line add to 180°.`);
  }
  if (tier === 2) {
    const roll = r();
    if (roll < 0.25) {
      const b = ri(r, 4, 16);
      const h = ri(r, 3, 12) * 2;
      return make(`Triangle: base ${b}, height ${h}. Area?`, String((b * h) / 2), numChoices(r, (b * h) / 2), `Area = ½ × base × height.`);
    }
    if (roll < 0.45) {
      const rad = ri(r, 2, 12);
      return make(`Circle with radius ${rad}. Area? (leave π)`, `${rad * rad}π`, pool4(r, `${rad * rad}π`, [`${2 * rad}π`, `${rad * rad * 2}π`, `${rad}π`, `${rad * rad + rad}π`]), `Area = πr² = π × ${rad}².`);
    }
    if (roll < 0.65) {
      const rad = ri(r, 2, 12);
      return make(`Circle with radius ${rad}. Circumference? (leave π)`, `${2 * rad}π`, pool4(r, `${2 * rad}π`, [`${rad * rad}π`, `${rad}π`, `${4 * rad}π`, `${2 * rad + 2}π`]), `Circumference = 2πr = 2 × ${rad} × π.`);
    }
    if (roll < 0.82) {
      const a = ri(r, 2, 9);
      const b = ri(r, 2, 9);
      const c = ri(r, 2, 9);
      return make(`A box is ${a} × ${b} × ${c}. Its volume?`, String(a * b * c), numChoices(r, a * b * c), `Volume = length × width × height.`);
    }
    const b = ri(r, 5, 14);
    const h = ri(r, 3, 10);
    return make(`Parallelogram: base ${b}, height ${h}. Area?`, String(b * h), numChoices(r, b * h), `Area = base × height.`);
  }
  const roll = r();
  if (roll < 0.3) {
    const [a, b, c] = pick(r, TRIPLES);
    return make(`Right triangle with legs ${a} and ${b}. Hypotenuse?`, String(c), numChoices(r, c), `${a}² + ${b}² = ${a * a + b * b} = ${c}².`);
  }
  if (roll < 0.5) {
    const [a, b, c] = pick(r, TRIPLES);
    return make(`Right triangle: hypotenuse ${c}, one leg ${a}. Other leg?`, String(b), numChoices(r, b), `${c}² − ${a}² = ${c * c - a * a} = ${b}².`);
  }
  if (roll < 0.7) {
    const n = ri(r, 5, 12);
    return make(`Sum of the interior angles of a ${n}-sided polygon?`, `${(n - 2) * 180}°`, numChoices(r, (n - 2) * 180).map((x) => `${x}°`), `(n − 2) × 180° = ${n - 2} × 180°.`);
  }
  if (roll < 0.85) {
    const rad = ri(r, 2, 6);
    const h = ri(r, 2, 9);
    return make(`Cylinder: radius ${rad}, height ${h}. Volume? (leave π)`, `${rad * rad * h}π`, pool4(r, `${rad * rad * h}π`, [`${rad * h}π`, `${2 * rad * h}π`, `${rad * rad}π`, `${rad * rad * h + rad}π`, `${rad * rad * h * 2}π`, `${rad * rad * h - 1}π`]), `V = πr²h = π × ${rad * rad} × ${h}.`);
  }
  const rad = pick(r, [3, 6, 9]);
  const v = (4 * rad * rad * rad) / 3;
  return make(`Sphere with radius ${rad}. Volume? (leave π)`, `${v}π`, pool4(r, `${v}π`, [`${v * 3}π`, `${rad * rad * rad}π`, `${v / 2}π`, `${4 * rad * rad}π`]), `V = (4/3)πr³.`);
}

/* ------------------------------------------------------------------ */
/* Path 6 — Trigonometry                                               */
/* ------------------------------------------------------------------ */

const SPECIAL: Record<string, Record<number, string>> = {
  sin: { 0: "0", 30: "1/2", 45: "√2/2", 60: "√3/2", 90: "1" },
  cos: { 0: "1", 30: "√3/2", 45: "√2/2", 60: "1/2", 90: "0" },
  tan: { 0: "0", 30: "√3/3", 45: "1", 60: "√3" },
};
const TRIG_POOL = ["0", "1/2", "√2/2", "√3/2", "1", "√3/3", "√3", "−1/2", "−√2/2", "−√3/2", "−1"];

/** exact sin/cos/tan for multiples of 15 handled via reference angle + sign */
function exactTrig(fn: "sin" | "cos" | "tan", deg: number): string {
  const d = ((deg % 360) + 360) % 360;
  let ref: number;
  let sign = 1;
  if (d <= 90) ref = d;
  else if (d <= 180) {
    ref = 180 - d;
    if (fn !== "sin") sign = -1;
  } else if (d <= 270) {
    ref = d - 180;
    if (fn !== "tan") sign = -1;
  } else {
    ref = 360 - d;
    if (fn !== "cos") sign = -1;
  }
  const v = SPECIAL[fn][ref];
  if (v === undefined) return "undefined";
  if (v === "0") return "0";
  return sign < 0 ? `−${v}` : v;
}

function qTrig(r: Rng, L: number): Question {
  const tier = L <= 10 ? 1 : L <= 20 ? 2 : 3;
  if (tier === 1) {
    const roll = r();
    if (roll < 0.6) {
      const [opp, adj, hyp] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17]] as const);
      const fn = pick(r, ["sin", "cos", "tan"] as const);
      const [n, d, why] =
        fn === "sin" ? [opp, hyp, "opposite ÷ hypotenuse"] : fn === "cos" ? [adj, hyp, "adjacent ÷ hypotenuse"] : [opp, adj, "opposite ÷ adjacent"];
      return make(
        `Right triangle: opposite ${opp}, adjacent ${adj}, hypotenuse ${hyp}. What is ${fn} θ?`,
        `${n}/${d}`,
        pool4(r, `${n}/${d}`, [`${opp}/${hyp}`, `${adj}/${hyp}`, `${opp}/${adj}`, `${adj}/${opp}`, `${hyp}/${opp}`, `${hyp}/${adj}`].filter((x) => x !== `${n}/${d}`)),
        `${fn} = ${why} = ${n}/${d}.`,
      );
    }
    if (roll < 0.8) {
      const fn = pick(r, ["sin", "cos"] as const);
      const ang = pick(r, [30, 60, 90, 0]);
      const ans = SPECIAL[fn][ang];
      return make(`${fn} ${ang}° = ?`, ans, pool4(r, ans, TRIG_POOL.slice(0, 7)), `A special value worth memorising: ${fn} ${ang}° = ${ans}.`);
    }
    const word = pick(r, [
      ["sin", "opposite ÷ hypotenuse"],
      ["cos", "adjacent ÷ hypotenuse"],
      ["tan", "opposite ÷ adjacent"],
    ] as const);
    return make(`Which ratio is ${word[0]} θ?`, word[1], shuffle(r, ["opposite ÷ hypotenuse", "adjacent ÷ hypotenuse", "opposite ÷ adjacent", "hypotenuse ÷ opposite"]), `SOH-CAH-TOA: ${word[0]} θ = ${word[1]}.`);
  }
  if (tier === 2) {
    const roll = r();
    if (roll < 0.35) {
      const hyp = pick(r, [10, 12, 20, 8, 16, 6]);
      const ang = pick(r, [30, 60]);
      const ans = hyp / 2;
      const wrong = [decStr(hyp), decStr(hyp * 2), decStr(ans + 1), decStr(hyp - 2)];
      if (ang === 30) {
        return make(`Hypotenuse ${hyp}, angle 30°. Side opposite the angle?`, decStr(ans), pool4(r, decStr(ans), wrong), `opposite = hyp × sin 30° = ${hyp} × ½.`);
      }
      return make(`Hypotenuse ${hyp}, angle 60°. Side adjacent to the angle?`, decStr(ans), pool4(r, decStr(ans), wrong), `adjacent = hyp × cos 60° = ${hyp} × ½.`);
    }
    if (roll < 0.65) {
      const pairs: [number, string][] = [[180, "π"], [90, "π/2"], [60, "π/3"], [45, "π/4"], [30, "π/6"], [360, "2π"], [270, "3π/2"], [120, "2π/3"]];
      const [deg, rad] = pick(r, pairs);
      return make(`${deg}° in radians?`, rad, pool4(r, rad, pairs.map((p) => p[1])), `Multiply by π/180: ${deg} × π/180 = ${rad}.`);
    }
    if (roll < 0.85) {
      const fn = pick(r, ["sin", "cos", "tan"] as const);
      const ang = pick(r, [30, 45, 60]);
      const ans = SPECIAL[fn][ang];
      return make(`${fn} ${ang}° = ?`, ans, pool4(r, ans, TRIG_POOL), `Exact value: ${fn} ${ang}° = ${ans}.`);
    }
    const [dg, rd] = pick(r, [[180, "π"], [90, "π/2"], [60, "π/3"], [45, "π/4"], [30, "π/6"]] as [number, string][]);
    return make(`${rd} radians in degrees?`, `${dg}°`, pool4(r, `${dg}°`, [30, 45, 60, 90, 180, 120].map((x) => `${x}°`)), `π radians = 180°.`);
  }
  const roll = r();
  if (roll < 0.4) {
    const fn = pick(r, ["sin", "cos", "tan"] as const);
    const ang = pick(r, [120, 135, 150, 210, 225, 240, 300, 315, 330, 180, 270]);
    const ans = exactTrig(fn, ang);
    if (ans === "undefined") return qTrig(r, 25);
    return make(`${fn} ${ang}° = ?`, ans, pool4(r, ans, TRIG_POOL), `Use the reference angle and check the quadrant's sign.`);
  }
  if (roll < 0.6) {
    const val = pick(r, [["1/2", 30], ["√2/2", 45], ["√3/2", 60], ["1", 90]] as [string, number][]);
    return make(`sin θ = ${val[0]} with 0° ≤ θ ≤ 90°. What is θ?`, `${val[1]}°`, pool4(r, `${val[1]}°`, [0, 30, 45, 60, 90].map((x) => `${x}°`)), `Remember sin ${val[1]}° = ${val[0]}.`);
  }
  if (roll < 0.8) {
    const a = ri(r, 3, 12);
    return make(`sin²θ + cos²θ = ?`, "1", pool4(r, "1", ["0", "2", "sin 2θ", `${a}`]), `The Pythagorean identity, always 1.`);
  }
  const side = ri(r, 3, 9);
  return make(`Law of sines: a/sin A = b/sin B. A = 30°, a = ${side}, B = 90°. Find b.`, String(side * 2), numChoices(r, side * 2), `b = a × sin B ÷ sin A = ${side} × 1 ÷ ½ = ${side * 2}.`);
}

/* ------------------------------------------------------------------ */

const GEN: Record<PathId, (r: Rng, L: number) => Question> = {
  add: qAdd,
  mul: qMul,
  frac: qFrac,
  alg: qAlg,
  geo: qGeo,
  trig: qTrig,
};

/** Level is 1–30. Never throws; always returns 4 unique choices including the answer. */
export function makeQuestion(path: PathId, level: number, rng: Rng = Math.random): Question {
  const L = Math.max(1, Math.min(30, Math.floor(level)));
  const q = GEN[path](rng, L);
  const uniq = [...new Set(q.choices)];
  if (!uniq.includes(q.answer)) uniq[0] = q.answer;
  return { ...q, choices: uniq.slice(0, 4), hint: hintFor(path, L, q.prompt) };
}

/** Build a full level's worth of questions, avoiding repeated prompts when possible. */
export function makeLevel(path: PathId, level: number, count: number, rng: Rng = Math.random): Question[] {
  const out: Question[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard++ < count * 12) {
    const q = makeQuestion(path, level, rng);
    if (seen.has(q.prompt)) continue;
    seen.add(q.prompt);
    out.push(q);
  }
  while (out.length < count) out.push(makeQuestion(path, level, rng));
  return out;
}
