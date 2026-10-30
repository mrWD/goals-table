# GoalsTable — project context

This file is read automatically at the start of every session. It holds what cannot be
derived from the code: why a given decision was made and which pitfalls have already been
hit.

## What this is

A yearly goals tracker, built on 2026-08-15 from the owner's Google Sheet ("Plans for the
year"), which had been kept since 2020. A PWA: one codebase runs on Android, iPhone,
desktop and the web, installs to the home screen and works offline.

The owner and, as of today, the only target user is **mrWD** (Viktor, `lvigtor@gmail.com`).

The fourth of the local-first trackers, after FilmTable, GamesTable and BooksTable. It
shares their storage layer through `tables-core` and follows their conventions — React 19 +
Vite, zustand with `persist`, `HashRouter`, Capacitor 8 shells.

## Core principles (break only with the owner's explicit consent)

1. **No backend for user data.** Goals live on the device: IndexedDB in a browser, a JSON
   file in private app storage when running natively, localStorage for the theme, the
   language and the usage counters. No accounts, and nothing the user writes ever leaves
   the device. There is no server code here — unlike FilmTable, this app has no API to
   proxy.
2. **The seed is first-run only.** `src/lib/seed.ts` is written once into an empty store
   and never consulted again. It is guarded on a `seeded` flag rather than on the store
   being empty, so someone who deletes every goal gets an empty app, not the demo back.
   Editing the seed does not change an installed app.
3. **The seed is fictional.** It ships to every installer and sits in a public repository,
   so it holds a made-up person's goals — no real names, cities, employers, income, visas
   or body measurements. Until 2026-10-18 it was the owner's own sheet, verbatim; that was
   replaced on legal review, and the old version is still in git history. Keep its size and
   category mix, so the archive looks lived-in, and word titles so `categorize` files them
   right.
4. **Its own visual identity.** Blue accent (`#2f5fe0`), distinct from FilmTable's purple.
   Six category colours that must stay distinguishable in both themes.
5. **Anonymous usage counts — and only counts — once a day.** "No analytics" stopped being
   true on 2026-10-28, with the owner's consent: he wants to know how many people use the
   app, and how, before deciding anything about ads or tips. `src/lib/metrics.ts` follows
   the contract in `../app-metrics/docs/CLIENT.md` (the server is that sibling repo) and
   sends one ping a day: counts of fixed event names (`goal_added`, `goal_completed`,
   `goal_moved`, `block_toggled`, `resource_added`, `backup_exported`, `csv_exported`,
   `backup_imported`, `screen_today|year|plan|archive|profile`), uncaught errors by
   `error.name`, the app version, platform, interface language, local date and the ISO
   week of the first launch (`legacy` for installs that had goals of their own before).
   No identifier of any kind, no titles, nothing typed, no error messages. On by default;
   off in Profile, and on the web under Global Privacy Control; off deletes the unsent
   counts. An event name is a fixed string in the code — never build one from user data.
   Anything new that is sent must go into the privacy policy (here and on the products
   page) first.

## How to run

```bash
npm install
npm run dev                       # :5177 in the shared launch.json
npm run build && npm run preview  # :4173

# for the store builds — use this before `npx cap sync`, never plain `build`.
npm run build:native
```

`node scripts/gen-icons.mjs` regenerates the PNG icons from `public/favicon.svg`.
`node scripts/site-screenshots.mjs` re-shoots the products page's ten screenshots
(`docs/store/site/`, 414×896, light and dark) from the demo seed in a fresh profile — copy
them to `products-page/products/goals-table/assets/` and check the alt text still matches.
It needs Playwright (`npm i --no-save playwright`, or `PLAYWRIGHT=<path>` to one on disk).
`node scripts/store-screenshots.mjs` makes the store images the same way: iPhone 6.9",
iPad 13" and Android screenshots in `docs/store/screenshots/`, and Play's feature graphic.
The listing texts beside them are `docs/store/app-store.json` and `google-play.json`, in
the format of `../store-release/SCHEMA.md`; `docs/STORE.md` points at them.

## How to verify

There are no automated tests. Verification is manual, through the browser panel, and it is
a mandatory part of any noticeable change. Worth running:

- **both widths** — 375px and 1280px. The desktop breakpoint at 900px is not cosmetic: it
  re-places the navigation as a grid rail, and that has already broken once (see below).
- ticking a goal, then a **full reload** — not a hash navigation, which does not remount
  and will happily "prove" persistence that is only in memory;
- both themes, and **horizontal overflow** (`document.documentElement.scrollWidth` against
  `clientWidth` — must be 0);
- a clean console.

The iOS simulator and the Android emulator are worth a pass for anything touching storage
or the status bar.

For the usage ping: run `node scripts/dev-server.mjs` in `../app-metrics` (it prints every
body it receives) and put `VITE_METRICS_URL=http://localhost:8787/api/ping` in
`.env.development.local` (gitignored). Faking `lastDay`/`lastWeek`/`lastMonth` back in the
`goalstable-metrics` localStorage key and reloading sends the next day's ping. An Android
emulator reaches the Mac at `10.0.2.2`.

## Traps already hit

- **The desktop rail.** `.nav` comes *after* `.page` in the DOM — correct for reading order
  and for the phone layout. Under `grid-template-columns: 216px 1fr` auto-placement put the
  page in the 216px column. Both are now placed explicitly. Any new direct child of `.app`
  that is not `position: fixed` will hit the same thing.
