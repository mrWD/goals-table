# TestFlight — working draft

Everything App Store Connect asks for, prepared once. Same shape as the sibling
trackers' `docs/STORE.md`.

## Identity

| | |
|---|---|
| App name | GoalsTable |
| Bundle id | `com.mrwd.goalstable` |
| Apple ID (ASC) | 6806621740 |
| Team | 742H5JJX37 |
| Version / build | 1.0 (1) |
| Category | Productivity |
| Privacy policy | <https://mrwd.github.io/products/goals-table/privacy/> |
| Support contact | lvigtor@gmail.com |

## Current state (checked 2026-09-21)

Build **1.0 (1)** is in open testing: Beta App Review `APPROVED`, the external group
*Open testing* has its public link on and the build attached —
**https://testflight.apple.com/join/EbV3NMrK**. The join page reads "Join the
GoalsTable beta". Nobody had joined yet: the group listed 0 testers.

The build is the current code. Its web bundle, unzipped from the `.ipa`, matches a
fresh `NATIVE_SHELL=1` build file for file (36 of 36). The only differences are the
embedded `__BUILD_TIME__` and the file-name hashes, which the comparison normalised.

**It expires on 2026-11-27.** TestFlight builds last 90 days. After that date the
public link stays up but has nothing to install, so build 2 has to be uploaded and
submitted before then.

Checked through the API with `invest-table/scripts/asc.mjs`, which uses the same key.

## Build status

The signed `.ipa` of build 1 is kept at the project root as
`GoalsTable-1.0-build1.ipa`. The scratchpad it was exported to is gone. Release
configuration, signed with *iOS Team Store Provisioning Profile:
com.mrwd.goalstable*. `npm run build:native && npx cap sync ios`, then archive and
export, reproduces it. A rebuild changes every file-name hash even when no source has
changed, because `vite.config.ts` stamps `__BUILD_TIME__` into the bundle. Compare the
contents, not the names.

Already done to make it uploadable:

- the app icon is GoalsTable's own, 1024×1024, no alpha (`cap add ios` leaves
  Capacitor's placeholder logo, which would otherwise be the TestFlight icon);
- `ITSAppUsesNonExemptEncryption = false` in `Info.plist`, so no export-compliance
  question on every upload;
- the Capacitor frameworks ship their own `PrivacyInfo.xcprivacy`.

**Every later upload needs a higher build number** — bump `CURRENT_PROJECT_VERSION`
in the Xcode project; App Store Connect rejects a repeat of 1.

## TestFlight — Test Information

Required before a build can go to *external* testers.

**Beta app description**

> GoalsTable turns a year of goals into an app: what you plan for each month, what
> you have ticked off, and the hour a day you sit down to do it. Seven years of my
> own spreadsheet are in it as sample data. Everything stays on the device — no
> account, no server, works offline.

**What to test**

> - Tick goals off on the Year screen and check the ring and the category bars follow.
> - The three daily blocks on Today, and whether the streak survives closing the app.
> - Add a goal with +, and try "Move here" to pull one out of an old year or the backlog.
> - Edit a month on the Plan screen — the focus list is picked from the year's goals.
> - Switch language in Profile (20 of them; Arabic flips the layout right-to-left).
> - Export a backup, delete something, import it back.

**Feedback email:** lvigtor@gmail.com

**Sign-in required:** No.

## Privacy answers

- **Apple privacy label: Data Not Collected.** No accounts, no server for user
  data, no analytics, no crash reporting of our own, no third-party SDKs that
  collect anything.
- The app makes no network requests at all in the native shell.

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
