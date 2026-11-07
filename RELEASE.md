# Releasing Outbid (formerly Bid Wars) to TestFlight / the App Store

Identifiers
- Bundle ID `com.lafyalmutlaq.bidwars`, team `CN8378NUAA` (both set in `app.json`).
- App Store Connect record: "Bid Wars: Blind Auction" (the plain name "Bid Wars" is taken by another developer; the on-device name is still Bid Wars). SKU `bidwars`.

Build numbers are burned on upload. Bump `expo.ios.buildNumber` in `app.json` before every upload.
- 1.0 (1): uploaded 2026-09-28, commit `8f59424`.
- 1.1.0 (2): uploaded 2026-09-28, commit `65a587d`. Open bidding, 3-second rule, 5-item cap, AI judge, topic catalog, green/pink icon.
- 1.1.1 (3): uploaded 2026-09-28. Sound cues as CAF, reveal title on one line. Diagnostic build for the device crash (still crashed).
- 1.1.2 (4): uploaded 2026-09-28. Adopts the UIScene lifecycle via `plugins/withSceneLifecycle.js`. Fixes the launch crash on iOS 27 (`EvaluateRuntimeIssueForNoSceneLifecycleAdoption`); verified on the phone with devicectl before upload.
- 1.2.0 (5): uploaded 2026-09-28. Green/pink player palette, catalog cleanup, 10 new packs.
- 1.2.1 (6): uploaded 2026-09-29. Title clipping fix (display line-height clamp), long second name on the intro screen, setup title hides under the keyboard.
- 1.3.0 (7): uploaded 2026-09-29. Topic groups, 46 new packs (138 total), name clipping fix (trailing letter-spacing overhang).
- 1.4.0 (8): uploaded 2026-09-29. Judge never draws and ranks on pick quality, name sizing without adjustsFontSizeToFit, Khaleeji topics removed, 165 packs.
- 1.5.0 (9): uploaded 2026-09-30. 30 more packs (195 total).

Steps (mirrors the Footies flow; Xcode account must be signed in):

```bash
npm test && npm run typecheck
LANG=en_US.UTF-8 npx expo prebuild --platform ios --clean   # regenerates ios/ (gitignored)
xattr -cr ios
A=~/Library/Developer/Xcode/Archives/$(date +%F)/Outbid-1.0-N.xcarchive
xcodebuild -jobs 4 -workspace ios/Outbid.xcworkspace -scheme Outbid -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$A" -allowProvisioningUpdates archive
xcodebuild -jobs 4 -exportArchive -archivePath "$A" -exportOptionsPlist ExportOptions.plist \
  -exportPath build/export -allowProvisioningUpdates      # uploads to App Store Connect
```

Xcode's bundling step needs Node >= 20: `ios/.xcode.env.local` must point `NODE_BINARY` at the nvm v24 binary (prebuild rewrites it to whatever `node` is on PATH, so run prebuild with Node 24 active). Use `-jobs 4`: the Air is fanless.

Lafy's phone runs the iOS 27 beta, which traps at launch unless the app adopts UIScene; keep the scene-lifecycle plugin. To verify on the phone: `xcodebuild -jobs 4 ... -destination id=00008140-00165CCA2402201C -derivedDataPath build/device build`, then `xcrun devicectl device install app` / `process launch` / `capture screenshot`; crash logs: `devicectl device copy from --domain-type systemCrashLogs --source .`.

`ExportOptions.plist` uses automatic signing, `destination: upload`, and `manageAppVersionAndBuildNumber: false` so the project's own build number is the one Apple sees. Processing takes 15–30 minutes before the build appears in TestFlight. The "Upload Symbols Failed" warnings for the prebuilt React/Hermes frameworks are harmless.

