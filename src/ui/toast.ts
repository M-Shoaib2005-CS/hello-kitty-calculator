let timer = 0;

/** A small pill message at the bottom of the screen (read out by screen readers too). */
export function toast(message: string): void {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  el.textContent = message;
  // restart the transition even if a toast is already showing
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
  window.clearTimeout(timer);
  timer = window.setTimeout(() => el?.classList.remove("show"), 1900);
}

/** Copies text; falls back to a hidden textarea where the async clipboard API is blocked. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
