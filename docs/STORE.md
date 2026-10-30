# TestFlight — working draft

Everything App Store Connect asks for, prepared once. Same shape as the sibling
trackers' `docs/STORE.md`.

## Store listing (App Store and Google Play)

The public listing is not in this file. It lives in `docs/store/`, in the format of
`../store-release/SCHEMA.md`, and that is what gets pushed and reviewed:

- `docs/store/app-store.json`: name, subtitle, promotional text, description, keywords,
  URLs, category (Productivity, secondary Lifestyle), content rights (no third-party
  content), age rating (the 4+ defaults, no overrides), review notes and the App Privacy
  answers below;
- `docs/store/google-play.json`: title, short and full description, category, contact,
  financial features (none), Data safety and the expected content rating (Everyone);
- `docs/store/screenshots/`: iPhone 6.9" and Android, six each, and iPad 13", five,
  made by `node scripts/store-screenshots.mjs` from the fictional demo seed, which also
  draws `docs/store/feature-graphic-1024x500.png`. The status bars come from
  `docs/store/frame/`.

`node ../store-release/asc-release.mjs . --check` validates the App Store half. The App
Privacy label and Play's Data safety are not in either API: the owner enters them by
hand from the `appPrivacy` and `dataSafety` blocks.

Android release builds sign with the shared upload key when the four `MRWD_UPLOAD_*`
properties are in `~/.gradle/gradle.properties`, and build unsigned with a warning
otherwise (`android/app/build.gradle`). `versionCode` is 2; raise it for every upload.

## Identity

| | |
|---|---|
| App name | GoalsTable |
| Bundle id | `com.mrwd.goalstable` |
| Apple ID (ASC) | 6806621740 |
| Team | 742H5JJX37 |
| Version / build | 1.0 (2) |
| Category | Productivity |
| Privacy policy | <https://mrwd.github.io/products/goals-table/privacy/> |
| Support contact | lvigtor@gmail.com |

## Current state (checked 2026-09-25)

Build **1.0 (2)** is the one testers get: `processingState: VALID`,
`externalBuildState: BETA_APPROVED`, its review submission `APPROVED`. Build 1 is still
attached to the same group, so both are listed. The external group *Open testing* keeps
its public link on — **https://testflight.apple.com/join/EbV3NMrK**, unchanged since
build 1. Nobody has joined yet: the group lists 0 testers.

Build 2 is the current code. Its web bundle, unzipped from `build/ios/export/App.ipa`,
matches a fresh `NATIVE_SHELL=1` build of a clean tree file for file (36 of 36). The
only differences are the embedded `__BUILD_TIME__` and the file-name hashes, which the
comparison normalised. Build 1 matched the same way when it was checked.

**Build 2 expires on 2026-12-23**, build 1 on 2026-11-27 — TestFlight builds last 90
days. Once the last one expires the public link stays up with nothing to install, so
build 3 has to be uploaded before that date.

Checked through the API with `invest-table/scripts/asc.mjs`, which uses the same key.

## Build status

The signed `.ipa` of the current build is `build/ios/export/App.ipa`; build 1 is kept at
the project root as `GoalsTable-1.0-build1.ipa`. Release configuration, signed with
*iOS Team Store Provisioning Profile: com.mrwd.goalstable*.
`npm run build:native && npx cap sync ios`, then archive and export, reproduces it. A
rebuild changes every file-name hash even when no source has changed, because
`vite.config.ts` stamps `__BUILD_TIME__` into the bundle. Compare the contents, not the
names.

Already done to make it uploadable:

- the app icon is GoalsTable's own, 1024×1024, no alpha (`cap add ios` leaves
  Capacitor's placeholder logo, which would otherwise be the TestFlight icon);
- `ITSAppUsesNonExemptEncryption = false` in `Info.plist`, so no export-compliance
  question on every upload;
- the Capacitor frameworks ship their own `PrivacyInfo.xcprivacy`.

**Every later upload needs a higher build number** — bump `CURRENT_PROJECT_VERSION`
in the Xcode project; App Store Connect rejects a repeat. It stands at 2, so the next
one is 3.

## TestFlight — Test Information

Required before a build can go to *external* testers.

**Beta app description**

> GoalsTable turns a year of goals into an app: what you plan for each month, what
> you have ticked off, and the hour a day you sit down to do it. It comes with seven
> years of made-up sample goals, so every screen has something on it from the start.
> Your goals stay on the device, with no account, and it works offline. The app sends
> anonymous usage counts once a day (no IDs, nothing you type), which you can turn off
> in Profile.

This is the text live in App Store Connect, read back through the API on 2026-10-30.
Until build 3 this draft said "Seven years of my own spreadsheet are in it as sample
data", which stopped being true when the seed became fictional on 2026-10-18.

**What to test**

> - Tick goals off on the Year screen and check the ring and the category bars follow.
> - The three daily blocks on Today, and whether the streak survives closing the app.
> - Add a goal with +, and try "Move here" to pull one out of an old year or the backlog.
> - Edit a month on the Plan screen — the focus list is picked from the year's goals.
> - Switch language in Profile (20 of them; Arabic flips the layout right-to-left).
> - Export a backup, delete something, import it back.
> - Profile → Share anonymous usage statistics: switch it off and back on.

