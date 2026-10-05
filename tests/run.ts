import { makeLevel, makeQuestion, type PathId } from "../src/quest/generators";
import { PATHS, isBoss } from "../src/quest/paths";
import { applyResult, starsFor, levelUnlocked, pathUnlocked, isPassed, questionCount } from "../src/quest/progress";
import { evalExpr } from "../src/calc/sci";
import { parseSave, nextStreak, liveStreak, totalStars, exportCode, importCode, HISTORY_MAX } from "../src/storage/store";
import { FORMULAS, searchFormulas } from "../src/formulas/data";
import { LESSONS } from "../src/quest/lessons";
import assert from "node:assert/strict";

// mulberry32 seeded rng
const seeded = (a: number) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

let n = 0; const pads: string[] = [];
for (const p of PATHS) for (let L = 1; L <= 30; L++) {
  const r = seeded(L * 977 + p.id.length);
  for (let k = 0; k < 300; k++) {
    const q = makeQuestion(p.id as PathId, L, r);
    n++;
    assert.equal(q.choices.length, 4, `${p.id} L${L}: ${q.prompt}`);
    assert.equal(new Set(q.choices).size, 4, `dupe ${p.id} L${L}: ${q.prompt} ${q.choices}`);
    assert.ok(q.choices.includes(q.answer), `missing answer ${q.prompt}`);
    assert.ok(q.prompt.length > 0 && q.explain.length > 0);
    assert.ok(!/NaN|undefined|Infinity/.test(q.prompt + q.answer + q.choices.join()), `bad text: ${q.prompt} ${q.choices}`);
    if (q.choices.some((c) => c.includes("′"))) pads.push(`${p.id} L${L}: ${q.prompt} -> ${q.choices}`);
  }
  assert.equal(makeLevel(p.id as PathId, L, questionCount(L), r).length, questionCount(L));
}
console.log("generated", n, "questions ok; padded-distractor cases:", pads.length, pads.slice(0, 5));

// independent answer checks
const r = seeded(1);
for (let i = 0; i < 2000; i++) {
  const L = 1 + (i % 30);
  let q = makeQuestion("add", L, r);
  let m = q.prompt.match(/^(\d+) ([+−]) (\d+) = \?$/);
  if (m) assert.equal(String(m[2] === "+" ? +m[1] + +m[3] : +m[1] - +m[3]), q.answer);
  q = makeQuestion("mul", L, r);
  m = q.prompt.match(/^(\d+) ([×÷]) (\d+) = \?$/);
  if (m) assert.equal(String(m[2] === "×" ? +m[1] * +m[3] : +m[1] / +m[3]), q.answer);
  q = makeQuestion("alg", L, r);
  m = q.prompt.match(/^(\d+)x \+ (\d+) = (\d+)$/);
  if (m) assert.equal(String((+m[3] - +m[2]) / +m[1]), q.answer);
  const m2 = q.prompt.match(/^(\d+)x ([+−]) (\d+) = (\d+)x \+ (\d+)$/); // ax ± bb = cx + d
  if (m2) { const [a, bb, c, d] = [+m2[1], (m2[2] === "+" ? 1 : -1) * +m2[3], +m2[4], +m2[5]]; const x = +q.answer; assert.equal(a * x + bb, c * x + d, q.prompt); }
  q = makeQuestion("geo", L, r);
  m = q.prompt.match(/^Right triangle with legs (\d+) and (\d+)\./);
  if (m) assert.equal(String(Math.hypot(+m[1], +m[2])), q.answer);
}
console.log("independent answer checks ok");