- **Ring labels.** `100%` does not fit the 56px archive ring at the summary's font size.
  `ProgressRing` scales its text with `size`; changing one without the other clips the one
  number the card exists to show.
- **Category order in `categorize.ts`.** project → money → health → life → lang → tech. Each
  swap was forced by a real row: "AI Lang Tutor" is a project, "German Taxes" is money, "Go
  to the Gym" is health rather than a relocation. Reordering these silently re-files goals.
- **Form fields must stay at 16px.** Below that, iOS zooms the page in on focus and leaves
  it zoomed — reported from the phone as "когда что-то ввожу, приложение зумится". The
  fields do not inherit the body's 15px for this reason. Do not "fix" it with
  `maximum-scale=1`: that bans pinch-zoom for people who need it.
- **A draft must live in a component that unmounts.** The month editor kept its drafts in
  `MonthCard`, which stays mounted while `isEditing` flips — so an edit that was cancelled
  reappeared the next time the month was opened. The editor is now `MonthEditor`, mounted
  only while open, and its `useState` initialisers re-run each time. Any new inline editor
  has the same trap.
- **Verifying React through the console needs two calls.** Clicking and then reading state
  in one `javascript_exec` reads the DOM before React has flushed — it will happily "prove"
  that a toggle did nothing, or save a stale value. Split the click and the assertion.
- **The licences are a generated file, shown in place.** `scripts/gen-licenses.mjs` writes
  `public/licenses.txt` (gitignored) before every `dev` and `build`; Profile fetches it and
  shows it in a card. Do not turn that into a plain link: in the native shell it navigates
  the web view itself to a text file, and on iOS there is no back button to return.
- **Inherited from the siblings** (documented there, not re-derived here): the native status
  bar follows the *system* theme, not the app's; the service worker must be destroyed in
  native builds or a new build keeps serving the old one.

## Languages

Twenty, listed in `src/i18n/index.ts`. `en.ts` is the master key list; every other locale
copies its keys in the same order, and `loadLocale` merges each over English so a key added
but not yet translated shows the English word rather than a raw key.

Rules that are easy to break:

- **A new string means 20 files.** There is a parity check worth re-running after any
  addition — compare the top-level keys of each locale against `en.ts`; all 20 must match
  exactly. They did on 2026-10-28 (121 keys each).
- **Never build a sentence by concatenation.** Word order differs; use one key with
  `{placeholders}`.
- **Plurals are `Intl.PluralRules` categories**, not `n === 1`. A locale supplies only the
  forms its language uses, `other` being the required fallback. Where a plural would also
  force a gender agreement (Russian "осталась 1 открытая цель"), the phrase is rebuilt to
  put the number after a colon — that is a translation decision, not a shortcut.
- **`theme_system` and `lang_system` are separate keys** for a reason: in Russian the theme
  is "Системная" and the language "Системный".
- **Month names and dates come from `Intl`** (`lib/format.ts`), never from a list.
- **CSS uses logical properties** (`padding-inline-start`, `inset-inline`, `text-align:
  start`). Arabic sets `dir="rtl"`, and a physical `left`/`right` will not mirror. The
  desktop rail moves to the right side on its own because CSS Grid follows the direction.

## The projects list

`src/lib/projects.ts` is a **copy** of the products page, not a feed: the app has no
backend and must open offline. It will go stale — `mrwd.github.io` is the source of truth,
and the "All products" link is what stays current. Adding a project means editing that file
here as well as the products page.

GoalsTable is deliberately not in its own list.

## Status (as of 2026-09-25)

Built in one session on 2026-08-15. On that day both the web and native shells built,
the Android debug APK compiled, and the iOS app ran on the simulator (iPhone 17 Pro,
iOS 26.5).

**iOS: open beta on TestFlight since 2026-08-29.** The current build is **1.0 (2)**,
uploaded 2026-09-24 and approved for external testing; build 1 is still attached to the
same group. The public link has not changed:
<https://testflight.apple.com/join/EbV3NMrK>. Nobody has joined yet — 0 testers. Build 2
**expires on 2026-12-23** (build 1 on 2026-11-27), and once the last one expires the
link has nothing to install, so build 3 has to go up before that. `docs/STORE.md` has
the App Store Connect ids and texts. It also records what went through the API and the
one step only the web UI can do.

**Product page:** <https://mrwd.github.io/products/goals-table/>. Its privacy policy at
`…/privacy/` is the URL that TestFlight's Test Information points to. The page, the
policy and the card on the index all live in the products-page repo
(`mrWD/mrWD.github.io`, checked out at `../products-page`), not here.

The repository is **`mrWD/goals-table`**, working branch `main`. The web version and the
Android build are not published.

Open, if the owner wants them:

- a real desktop wrapper (Electron/Tauri) for a signed `.dmg`/`.exe` — today desktop is the
  installable PWA;
- deploying the web version (the siblings use GitHub Pages and Vercel);
- store listings: an App Store release and Google Play. Today iOS is TestFlight only;
- importing a fresh CSV from the sheet, if he keeps updating the sheet in parallel — today
  the import only accepts the app's own backup format.

## Tone with the owner

He values verified facts over assumptions: before claiming anything about behaviour, run it
and show the numbers. Do large changes in a separate branch and let him review before
merging.