**Feedback email:** lvigtor@gmail.com

**Sign-in required:** No.

## Privacy answers

From build 3, which carries the usage counters (`src/lib/metrics.ts`, added 2026-10-28):

- **Apple privacy label: Data Collected**, two types, both **not linked to the
  user** and **not used for tracking**, purpose **Analytics**:
  - **Usage Data → Product Interaction** — counts of screens opened and features used;
  - **Diagnostics → Other Diagnostic Data** — counts of errors by type (`TypeError`),
    never the message.
  Do not tick Crash Data (no crash logs or stack traces are sent), Identifiers, or
  anything under Contact Info / User Content.
- The native shell makes one network request: the daily ping to
  `https://mrwd-metrics.vercel.app/api/ping` (app version, platform, language, local
  date, install week, the counts). Switched off in Profile, it makes none.
- Still no accounts, no server for user data, no third-party SDKs that collect
  anything.

Builds 1 and 2 sent nothing, and their answer was **Data Not Collected** — change the
label in App Store Connect when build 3 goes up, not before.

## Done on 2026-08-29

- App record created in App Store Connect — *GoalsTable*, Apple ID **6806621740**,
  bundle `com.mrwd.goalstable`, SKU `goalstable`, primary language en-US. The API
  cannot do this (`apps` allows only GET/UPDATE), so it went through the web UI.
  Apple warned that user-access settings were not saved and every user has access —
  on a one-person account that is what Full Access means anyway.
- Build **1.0 (1)** uploaded: `UPLOAD SUCCEEDED`, delivery
  `d164831f-2984-422e-8a9f-59c328cf6687`.
- Test Information created (`betaAppLocalizations`): beta description and feedback
  email. `privacyPolicyUrl` was still null at that point. It was set later that day
  to <https://mrwd.github.io/products/goals-table/privacy/>, and on 2026-09-21 it
  still held that URL.
- Build processed: `processingState: VALID`, build id
  `d164831f-2984-422e-8a9f-59c328cf6687`.
- "What to test" written (`betaBuildLocalizations`).
- External group **Open testing** created, public link enabled, build attached:
  **https://testflight.apple.com/join/EbV3NMrK** — the link exists but admits nobody
  until the build passes Beta App Review.
- Beta App Review contact filled (`betaAppReviewDetails`): Viktor Lavrov,
  lvigtor@gmail.com, phone. Apple refuses to save the block field by field — a PATCH
  without `contactPhone` answers `ENTITY_ERROR.ATTRIBUTE.REQUIRED`.
- **Submitted for Beta App Review**: `betaReviewState: WAITING_FOR_REVIEW`.

Note for the next build: setting the privacy URL alone did not unblock the
submission, and neither did the contact block alone — external testing wants both,
and the 422 (`MISSING_REQUIRED_DATA`) never says which piece is missing.

## Done on 2026-09-24

- Build **1.0 (2)** uploaded, `CURRENT_PROJECT_VERSION` bumped to 2 (commit `7e2e391`).
  It carries `16dd147`, which hides the Support section inside the native app.
- Its "What's new" reads: *Build 2. The Support section is no longer shown inside the
  app, and the links to the author's other projects open them without donation
  buttons.*
- Checked on 2026-09-25: `externalBuildState: BETA_APPROVED` and the review submission
  `APPROVED`, but that submission carries no `submittedDate` — where build 1 waited
  with a date on it, build 2 came back approved without one. The commit message says
  "in Beta App Review", which is what was true when it was written.

## What only the owner can do

All five were done by 2026-08-29 (see above). The list stays because the first step
still cannot be automated, and a new app would start from it.

- [x] **Create the app record** in App Store Connect — My Apps → + → New App:
      platform iOS, name *GoalsTable* (must be unique across the store), primary
      language, bundle id `com.mrwd.goalstable` (already registered — Xcode created
      the App ID when it made the distribution profile), SKU `goalstable`.

      This is the one step the App Store Connect API cannot do: it can manage
      builds, testers, groups and public links, but not create an app. Verified on
      2026-08-29 — with a working API key, `altool --upload-app` answers:

      > ERROR: Cannot determine the Apple ID from Bundle ID 'com.mrwd.goalstable'
      > and platform 'IOS'. (19)

      Everything after the record exists can be automated with the key in
      `~/.appstoreconnect/private_keys/`.
- [x] **Upload the `.ipa`.** Easiest is Apple's free **Transporter** app from the
      Mac App Store: sign in, drag the file in, Deliver. Xcode's Organizer
      (Window → Organizer → Archives → Distribute App) does the same from the
      archive.
- [x] **Host the privacy page** and put its URL in Test Information. External
      testing will not start without a reachable privacy policy URL. This project
      has no deployment of its own, so the policy is served from the products page:
      <https://mrwd.github.io/products/goals-table/privacy/>.
- [x] **Fill Test Information** (the texts above) and **submit for Beta App
      Review**. Apple reviews the first external build; usually a day or two.
- [x] **Enable the public link**: TestFlight → the external group → Public Link.
      That is what "open testing" means — anyone with the link installs, up to
      10,000 testers.

Internal testing (up to 100 people on the team) needs no review and works as soon
as the build finishes processing.
