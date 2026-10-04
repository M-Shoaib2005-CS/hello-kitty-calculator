export type Op = "+" | "−" | "×" | "÷" | "%";

export type CalcState = {
  current: string;
  previous: string;
  operation: Op | null;
  shouldReset: boolean;
};

export function createCalcState(): CalcState {
  return { current: "0", previous: "", operation: null, shouldReset: false };
}

export function appendDigit(state: CalcState, num: string): CalcState {
  if (state.shouldReset) {
    state.current = "0";
    state.shouldReset = false;
  }
  if (num === "." && state.current.includes(".")) return state;
  if (state.current.length >= 18) return state;
  if (state.current === "0" && num !== ".") state.current = num;
  else if (state.current === "-0" && num !== ".") state.current = `-${num}`;
  else state.current += num;
  return state;
}

export function chooseOp(state: CalcState, op: Op): CalcState {
  if (state.operation !== null) evaluate(state);
  state.previous = state.current;
  state.operation = op;
  state.shouldReset = true;
  return state;
}

export function evaluate(state: CalcState): CalcState {
  if (state.operation === null || state.shouldReset) return state;
  const prev = parseFloat(state.previous);
  const curr = parseFloat(state.current);
  if (Number.isNaN(prev) || Number.isNaN(curr)) return state;

  let result: number | string;
  switch (state.operation) {
    case "+":
      result = prev + curr;
      break;
    case "−":
      result = prev - curr;
      break;
    case "×":
      result = prev * curr;
      break;
    case "÷":
      result = curr === 0 ? "Nya?? ÷0" : prev / curr;
      break;
    case "%":
      result = prev % curr;
      break;
  }

  state.current =
    typeof result === "number" ? parseFloat(result.toFixed(8)).toString() : result;
  state.operation = null;
  state.previous = "";
  state.shouldReset = true;
  return state;
}

export function clearAll(state: CalcState): CalcState {
  state.current = "0";
  state.previous = "";
  state.operation = null;
  state.shouldReset = false;
  return state;
}

export function deleteLast(state: CalcState): CalcState {
  if (state.shouldReset) return state;
  state.current = state.current.length > 1 ? state.current.slice(0, -1) : "0";
  if (state.current === "-") state.current = "0";
  return state;
}
