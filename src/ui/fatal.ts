/**
 * If the app cannot start, replace the endless splash with something a person can act on.
 * Kept free of imports so it still works when other modules are what broke.
 */
export function showFatal(err: unknown): void {
  const boot = document.getElementById("boot");
  if (!boot || boot.dataset.fatal === "1") return;
  boot.dataset.fatal = "1";
  const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err ?? "unknown error");
  const card = boot.querySelector(".boot-card");
  if (!card) return;
  card.innerHTML = `
    <p class="boot-title">Oops, kitty tripped</p>
    <p class="boot-sub">Catularor could not start.</p>
    <p class="boot-err"></p>
    <div class="boot-actions">
      <button type="button" class="wide pink" id="fatalReload">Try again</button>
      <button type="button" class="wide" id="fatalReset">Clear saved data and retry</button>
    </div>`;
  const out = card.querySelector(".boot-err");
  if (out) out.textContent = detail.slice(0, 240);
  card.querySelector("#fatalReload")?.addEventListener("click", () => location.reload());
  card.querySelector("#fatalReset")?.addEventListener("click", () => {
    try {
      localStorage.removeItem("catularor-save");
    } catch {
      /* ignore */
    }
    location.reload();
  });
}