// sci calc
const ev = (s: string, a: "deg" | "rad" = "deg") => { const x = evalExpr(s, a); return x.ok ? x.value : "ERR:" + x.error; };
const cases: [string, number | string][] = [
  ["2+3×4", 14], ["(2+3)×4", 20], ["−2^2", -4], ["2^3^2", 512], ["2^−1", 0.5], ["sin(30)", 0.5], ["cos(60)", 0.5], ["tan(45)", 1], ["sin(180)", 0],
  ["√(16)", 4], ["5!", 120], ["0!", 1], ["10÷4", 2.5], ["7%3", 1], ["2π", 6.28318530718], ["log(1000)", 3], ["ln(e)", 1], ["asin(0.5)", 30],
  ["3(4+1)", 15], ["sin30+1", 1.5], ["1÷0", "ERR:Nya?? ÷0"], ["tan(90)", "ERR:tan undefined"], ["(2", "ERR:Missing )"], ["2++", "ERR:Unfinished"], ["ln(0)", "ERR:ln needs > 0"], ["√(−1)", "ERR:√ needs ≥ 0"],
  ["0.1+0.2", 0.3], ["171!", "ERR:n! needs 0–170"], ["1.2.3", "ERR:Bad number"], ["cos(180)", -1],
];
for (const [e, want] of cases) assert.equal(ev(e), want, e);
assert.equal(ev("sin(π/6)", "rad"), 0.5); assert.equal(ev("ans+1"), 1);
assert.equal(evalExpr("ans×2", "deg", 21).ok && (evalExpr("ans×2", "deg", 21) as any).value, 42);
console.log("sci ok", cases.length);

