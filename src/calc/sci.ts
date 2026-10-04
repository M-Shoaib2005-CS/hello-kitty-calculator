/**
 * Scientific expression evaluator (recursive descent, no eval()).
 * Supports + − × ÷ ^ %, parentheses, unary minus, postfix !,
 * π, e, ans, and sin cos tan asin acos atan ln log sqrt cbrt abs.
 */
export type Angle = "deg" | "rad";

export type SciResult = { ok: true; value: number } | { ok: false; error: string };

type Tok =
  | { t: "num"; v: number }
  | { t: "id"; v: string }
  | { t: "op"; v: string }
  | { t: "(" }
  | { t: ")" };

const FUNCS = ["asin", "acos", "atan", "sin", "cos", "tan", "ln", "log", "sqrt", "cbrt", "abs"];

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " ") {
      i++;
      continue;
    }
    if ((c >= "0" && c <= "9") || c === ".") {
      let j = i;
      while (j < src.length && ((src[j] >= "0" && src[j] <= "9") || src[j] === ".")) j++;
      const text = src.slice(i, j);
      if ((text.match(/\./g) ?? []).length > 1 || text === ".") throw new Error("Bad number");
      out.push({ t: "num", v: parseFloat(text) });
      i = j;
      continue;
    }
    if (c === "π") {
      out.push({ t: "id", v: "pi" });
      i++;
      continue;
    }
    if (c === "√") {
      out.push({ t: "id", v: "sqrt" });
      i++;
      continue;
    }
    if (/[a-z]/i.test(c)) {
      let j = i;
      while (j < src.length && /[a-z]/i.test(src[j])) j++;
      out.push({ t: "id", v: src.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    if (c === "(") out.push({ t: "(" });
    else if (c === ")") out.push({ t: ")" });
    else if ("+-−×÷*/^%!".includes(c)) {
      const map: Record<string, string> = { "−": "-", "×": "*", "÷": "/" };
      out.push({ t: "op", v: map[c] ?? c });
    } else throw new Error("Unknown symbol");
    i++;
  }
  return out;
}

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0 || n > 170) throw new Error("n! needs 0–170");
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

/** Clean up float noise like sin(180°) = 1.2e-16 → 0. */
export function tidy(x: number): number {
  if (!Number.isFinite(x)) return x;
  const r = parseFloat(x.toPrecision(12));
  return Math.abs(r) < 1e-12 ? 0 : r;
}

export function evalExpr(src: string, angle: Angle = "deg", ans = 0): SciResult {
  try {
    const toks = tokenize(src);
    if (toks.length === 0) return { ok: false, error: "Empty" };
    let p = 0;
    const toRad = (x: number): number => (angle === "deg" ? (x * Math.PI) / 180 : x);
    const fromRad = (x: number): number => (angle === "deg" ? (x * 180) / Math.PI : x);

    const peek = (): Tok | undefined => toks[p];
    const isOp = (v: string): boolean => {
      const t = peek();
      return !!t && t.t === "op" && t.v === v;
    };

    const expr = (): number => {
      let v = term();
      for (;;) {
        if (isOp("+")) {
          p++;
          v += term();
        } else if (isOp("-")) {
          p++;
          v -= term();
        } else return v;
      }
    };

    const term = (): number => {
      let v = unary();
      for (;;) {
        if (isOp("*")) {
          p++;
          v *= unary();
        } else if (isOp("/")) {
          p++;
          const d = unary();
          if (d === 0) throw new Error("Nya?? ÷0");
          v /= d;
        } else if (isOp("%")) {
          p++;
          const d = unary();
          if (d === 0) throw new Error("Nya?? ÷0");
          v %= d;
        } else {
          // implicit multiplication: 2π, 3(4+1), 2sin(30)
          const t = peek();
          if (t && (t.t === "num" || t.t === "id" || t.t === "(")) v *= unary();
          else return v;
        }
      }
    };

    // unary minus binds looser than ^ so -2^2 = -4
    const unary = (): number => {
      if (isOp("-")) {
        p++;
        return -unary();
      }
      if (isOp("+")) {
        p++;
        return unary();
      }
      return power();
    };

    const power = (): number => {
      const base = postfix();
      if (isOp("^")) {
        p++;
        const exp = unary(); // right associative, allows 2^-1
        return Math.pow(base, exp);
      }
      return base;
    };

    const postfix = (): number => {
      let v = atom();
      while (isOp("!")) {
        p++;
        v = factorial(v);
      }
      return v;
    };

    const atom = (): number => {
      const t = toks[p++];
      if (!t) throw new Error("Unfinished");
      if (t.t === "num") return t.v;
      if (t.t === "(") {
        const v = expr();
        if (toks[p]?.t === ")") p++;
        else throw new Error("Missing )");
        return v;
      }
      if (t.t === "id") {
        if (t.v === "pi") return Math.PI;
        if (t.v === "e") return Math.E;
        if (t.v === "ans") return ans;
        if (!FUNCS.includes(t.v)) throw new Error(`Unknown ${t.v}`);
        // function argument: parenthesised or a tight atom (sin30 style)
        let arg: number;
        if (toks[p]?.t === "(") {
          p++;
          arg = expr();
          if (toks[p]?.t === ")") p++;
          else throw new Error("Missing )");
        } else arg = power();
        return applyFn(t.v, arg);
      }
      throw new Error("Unexpected symbol");
    };

    const applyFn = (name: string, x: number): number => {
      switch (name) {
        case "sin":
          return tidy(Math.sin(toRad(x)));
        case "cos":
          return tidy(Math.cos(toRad(x)));
        case "tan": {
          if (angle === "deg" && Math.abs(((x % 180) + 180) % 180 - 90) < 1e-9) throw new Error("tan undefined");
          return tidy(Math.tan(toRad(x)));
        }
        case "asin":
          if (x < -1 || x > 1) throw new Error("asin needs −1…1");
          return tidy(fromRad(Math.asin(x)));
        case "acos":
          if (x < -1 || x > 1) throw new Error("acos needs −1…1");
          return tidy(fromRad(Math.acos(x)));
        case "atan":
          return tidy(fromRad(Math.atan(x)));
        case "ln":
          if (x <= 0) throw new Error("ln needs > 0");
          return Math.log(x);
        case "log":
          if (x <= 0) throw new Error("log needs > 0");
          return tidy(Math.log10(x));
        case "sqrt":
          if (x < 0) throw new Error("√ needs ≥ 0");
          return Math.sqrt(x);
        case "cbrt":
          return Math.cbrt(x);
        case "abs":
          return Math.abs(x);
        default:
          throw new Error(`Unknown ${name}`);
      }
    };

    const value = expr();
    if (p < toks.length) throw new Error("Unexpected symbol");
    if (!Number.isFinite(value)) throw new Error("Too big");
    return { ok: true, value: tidy(value) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export function formatNumber(v: number): string {
  if (Number.isInteger(v) && Math.abs(v) < 1e15) return String(v);
  const abs = Math.abs(v);
  if (abs >= 1e15 || abs < 1e-7) return v.toExponential(6).replace(/\.?0+e/, "e");
  return parseFloat(v.toPrecision(10)).toString();
}