- 1.0.0 (10, 11): App Store 1.0 candidates. 11 = no counts in the UI, non-repeating items/topics, can't-decide helper, 264 packs. Purchases: `com.lafyalmutlaq.bidwars.pro` ($7.99, cut to $2.99 on 2026-10-29) plus `.pack.{gaming,sports,entertainment,foodtravel,lifestyle}` ($2.99).
- 1.0.0 (13): slot-reel topic spin (scrolling strip that decelerates, overshoots and settles, ticks and haptics per title); `FitText` in `src/ui/Txt.tsx` measures the widest unbreakable word and shrinks to fit so names/items never break mid-word or get cut off; text is no longer selectable anywhere (`selectable={false}`/`userSelect: none`, name inputs hide the context menu); new auction-themed sound set (gavel, coin clink, cash-register SOLD, slot ratchet, pass whoosh). Build 12 was never uploaded.
- 1.0.0 (14): 11 more free categories (Minecraft, Video Games, Formula 1, Cars, Music, Anime, Cartoons, Travel, Sweets, Life & Fun, Style; 19 of 35 now free), FitText `fitWidth` for shrink-wrapped parents, two-line reel titles, new store screenshots (design/store, composed from web captures by design/store2/compose.py).
- 1.0.0 (15): softer bid sounds, a distinct one per player (bid1/bid2.caf) with a pooled player so fast back-to-back bids always play; 5 new categories (Pokémon, Superheroes & Comics free; Myths & Legends, Roblox & Mobile Games, Apps & Websites; 31 new packs). Not in the App Store review submission (that is build 14).
- 1.0.0 (16): AdMob (app ca-app-pub-2044567614750879~2583837206; interstitial …/1581001869 between rounds, rewarded …/1270755531 to try a locked pack), UMP consent + ATT, any purchase removes ads. TestFlight only.
- 1.0.0 (17): App Review fixes for the 1.0 rejection (2.5.4: no UIBackgroundModes audio, no microphone string; 2.3.7: screenshots without price words), plus ads, G-rated ad content, privacy choices, IP disclaimer. Resubmitted as 1.0.
- 1.0.1 (18): submitted for review 2026-10-29 (auto-release after approval). Every item is claimed (no bids → free to whoever has fewer; a full shelf hands the rest over), so both players end with 5. Judge ranks on each pack's best-first consensus order (catalog items are ordered by reviews/popularity), never money. Pro-only paywall ($2.99 from 2026-10-29): no ads + 10 niche Pro categories, everything else free; legacy group packs still honoured. One-page topic grid, hyphenated names never break, shorter splash/intro, 46 categories / 345 packs. Adds expo-updates (runtimeVersion = appVersion) so later JS-only changes can ship OTA once `eas init` sets the project id. Builds need `EXPO_USE_PRECOMPILED_MODULES=0` with Xcode 27.1 (set in ship.sh).

- 1.0.2 (19): uploaded 2026-11-07, TestFlight only. Purchases reported to RevenueCat (`src/store/revenuecat.ts`, project 29c53d28); expo-iap still makes and finishes them. Apple's rating sheet on the winner screen after a session's second round (`expo-store-review`). New native module: it needs a new binary, and importing it on a 1.0.1 binary would crash, so the version bump keeps live updates away from older builds.

Live updates (from 1.0.1 on): JS-only changes ship with `npx eas-cli update --channel production --message "..."` (EAS project @lafyexpo/bid-wars). Runtime version = app version, so an update only reaches builds with the same `expo.version`; bump the version and ship a new binary for native changes.

`react-native-purchases` is pinned to 10.16.0 on purpose: RevenueCat stopped publishing `PurchasesHybridCommon` to CocoaPods after 19.17.0, so 11.x fails `pod install` here. Its SwiftPM route needs React Native 0.88+.

Renamed to Outbid on 2026-11-07. Player-facing text, the prebuild workspace and scheme changed. Kept on purpose: bundle and product ids (`com.lafyalmutlaq.bidwars`), storage keys (`bidwars.*`, players' saved data), the EAS slug and the repo. 1.0.2 (20), uploaded 2026-11-07, is the first build with the new name; the next upload must be 21. Still to change by hand in App Store Connect: app name, Pro's display name and any store art showing the old name.
