import {
  appendDigit,
  chooseOp,
  clearAll,
  createCalcState,
  deleteLast,
  evaluate,
  type Op,
} from "../calc/basic";
import { evalExpr, formatNumber, type Angle } from "../calc/sci";
import type { CalcMode } from "../storage/store";
import { icon } from "./icons";

const OPS: Record<string, Op> = {
  "+": "+",
  "−": "−",
  "×": "×",
  "÷": "÷",
  "%": "%",
};

export type CalcOpts = {
  mode: CalcMode;
  angle: Angle;
  onMode: (m: CalcMode) => void;
  onAngle: (a: Angle) => void;
};

type SciState = { expr: string; result: string; ans: number; fresh: boolean };

/** Buttons that insert text into the scientific expression. */
const SCI_INSERT: Record<string, string> = {
  sin: "sin(",
  cos: "cos(",
  tan: "tan(",
  asin: "asin(",
  acos: "acos(",
  atan: "atan(",
  ln: "ln(",
  log: "log(",
  sqrt: "√(",
  sq: "^2",
  pow: "^",
  fact: "!",
  pi: "π",
  e: "e",
  lp: "(",
  rp: ")",
  ans: "ans",
};

const SCI_KEYS: { id: string; label: string; aria: string }[] = [
  { id: "sin", label: "sin", aria: "Sine" },
  { id: "cos", label: "cos", aria: "Cosine" },
  { id: "tan", label: "tan", aria: "Tangent" },
  { id: "pi", label: "π", aria: "Pi" },
  { id: "asin", label: "sin⁻¹", aria: "Inverse sine" },
  { id: "acos", label: "cos⁻¹", aria: "Inverse cosine" },
  { id: "atan", label: "tan⁻¹", aria: "Inverse tangent" },
  { id: "e", label: "e", aria: "Euler's number" },
  { id: "ln", label: "ln", aria: "Natural log" },
  { id: "log", label: "log", aria: "Log base 10" },
  { id: "sqrt", label: "√", aria: "Square root" },
  { id: "sq", label: "x²", aria: "Squared" },
  { id: "lp", label: "(", aria: "Open bracket" },
  { id: "rp", label: ")", aria: "Close bracket" },
  { id: "pow", label: "xʸ", aria: "Power" },
  { id: "fact", label: "n!", aria: "Factorial" },
];

