# Catularor

Cute offline kitty calculator + Math Quest for kids and students.

**Package id (Play Store, permanent):** `com.shoaib.catularor`

## Run

```bash
cd catularor
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm test             # question generators, scientific parser, progress rules
npm run build        # type-check + production build
npm run preview
```

## What's in the app

- **Calculator**: kitty four-function calculator, plus **Scientific** mode (sin/cos/tan and inverses, ln, log, √, x², xʸ, n!, π, e, brackets, `ans`, DEG/RAD). Mode and angle unit are remembered.
- **Math Quest**: 6 paths × 30 levels (Paw Plus, Times Trail, Slice Valley, Mystery Mountain, Shape Shore, Wave Peak). Each path has 3 story chapters; every 10th level is a boss that needs 2 stars. Questions are generated fresh each play. A path unlocks once the previous path has 10 levels passed. Stars never go down on a retry.
- **Lessons and hints**: every chapter opens with a 3-card lesson (idea, worked example) that you can reopen from the map or after a failed level. During a question, **Hint** shows a nudge, and a second tap removes two wrong answers. Hints never cost stars.
- **Formulas**: ~70 searchable cards across 7 categories, with notes, worked examples and favourites.
- **Calculator extras**: history of your last 20 sums (tap one to copy its result), and physical-keyboard support.
- **Profile and settings**: total stars, day streak, kitty hats that unlock with stars, per-path progress, night mode, sound, vibration, calm mode (less animation), install button (web), backup and restore, about, reset.
- **Backup**: Profile → Backup makes a `CATU1:…` text code of your stars, hats, streak and saved formulas. Paste it into Restore on another device. Restoring replaces the progress on that device.
- **First run**: a three-step welcome from Mochi, shown once.
- **If startup ever fails**, the splash turns into a "Try again / Clear saved data and retry" screen showing the error instead of hanging.
- **Offline web version**: `public/sw.js` + `public/manifest.webmanifest` make the GitHub Pages site installable and usable offline. The service worker is skipped inside the Android app, which already ships its files.
- Fully offline. Fonts are bundled via `@fontsource`. Everything saves to `localStorage`.

## Put the web version on GitHub Pages

1. Create an empty repo on GitHub, then from this folder:
   ```bash
   git add -A && git commit -m "Catularor"
   git branch -M main
   git remote add origin https://github.com/<you>/catularor.git
   git push -u origin main
   ```
2. In the repo go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` runs on every push to `main` and publishes the site at `https://<you>.github.io/catularor/`.

## Android / Play Store

Capacitor is configured (`capacitor.config.ts`, package id `com.shoaib.catularor`). See `store/release-checklist.md` for the full steps and `store/play-listing.md` + `store/privacy-policy.md` for the listing.

```bash
npm install
npm run cap:add      # once
npm run assets       # icons + splash from resources/
npm run cap:sync
npm run cap:open
```

## Project layout

```
src/calc/      basic.ts (four-function), sci.ts (expression evaluator)
src/quest/     generators.ts, hints.ts, lessons.ts, paths.ts (paths + stories), progress.ts (stars, unlocks, hats)
src/formulas/  data.ts
src/ui/        calculator.ts, quest.ts, screens.ts (formulas + profile)
src/storage/   store.ts (save state, streaks)
tests/run.ts   logic tests
store/         Play listing, privacy policy, release checklist
resources/     icon, adaptive icon layers, splash, feature graphic
```

## Icons

UI icons are [Lucide](https://lucide.dev) (ISC licence, copy in `licenses/lucide-LICENSE.txt`), inlined in `src/ui/icons.ts`. The kitty mascot and the six hats are original SVG in `src/ui/kitty.ts`. No emoji are used in the UI.

## Icon / splash

`resources/` already holds a generated kitty icon (1024×1024), adaptive-icon layers and splash art. Replace them with your own artwork (same sizes) and re-run `npm run assets`.
