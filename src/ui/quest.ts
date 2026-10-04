import { sfx, unlockAudio } from "../audio/sfx";
import { icon, stars } from "./icons";
import type { PathId, Question } from "../quest/generators";
import { LESSONS } from "../quest/lessons";
import { makeLevel } from "../quest/generators";
import { chapterOf, CHAPTER_SIZE, isBoss, LEVELS_PER_PATH, PATHS, pathIndex, type QuestPath } from "../quest/paths";
import {
  applyResult,
  frontier,
  levelUnlocked,
  passedCount,
  pathUnlocked,
  questionCount,
  resultOf,
  starsToPass,
} from "../quest/progress";
import type { SaveState } from "../storage/store";

export type QuestCtx = {
  getSave: () => SaveState;
  update: (partial: Partial<SaveState>) => SaveState;
  /** called after progress changes so other screens (profile) can repaint */
  onChange: () => void;
};

type Play = {
  path: PathId;
  level: number;
  qs: Question[];
  i: number;
  correct: number;
  picked: string | null;
  /** 0 = no hint, 1 = tip shown, 2 = two wrong answers removed */
  hint: 0 | 1 | 2;
  removed: string[];
  hintsUsed: number;
};

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function mountQuest(root: HTMLElement, ctx: QuestCtx): { repaint: () => void } {
  let selected: PathId = PATHS[0].id;
  let play: Play | null = null;
  let focusLevel: number | null = null;

  const top = (): void => {
    document.getElementById("main")?.scrollTo({ top: 0 });
  };

  /* ------------------------------ map ------------------------------ */
  const renderMap = (): void => {
    play = null; // showing the map always ends any level in progress
    const save = ctx.getSave();
    const path = PATHS[pathIndex(selected)];
    const passed = passedCount(save, path.id);
    const starTotal = Array.from({ length: LEVELS_PER_PATH }, (_, k) => resultOf(save, path.id, k + 1).stars).reduce((a, b) => a + b, 0);
    const next = frontier(save, path.id);

    const tabs = PATHS.map((p) => {
      const open = pathUnlocked(save, p.id);
      return `<button type="button" class="chip path-tab ${p.id === selected ? "on" : ""}" data-path="${p.id}" ${open ? "" : 'aria-disabled="true"'} aria-pressed="${p.id === selected}">
        ${icon(open ? p.icon : "lock", { size: 18 })}<span>${esc(p.name)}</span></button>`;
    }).join("");

    let trail = "";
    for (let c = 0; c < 3; c++) {
      const story = path.chapters[c];
      const lesson = LESSONS[path.id][c];
      trail += `<li class="chapter">
        <button type="button" class="chapter-btn" data-story="${c}">${icon("scroll-text", { size: 18 })}<span>Chapter ${c + 1}: ${esc(story.title)}</span></button>
        <div class="chapter-learn">
          <p class="skills">${icon("graduation-cap", { size: 18 })}<span><b>You'll learn:</b> ${esc(lesson.skills)}</span></p>
          <button type="button" class="chip" data-lesson="${c}" aria-label="Open the lesson for chapter ${c + 1}">${icon("lightbulb", { size: 16 })} Lesson</button>
        </div>
      </li>`;
      for (let l = c * CHAPTER_SIZE + 1; l <= (c + 1) * CHAPTER_SIZE; l++) {
        const open = levelUnlocked(save, path.id, l);
        const res = resultOf(save, path.id, l);
        const boss = isBoss(l);
        const done = res.stars >= starsToPass(l);
        const cls = ["node", boss ? "boss" : "", done ? "done" : "", !open ? "locked" : "", open && l === next ? "current" : ""].filter(Boolean).join(" ");
        const x = Math.round(Math.sin(l * 0.85) * 34);
        const label = `Level ${l}${boss ? " boss" : ""}${open ? `, ${res.stars} of 3 stars` : ", locked"}`;
        trail += `<li class="trail-item" style="--x:${x}px"><button type="button" id="lv-${l}" class="${cls}" data-level="${l}" aria-label="${label}" ${open ? "" : 'aria-disabled="true"'}>
          <span class="node-n" aria-hidden="true">${!open ? icon("lock", { size: 22 }) : boss ? icon("crown", { size: 28 }) : l}</span>
          <span class="node-stars" aria-hidden="true">${open ? stars(res.stars, 11) : ""}</span></button></li>`;
      }
    }

    root.innerHTML = `
      <div class="path-tabs" role="group" aria-label="Quest paths">${tabs}</div>
      <article class="card path-head">
        <div class="badge" aria-hidden="true">${icon(path.icon, { size: 40 })}</div>
        <h2>${esc(path.name)}</h2>
        <p>${esc(path.blurb)}</p>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${LEVELS_PER_PATH}" aria-valuenow="${passed}" aria-label="Levels passed"><i style="width:${(passed / LEVELS_PER_PATH) * 100}%"></i></div>
        <p class="path-meta">${passed}/${LEVELS_PER_PATH} levels · ${starTotal}/${LEVELS_PER_PATH * 3} ${icon("star", { size: 13, fill: true, cls: "star-on inline" })}</p>
        <p class="path-note">Boss levels need 2 stars to beat. Missing one never takes anything away.</p>
      </article>
      <ol class="trail" aria-label="${esc(path.name)} levels">${trail}</ol>
    `;
    if (focusLevel !== null) {
      const el = document.getElementById(`lv-${focusLevel}`);
      el?.scrollIntoView({ block: "center" });
      focusLevel = null;
    } else top();
  };

  /* ------------------------------ story ------------------------------ */
  const renderStory = (path: QuestPath, chapter: number, kind: "intro" | "outro", then: () => void, thenLabel: string): void => {
    const s = path.chapters[chapter];
    root.innerHTML = `
      <article class="card story">
        <div class="badge" aria-hidden="true">${kind === "intro" ? icon(path.icon, { size: 40 }) : icon("party-popper", { size: 40 })}</div>
        <p class="path-meta">${esc(path.name)} · Chapter ${chapter + 1}</p>
        <h2>${esc(s.title)}</h2>
        <p class="story-text">${esc(kind === "intro" ? s.intro : s.outro)}</p>
        <button type="button" class="wide pink" id="storyGo">${esc(thenLabel)}</button>
        <button type="button" class="wide" id="storyBack">Back to map</button>
      </article>`;
    root.querySelector("#storyGo")?.addEventListener("click", () => {
      unlockAudio();
      sfx("tap");
      then();
    });
    root.querySelector("#storyBack")?.addEventListener("click", () => {
      sfx("tap");
      renderMap();
    });
    top();
  };

  const markSeen = (path: PathId, chapter: number, kind: "S" | "L" = "S"): void => {
    const save = ctx.getSave();
    const key = kind === "S" ? `${path}:${chapter}` : `L:${path}:${chapter}`;
    if (!save.seenStories.includes(key)) ctx.update({ seenStories: [...save.seenStories, key] });
  };

  /* ------------------------------ lesson ------------------------------ */
  const renderLesson = (pathId: PathId, chapter: number, then: () => void, thenLabel: string, card = 0): void => {
    const path = PATHS[pathIndex(pathId)];
    const lesson = LESSONS[pathId][chapter];
    const c = lesson.cards[card];
    const lastCard = card === lesson.cards.length - 1;
    const dots = lesson.cards.map((_, i) => `<i class="${i === card ? "on" : ""}"></i>`).join("");
    root.innerHTML = `
      <article class="card lesson">
        <div class="play-top">
          <button type="button" class="chip" id="lessonBack" aria-label="Back to the map">${icon("arrow-left", { size: 16, sw: 2.6 })} Map</button>
          <span class="play-tag">${icon(path.icon, { size: 18 })} Lesson ${chapter + 1}</span>
          <span class="play-count">${card + 1}/${lesson.cards.length}</span>
        </div>
        <div class="badge" aria-hidden="true">${icon("lightbulb", { size: 40 })}</div>
        <p class="path-meta">${esc(path.name)} · ${esc(lesson.skills)}</p>
        <h2>${esc(c.title)}</h2>
        <p class="lesson-text">${esc(c.body)}</p>
        <div class="example"><b>Example</b><span>${esc(c.example)}</span></div>
        <div class="dots" aria-hidden="true">${dots}</div>
        <div class="pager">
          <button type="button" class="wide" id="lessonPrev" ${card === 0 ? "disabled" : ""}>${icon("chevron-left", { size: 18, sw: 2.6 })} Back</button>
          <button type="button" class="wide pink" id="lessonNext">${lastCard ? esc(thenLabel) : "Next"}${lastCard ? "" : icon("chevron-right", { size: 18, sw: 2.6 })}</button>
        </div>
      </article>`;
    root.querySelector("#lessonBack")?.addEventListener("click", () => {
      sfx("tap");
      renderMap();
    });
    root.querySelector("#lessonPrev")?.addEventListener("click", () => {
      sfx("tap");
      if (card > 0) renderLesson(pathId, chapter, then, thenLabel, card - 1);
    });
    root.querySelector("#lessonNext")?.addEventListener("click", () => {
      unlockAudio();
      sfx("tap");
      if (lastCard) then();
      else renderLesson(pathId, chapter, then, thenLabel, card + 1);
    });
    top();
  };

  /* ------------------------------ play ------------------------------ */
  const startLevel = (pathId: PathId, level: number): void => {
    play = { path: pathId, level, qs: makeLevel(pathId, level, questionCount(level)), i: 0, correct: 0, picked: null, hint: 0, removed: [], hintsUsed: 0 };
    renderPlay();
  };

  const tryStart = (pathId: PathId, level: number): void => {
    const path = PATHS[pathIndex(pathId)];
    const ch = chapterOf(level);
    const firstOfChapter = (level - 1) % CHAPTER_SIZE === 0;
    const save = ctx.getSave();
    const storySeen = save.seenStories.includes(`${pathId}:${ch}`);
    const lessonSeen = save.seenStories.includes(`L:${pathId}:${ch}`);
    const lesson = (): void => {
      if (firstOfChapter && !lessonSeen) {
        markSeen(pathId, ch, "L");
        renderLesson(pathId, ch, () => startLevel(pathId, level), "Start practice");
      } else startLevel(pathId, level);
    };
    if (firstOfChapter && !storySeen) {
      markSeen(pathId, ch);
      renderStory(path, ch, "intro", lesson, "Let's go!");
    } else lesson();
  };

  const renderPlay = (fresh = true): void => {
    if (!play) return;
    const q = play.qs[play.i];
    const total = play.qs.length;
    const answered = play.picked !== null;
    const boss = isBoss(play.level);
    const path = PATHS[pathIndex(play.path)];

    const choices = q.choices
      .map((c) => {
        let cls = "choice";
        let mark = "";
        if (answered) {
          if (c === q.answer) {
            cls += " right";
            mark = icon("check", { size: 20, sw: 3 });
          } else if (c === play!.picked) {
            cls += " wrong";
            mark = icon("x", { size: 20, sw: 3 });
          }
        }
        const gone = !answered && play!.removed.includes(c);
        if (gone) cls += " gone";
        return `<button type="button" class="${cls}" data-choice="${esc(c)}" ${answered || gone ? "disabled" : ""}${gone ? ' aria-label="removed"' : ""}><span>${esc(c)}</span>${mark}</button>`;
      })
      .join("");

    let feedback = "";
    if (answered) {
      const ok = play.picked === q.answer;
      feedback = `<div class="feedback ${ok ? "ok" : "no"}" role="status">
        <strong>${icon(ok ? "circle-check" : "circle-x", { size: 20 })} ${ok ? "Purr-fect!" : `Not quite. The answer is ${esc(q.answer)}.`}</strong>
        <span>${esc(q.explain)}</span></div>
        <button type="button" class="wide pink" id="nextQ">${play.i + 1 === total ? "See my stars" : "Next"}</button>`;
    }

    const hintBox =
      !answered && play.hint >= 1
        ? `<div class="hint" role="status">${icon("lightbulb", { size: 18 })}<span>${esc(q.hint)}${play.hint === 2 ? " Two wrong answers are gone." : ""}</span></div>`
        : "";
    const hintBtn = answered
      ? ""
      : `<button type="button" class="hint-btn" id="hintBtn" ${play.hint === 2 ? "disabled" : ""}>${icon("lightbulb", { size: 18 })}${
          play.hint === 0 ? "Hint" : play.hint === 1 ? "Need more help? Remove 2 wrong answers" : "No more hints"
        }</button>`;

    root.innerHTML = `
      <article class="card play">
        <div class="play-top">
          <button type="button" class="chip" id="quit" aria-label="Leave level and go back to the map">${icon("arrow-left", { size: 16, sw: 2.6 })} Map</button>
          <span class="play-tag">${icon(path.icon, { size: 18 })} Level ${play.level}${boss ? ` ${icon("crown", { size: 16 })} Boss` : ""}</span>
          <span class="play-count">${play.i + 1}/${total}</span>
        </div>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${play.i + (answered ? 1 : 0)}" aria-label="Question progress"><i style="width:${((play.i + (answered ? 1 : 0)) / total) * 100}%"></i></div>
        <h2 class="prompt">${esc(q.prompt)}</h2>
        ${hintBox}
        <div class="choices" role="group" aria-label="Answer choices">${choices}</div>
        ${hintBtn}
        ${feedback}
      </article>`;
    if (!answered && fresh) top();
  };

  const finish = (): void => {
    if (!play) return;
    const { path: pid, level, correct, qs, hintsUsed } = play;
    const out = applyResult(ctx.getSave(), pid, level, correct, qs.length);
    ctx.update(out.save);
    ctx.onChange();
    sfx(out.passed ? "win" : "bad");
    const path = PATHS[pathIndex(pid)];

    let msg: string;
    if (out.gateMissed) msg = "So close, one more try! Boss levels need 2 stars. Nothing resets and you keep everything you earned.";
    else if (out.stars === 3) msg = "Purr-fect! Every whisker in place.";
    else if (out.stars === 2) msg = "Great job! Two stars.";
    else if (out.stars === 1) msg = "You passed! Try again for more stars any time.";
    else msg = "Almost there! Have another go, you've got this.";

    const last = level >= LEVELS_PER_PATH;
    const chapterDone = out.passed && isBoss(level);
    const canNext = out.passed && !last;

    root.innerHTML = `
      <article class="card result">
        <div class="badge ${out.passed ? "win" : ""}" aria-hidden="true">${out.passed ? icon("party-popper", { size: 40 }) : icon("paw-print", { size: 40 })}</div>
        <h2>${correct}/${qs.length} right</h2>
        <p class="big-stars" role="img" aria-label="${out.stars} of 3 stars">${stars(out.stars, 38)}</p>
        <p>${esc(msg)}</p>
        ${hintsUsed > 0 ? `<p class="path-meta">${icon("lightbulb", { size: 14, cls: "inline" })} Hints used: ${hintsUsed}. Hints never cost stars.</p>` : ""}
        ${!out.passed ? `<button type="button" class="wide" id="review">${icon("lightbulb", { size: 18 })} Review the lesson</button>` : ""}
        ${canNext ? `<button type="button" class="wide pink" id="nextLevel">${chapterDone ? "Chapter story" : "Next level"}</button>` : ""}
        ${chapterDone && last ? `<button type="button" class="wide pink" id="finale">Final story</button>` : ""}
        <button type="button" class="wide" id="again">Try again</button>
        <button type="button" class="wide" id="toMap">Back to map</button>
      </article>`;
    top();

    root.querySelector("#nextLevel")?.addEventListener("click", () => {
      sfx("tap");
      if (chapterDone) {
        const ch = chapterOf(level);
        renderStory(path, ch, "outro", () => tryStart(pid, level + 1), "Next chapter");
      } else startLevel(pid, level + 1);
    });
    root.querySelector("#finale")?.addEventListener("click", () => {
      sfx("tap");
      renderStory(path, 2, "outro", () => {
        focusLevel = level;
        renderMap();
      }, "Back to the map");
    });
    root.querySelector("#review")?.addEventListener("click", () => {
      sfx("tap");
      renderLesson(pid, chapterOf(level), () => startLevel(pid, level), "Practise again");
    });
    root.querySelector("#again")?.addEventListener("click", () => {
      sfx("tap");
      startLevel(pid, level);
    });
    root.querySelector("#toMap")?.addEventListener("click", () => {
      sfx("tap");
      play = null;
      focusLevel = level;
      renderMap();
    });
  };

  /* ------------------------------ events ------------------------------ */
  const onClick = (e: Event): void => {
    const t = e.target as HTMLElement;
    const btn = t.closest("button");
    if (!btn) return;
    unlockAudio();

    if (play) {
      if (btn.id === "quit") {
        sfx("tap");
        const lv = play.level;
        play = null;
        focusLevel = lv;
        renderMap();
        return;
      }
      if (btn.id === "hintBtn" && play.picked === null && play.hint < 2) {
        sfx("tap");
        const q = play.qs[play.i];
        if (play.hint === 0) {
          play.hint = 1;
          play.hintsUsed++;
        } else {
          play.hint = 2;
          const wrong = q.choices.filter((c) => c !== q.answer);
          // keep one wrong answer, remove the other two (deterministic: keep the first)
          play.removed = wrong.slice(1);
        }
        renderPlay(false);
        return;
      }
      if (btn.dataset.choice !== undefined && play.picked === null) {
        const q = play.qs[play.i];
        play.picked = btn.dataset.choice;
        const ok = play.picked === q.answer;
        if (ok) play.correct++;
        sfx(ok ? "ok" : "bad");
        renderPlay();
        root.querySelector<HTMLButtonElement>("#nextQ")?.focus({ preventScroll: false });
        return;
      }
      if (btn.id === "nextQ") {
        sfx("tap");
        if (play.i + 1 >= play.qs.length) finish();
        else {
          play.i++;
          play.picked = null;
          play.hint = 0;
          play.removed = [];
          renderPlay();
        }
        return;
      }
      return;
    }

    const p = btn.dataset.path as PathId | undefined;
    if (p) {
      if (!pathUnlocked(ctx.getSave(), p)) {
        sfx("bad");
        return;
      }
      sfx("tap");
      selected = p;
      renderMap();
      return;
    }
    if (btn.dataset.lesson !== undefined) {
      sfx("tap");
      renderLesson(selected, Number(btn.dataset.lesson), renderMap, "Back to map");
      return;
    }
    if (btn.dataset.story !== undefined) {
      sfx("tap");
      const path = PATHS[pathIndex(selected)];
      renderStory(path, Number(btn.dataset.story), "intro", renderMap, "Back to map");
      return;
    }
    if (btn.dataset.level !== undefined) {
      const l = Number(btn.dataset.level);
      if (!levelUnlocked(ctx.getSave(), selected, l)) {
        sfx("bad");
        return;
      }
      sfx("tap");
      tryStart(selected, l);
    }
  };

  root.addEventListener("click", onClick);
  renderMap();

  return {
    /** Repaint the map (e.g. after progress was reset) unless a level is in progress. */
    repaint: () => {
      if (!play && !root.querySelector(".story, .result, .lesson")) renderMap();
    },
  };
}
