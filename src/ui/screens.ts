import { CATEGORIES, searchFormulas, type Category } from "../formulas/data";
import { LEVELS_PER_PATH, PATHS } from "../quest/paths";
import { HATS, passedCount } from "../quest/progress";
import { asHat } from "../quest/progress";
import { icon } from "./icons";
import { kittySvg } from "./kitty";
import { liveStreak, totalStars, type SaveState } from "../storage/store";

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ------------------------------------------------------------------ */
/* Formula book                                                        */
/* ------------------------------------------------------------------ */

export type FormulaCtx = {
  getSave: () => SaveState;
  update: (partial: Partial<SaveState>) => SaveState;
};

export function mountFormulas(root: HTMLElement, ctx: FormulaCtx): void {
  let query = "";
  let cat: Category | "all" | "fav" = "all";
  let openId: string | null = null;

  root.innerHTML = `
    <div class="formula-tools">
      <label class="sr-only" for="fsearch">Search formulas</label>
      <input id="fsearch" class="search" type="search" inputmode="search" autocomplete="off" placeholder="Search: area, sin, speed…" />
      <div class="path-tabs" id="fcats" role="group" aria-label="Formula categories"></div>
    </div>
    <p class="formula-count" id="fcount" role="status" aria-live="polite"></p>
    <ul class="formula-list" id="flist"></ul>
  `;

  const input = root.querySelector<HTMLInputElement>("#fsearch")!;
  const catsEl = root.querySelector<HTMLElement>("#fcats")!;
  const listEl = root.querySelector<HTMLElement>("#flist")!;
  const countEl = root.querySelector<HTMLElement>("#fcount")!;

  const paintCats = (): void => {
    const favN = ctx.getSave().favourites.length;
    const chips: { id: Category | "all" | "fav"; html: string }[] = [
      { id: "all", html: "All" },
      { id: "fav", html: `${icon("star", { size: 16, fill: true })}<span>Saved${favN ? ` (${favN})` : ""}</span>` },
      ...CATEGORIES.map((c) => ({ id: c.id, html: `${icon(c.icon, { size: 16 })}<span>${esc(c.label)}</span>` })),
    ];
    catsEl.innerHTML = chips
      .map((c) => `<button type="button" class="chip ${c.id === cat ? "on" : ""}" data-cat="${c.id}" aria-pressed="${c.id === cat}">${c.html}</button>`)
      .join("");
  };

  const paintList = (): void => {
    const favs = ctx.getSave().favourites;
    const items = searchFormulas(query, cat, favs);
    countEl.textContent = `${items.length} formula${items.length === 1 ? "" : "s"}`;
    if (items.length === 0) {
      listEl.innerHTML = `<li class="card"><div class="badge" aria-hidden="true">${icon("search", { size: 40 })}</div><h2>Nothing found</h2><p>${
        cat === "fav" ? "Tap the star on a formula to save it here." : "Try another word, like “area” or “speed”."
      }</p></li>`;
      return;
    }
    listEl.innerHTML = items
      .map((f) => {
        const open = openId === f.id;
        const fav = favs.includes(f.id);
        return `<li class="fcard ${open ? "open" : ""}">
          <div class="fhead">
            <button type="button" class="fmain" data-open="${f.id}" aria-expanded="${open}">
              <span class="ftitle">${esc(f.title)}</span>
              <span class="fformula">${esc(f.formula)}</span>
            </button>
            <button type="button" class="star ${fav ? "on" : ""}" data-fav="${f.id}" aria-pressed="${fav}" aria-label="${fav ? "Remove from saved" : "Save"} ${esc(f.title)}">${icon("star", { size: 24, sw: 2.2, fill: fav })}</button>
          </div>
          ${open ? `<div class="fbody"><p>${esc(f.note)}</p><p class="fexample"><b>Example:</b> ${esc(f.example)}</p></div>` : ""}
        </li>`;
      })
      .join("");
  };

  input.addEventListener("input", () => {
    query = input.value;
    paintList();
  });

  root.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button");
    if (!btn) return;
    if (btn.dataset.cat) {
      cat = btn.dataset.cat as Category | "all" | "fav";
      paintCats();
      paintList();
    } else if (btn.dataset.open) {
      openId = openId === btn.dataset.open ? null : btn.dataset.open;
      paintList();
    } else if (btn.dataset.fav) {
      const id = btn.dataset.fav;
      const favs = ctx.getSave().favourites;
      ctx.update({ favourites: favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id] });
      paintCats();
      paintList();
      root.querySelector<HTMLButtonElement>(`[data-fav="${id}"]`)?.focus();
    }
  });

  paintCats();
  paintList();
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export function mountProfile(
  root: HTMLElement,
  opts: {
    save: SaveState;
    onMute: (on: boolean) => void;
    onNight: (on: boolean) => void;
    onHat: (id: string) => void;
    onReset: () => void;
  },
): void {
  const { save } = opts;
  const night = save.theme === "night";
  const stars = totalStars(save);
  const streak = liveStreak(save);
  const wearing = asHat(save.hat);

  const hats = HATS.map((h) => {
    const open = stars >= h.stars;
    const on = h.id === wearing;
    return `<button type="button" class="hat ${on ? "on" : ""}" data-hat="${h.id}" ${open ? "" : 'aria-disabled="true"'} aria-pressed="${on}" aria-label="${esc(h.name)}${open ? "" : `, unlocks at ${h.stars} stars`}">
      <span class="hat-ico ${open ? "" : "locked"}" aria-hidden="true">${kittySvg(h.id, 54)}${open ? "" : `<span class="lockbadge">${icon("lock", { size: 14, sw: 2.6 })}</span>`}</span>
      <small>${open ? esc(h.name) : `${h.stars} stars`}</small></button>`;
  }).join("");

  const paths = PATHS.map((p) => {
    const n = passedCount(save, p.id);
    return `<li>${icon(p.icon, { size: 20 })} <span>${esc(p.name)}</span><b>${n}/${LEVELS_PER_PATH}</b></li>`;
  }).join("");

  root.innerHTML = `
    <article class="card">
      <div class="avatar" aria-hidden="true">${kittySvg(wearing, 112)}</div>
      <h2>${night ? "Night kitty" : "Day den"}</h2>
      <p>Everything lives on this device. No account, no internet.</p>

      <div class="stat-grid">
        <div class="stat"><b>${stars}</b><small>${icon("star", { size: 13, fill: true, cls: "star-on inline" })} stars</small></div>
        <div class="stat"><b>${streak}</b><small>${icon("sparkles", { size: 13, cls: "inline" })} day streak</small></div>
      </div>

      <h3 class="sub">Hats</h3>
      <div class="hats" role="group" aria-label="Kitty hats">${hats}</div>

      <h3 class="sub">Quest progress</h3>
      <ul class="prog-list">${paths}</ul>

      <h3 class="sub">Settings</h3>
      <div class="toggle-row">
        <div>
          <strong>Night kitty</strong>
          <span>Same cute outlines, moonlit pinks.</span>
        </div>
        <button type="button" class="switch ${night ? "on" : ""}" id="themeSwitch" aria-pressed="${night}">
          ${night ? "On" : "Off"}
        </button>
      </div>
      <div class="toggle-row">
        <div>
          <strong>Sounds</strong>
          <span>Little meows when you get things right.</span>
        </div>
        <button type="button" class="switch ${save.muted ? "" : "on"}" id="soundSwitch" aria-pressed="${!save.muted}">
          ${save.muted ? "Off" : "On"}
        </button>
      </div>
      <div class="toggle-row">
        <div>
          <strong>Start over</strong>
          <span>Clears stars, streak and hats. Formulas you saved stay.</span>
        </div>
        <button type="button" class="switch" id="resetBtn">Reset</button>
      </div>
    </article>
  `;

  root.querySelector("#themeSwitch")?.addEventListener("click", () => opts.onNight(!night));
  root.querySelector("#soundSwitch")?.addEventListener("click", () => opts.onMute(!save.muted));
  root.querySelector("#resetBtn")?.addEventListener("click", (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    if (btn.dataset.sure === "1") {
      opts.onReset();
      return;
    }
    btn.dataset.sure = "1";
    btn.textContent = "Sure?";
    btn.classList.add("on");
    window.setTimeout(() => {
      if (btn.isConnected) {
        delete btn.dataset.sure;
        btn.textContent = "Reset";
        btn.classList.remove("on");
      }
    }, 4000);
  });
  root.querySelectorAll<HTMLButtonElement>("[data-hat]").forEach((b) => {
    b.addEventListener("click", () => {
      if (b.getAttribute("aria-disabled") === "true") return;
      opts.onHat(b.dataset.hat!);
    });
  });
}