// progress
assert.equal(starsFor(8, 8), 3); assert.equal(starsFor(7, 8), 2); assert.equal(starsFor(6, 8), 2); assert.equal(starsFor(5, 8), 1); assert.equal(starsFor(3, 8), 0);
let s = parseSave({});
assert.ok(levelUnlocked(s, "add", 1) && !levelUnlocked(s, "add", 2) && !pathUnlocked(s, "mul"));
const day = new Date(2026, 9, 3);
let o = applyResult(s, "add", 1, 5, 8, day); s = { ...s, ...o.save };
assert.ok(o.passed && o.stars === 1 && levelUnlocked(s, "add", 2) && s.streak === 1);
o = applyResult(s, "add", 1, 2, 8, day); s = { ...s, ...o.save };  // worse retry never lowers stars
assert.equal(s.progress["add:1"].stars, 1);
for (let l = 2; l <= 9; l++) { o = applyResult(s, "add", l, 8, 8, day); s = { ...s, ...o.save }; }
assert.ok(levelUnlocked(s, "add", 10) && isBoss(10));
o = applyResult(s, "add", 10, 6, 10, day); assert.ok(!o.passed && o.gateMissed && o.stars === 1); s = { ...s, ...o.save };
assert.ok(!levelUnlocked(s, "add", 11) && !isPassed(s, "add", 10) && !pathUnlocked(s, "mul"));
o = applyResult(s, "add", 10, 8, 10, day); assert.ok(o.passed && !o.gateMissed); s = { ...s, ...o.save };
assert.ok(levelUnlocked(s, "add", 11) && pathUnlocked(s, "mul") && !pathUnlocked(s, "frac"));
assert.equal(totalStars(s), 1 + 8 * 3 + 2 );  // L1=1, L2-9 = 8*3, boss=2
// streak
assert.deepEqual(nextStreak(3, "2026-10-03", new Date(2026, 9, 4)), { streak: 4, lastPlay: "2026-10-04" });
assert.deepEqual(nextStreak(3, "2026-10-01", new Date(2026, 9, 4)), { streak: 1, lastPlay: "2026-10-04" });
assert.equal(nextStreak(3, "2026-10-04", new Date(2026, 9, 4)).streak, 3);
assert.equal(liveStreak({ ...s, streak: 5, lastPlay: "2026-10-01" }, new Date(2026, 9, 4)), 0);
assert.equal(liveStreak({ ...s, streak: 5, lastPlay: "2026-10-03" }, new Date(2026, 9, 4)), 5);
// save parsing robustness
assert.equal(parseSave({ progress: { "add:1": { stars: 99, best: -4 } }, hat: 5, calcMode: "x" }).progress["add:1"].stars, 3);
assert.equal(parseSave("junk").calcMode, "basic");
// formulas
assert.equal(new Set(FORMULAS.map((f) => f.id)).size, FORMULAS.length);
assert.ok(searchFormulas("circle", "all", []).length >= 2);
assert.equal(searchFormulas("", "fav", ["ge-pyth"]).length, 1);
assert.equal(searchFormulas("sin", "trig", []).length > 3, true);
// hints and lessons
{
  const r2 = seeded(99);
  for (const p of PATHS) for (let L = 1; L <= 30; L++) for (let k = 0; k < 100; k++) {
    const q = makeQuestion(p.id as PathId, L, r2);
    assert.ok(q.hint.length > 10, `no hint: ${q.prompt}`);
    const tokens = q.hint.split(/[\s,.:;()=?×÷+−]+/);
    assert.ok(!(q.answer.length >= 3 && tokens.includes(q.answer)), `hint leaks answer: ${q.prompt} | ${q.hint}`);
  }
  for (const p of PATHS) {
    assert.equal(LESSONS[p.id as PathId].length, 3);
    for (const l of LESSONS[p.id as PathId]) { assert.ok(l.skills.length > 5); assert.equal(l.cards.length, 3); for (const c of l.cards) assert.ok(c.title && c.body.length > 20 && c.example.length > 5); }
  }
  console.log("hints + lessons ok");
}
{
  // new settings fields: safe defaults for saves written by older versions
  const legacy = parseSave({ muted: true, theme: "night", progress: { "add:1": { stars: 2, best: 6 } } });
  assert.equal(legacy.haptics, true);
  assert.equal(legacy.onboarded, false);
  assert.deepEqual(legacy.history, []);
  assert.equal(parseSave({ haptics: false, onboarded: true }).haptics, false);
  // history is sanitised and capped
  const many = Array.from({ length: 50 }, (_, i) => ({ expr: `${i}+1`, result: `${i + 1}` }));
  assert.equal(parseSave({ history: [...many, { expr: 5 }, null, "x"] }).history.length, HISTORY_MAX);
  assert.deepEqual(parseSave({ history: "nope" }).history, []);

  // backup code round-trip, including non-ASCII text
  const src = parseSave({ progress: { "add:1": { stars: 3, best: 8 }, "mul:4": { stars: 1, best: 4 } }, favourites: ["circle-area", "π-é"], hat: "crown", streak: 4, lastPlay: "2026-10-04", history: many });
  const code = exportCode(src);
  assert.ok(code.startsWith("CATU1:"));
  const back = importCode(`  ${code.slice(0, 20)}\n${code.slice(20)}  `);
  assert.ok(back);
  assert.deepEqual(back!.progress, src.progress);
  assert.deepEqual(back!.favourites, src.favourites);
  assert.equal(back!.hat, "crown");
  assert.equal(back!.streak, 4);
  assert.ok(!("history" in back!) && !("onboarded" in back!), "backup must not carry history or welcome flag");
  for (const bad of ["", "hello", "CATU1:", "CATU1:@@@", "CATU1:" + Buffer.from("[1,2]").toString("base64"), "CATU1:" + Buffer.from("null").toString("base64"), "CATU2:abcd"]) {
    const r = importCode(bad);
    assert.ok(r === null || (Object.keys(r.progress ?? {}).length === 0 && !r.favourites?.length), `bad code accepted: ${bad}`);
  }
  assert.equal(importCode("hello"), null);
  assert.equal(importCode("CATU1:@@@"), null);
  // a hostile code cannot inject out-of-range stars
  const evil = importCode("CATU1:" + Buffer.from(JSON.stringify({ progress: { "add:1": { stars: 99, best: -1 } } })).toString("base64"));
  assert.equal(evil!.progress!["add:1"].stars, 3);
  console.log("settings, history and backup ok");
}
console.log("formulas:", FORMULAS.length, "ALL TESTS PASSED");