export function mountCalculator(root: HTMLElement, opts: CalcOpts): () => void {
  const basic = createCalcState();
  const sci: SciState = { expr: "", result: "0", ans: 0, fresh: false };
  let mode = opts.mode;
  let angle = opts.angle;

  const sciPad = (): string =>
    `<div class="sci-pad" role="group" aria-label="Scientific functions">${SCI_KEYS.map(
      (k) => `<button type="button" class="sci" data-sci="${k.id}" aria-label="${k.aria}">${k.label}</button>`,
    ).join("")}</div>`;

  const render = (): void => {
    root.innerHTML = `
    <div class="calc-screen">
      <div class="calc-wrap">
        <div class="ears" aria-hidden="true"><div class="ear"></div><div class="ear"></div></div>
        <div class="calc ${mode === "sci" ? "is-sci" : ""}">
          <div class="bow-knot" aria-hidden="true"></div>
          <div class="bow" aria-hidden="true"></div>
          <div class="face" aria-hidden="true">
            <div class="whiskers-left"><span></span><span></span><span></span></div>
            <div class="eye"></div><div class="nose"></div><div class="eye"></div>
            <div class="whiskers-right"><span></span><span></span><span></span></div>
          </div>
          <div class="mode-row" role="group" aria-label="Calculator mode">
            <button type="button" class="chip ${mode === "basic" ? "on" : ""}" data-mode="basic" aria-pressed="${mode === "basic"}">Basic</button>
            <button type="button" class="chip ${mode === "sci" ? "on" : ""}" data-mode="sci" aria-pressed="${mode === "sci"}">Scientific</button>
            ${
              mode === "sci"
                ? `<button type="button" class="chip angle" id="angleBtn" aria-label="Angle unit: ${angle === "deg" ? "degrees" : "radians"}. Tap to switch.">${angle === "deg" ? "DEG" : "RAD"}</button>`
                : ""
            }
          </div>
          <div class="display" role="status" aria-live="polite" aria-atomic="true">
            <div class="prev" id="prevDisplay">&nbsp;</div>
            <div class="curr" id="currDisplay">0</div>
          </div>
          ${mode === "sci" ? sciPad() : ""}
          <div class="pad" role="group" aria-label="Calculator keypad">
            <button type="button" class="fn" data-act="ac" aria-label="All clear">AC</button>
            <button type="button" class="fn" data-act="del" aria-label="Delete">DEL</button>
            <button type="button" class="fn" data-op="%" aria-label="Remainder">%</button>
            <button type="button" class="op" data-op="÷" aria-label="Divide">÷</button>

            <button type="button" class="num" data-num="7">7</button>
            <button type="button" class="num" data-num="8">8</button>
            <button type="button" class="num" data-num="9">9</button>
            <button type="button" class="op" data-op="×" aria-label="Multiply">×</button>

            <button type="button" class="num" data-num="4">4</button>
            <button type="button" class="num" data-num="5">5</button>
            <button type="button" class="num" data-num="6">6</button>
            <button type="button" class="op" data-op="−" aria-label="Subtract">−</button>

            <button type="button" class="num" data-num="1">1</button>
            <button type="button" class="num" data-num="2">2</button>
            <button type="button" class="num" data-num="3">3</button>
            <button type="button" class="op" data-op="+" aria-label="Add">+</button>

            <button type="button" class="num" data-num="0">0</button>
            <button type="button" class="num" data-num="." aria-label="Decimal point">.</button>
            <button type="button" class="eq" data-act="eq" aria-label="Equals">=</button>
          </div>
          <p class="paws">${icon("paw-print", { size: 14 })}<span>meow-th your numbers</span>${icon("paw-print", { size: 14 })}</p>
        </div>
      </div>
    </div>
  `;
    paint();
  };

  const paint = (): void => {
    const curr = root.querySelector("#currDisplay") as HTMLElement | null;
    const prev = root.querySelector("#prevDisplay") as HTMLElement | null;
    if (!curr || !prev) return;
    if (mode === "basic") {
      curr.textContent = basic.current;
      prev.textContent = basic.previous && basic.operation ? `${basic.previous} ${basic.operation}` : " ";
    } else {
      curr.textContent = sci.fresh || sci.expr === "" ? sci.result : sci.expr;
      prev.textContent = sci.fresh ? sci.expr + " =" : sci.expr === "" ? " " : "";
      if (!prev.textContent) prev.innerHTML = "&nbsp;";
    }
  };

  /* ---- scientific state helpers ---- */
  const sciInsert = (text: string, isNumberish = false): void => {
    if (sci.fresh) {
      // start fresh after =, but let operators continue from the result
      const continues = /^[+\-−×÷*/^%!]/.test(text) || text === "^2";
      sci.expr = continues ? "ans" : "";
      sci.fresh = false;
    }
    if (isNumberish && sci.result.startsWith("Nya")) sci.result = "0";
    sci.expr += text;
  };

  const sciEquals = (): void => {
    if (sci.expr === "") return;
    const r = evalExpr(sci.expr, angle, sci.ans);
    if (r.ok) {
      sci.ans = r.value;
      sci.result = formatNumber(r.value);
    } else sci.result = r.error;
    sci.fresh = true;
  };

  const sciDelete = (): void => {
    if (sci.fresh) return;
    // remove a whole function token like "sin(" in one go
    const m = sci.expr.match(/(asin|acos|atan|sin|cos|tan|ln|log|ans)\($|ans$/);
    sci.expr = m ? sci.expr.slice(0, -m[0].length) : sci.expr.slice(0, -1);
  };

  const sciClear = (): void => {
    sci.expr = "";
    sci.result = "0";
    sci.fresh = false;
  };

  const onClick = (e: Event): void => {
    const btn = (e.target as HTMLElement).closest("button");
    if (!btn) return;

    const m = btn.getAttribute("data-mode");
    if (m === "basic" || m === "sci") {
      if (m !== mode) {
        mode = m;
        opts.onMode(m);
        render();
      }
      return;
    }
    if (btn.id === "angleBtn") {
      angle = angle === "deg" ? "rad" : "deg";
      opts.onAngle(angle);
      render();
      return;
    }

    const num = btn.getAttribute("data-num");
    const op = btn.getAttribute("data-op");
    const act = btn.getAttribute("data-act");
    const fn = btn.getAttribute("data-sci");

    if (mode === "sci") {
      if (fn && SCI_INSERT[fn]) sciInsert(SCI_INSERT[fn], fn === "pi" || fn === "e");
      else if (num !== null) sciInsert(num, true);
      else if (op) sciInsert(op);
      else if (act === "eq") sciEquals();
      else if (act === "ac") sciClear();
      else if (act === "del") sciDelete();
    } else {
      if (num !== null) appendDigit(basic, num);
      else if (op && OPS[op]) chooseOp(basic, OPS[op]);
      else if (act === "eq") evaluate(basic);
      else if (act === "ac") clearAll(basic);
      else if (act === "del") deleteLast(basic);
    }
    paint();
  };

  const onKey = (e: KeyboardEvent): void => {
    const view = document.getElementById("view-calc");
    if (!view?.classList.contains("on")) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;

    if (mode === "sci") {
      if ((k >= "0" && k <= "9") || k === ".") sciInsert(k, true);
      else if (k === "+" || k === "-" || k === "*" || k === "^" || k === "%" || k === "(" || k === ")" || k === "!") sciInsert(k === "-" ? "−" : k === "*" ? "×" : k);
      else if (k === "/") {
        e.preventDefault();
        sciInsert("÷");
      } else if (k === "Enter" || k === "=") sciEquals();
      else if (k === "Backspace") sciDelete();
      else if (k === "Escape") sciClear();
      else return;
      paint();
      return;
    }

    if (k >= "0" && k <= "9") appendDigit(basic, k);
    else if (k === ".") appendDigit(basic, ".");
    else if (k === "+") chooseOp(basic, "+");
    else if (k === "-") chooseOp(basic, "−");
    else if (k === "*") chooseOp(basic, "×");
    else if (k === "/") {
      e.preventDefault();
      chooseOp(basic, "÷");
    } else if (k === "%") chooseOp(basic, "%");
    else if (k === "Enter" || k === "=") evaluate(basic);
    else if (k === "Backspace") deleteLast(basic);
    else if (k === "Escape") clearAll(basic);
    else return;
    paint();
  };

  root.addEventListener("click", onClick);
  document.addEventListener("keydown", onKey);
  render();

  return () => {
    root.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKey);
  };
}
