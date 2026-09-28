# Releasing Bid Wars to TestFlight / the App Store

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

Steps (mirrors the Footies flow; Xcode account must be signed in):

```bash
npm test && npm run typecheck
LANG=en_US.UTF-8 npx expo prebuild --platform ios --clean   # regenerates ios/ (gitignored)
xattr -cr ios
A=~/Library/Developer/Xcode/Archives/$(date +%F)/BidWars-1.0-N.xcarchive
xcodebuild -jobs 4 -workspace ios/BidWars.xcworkspace -scheme BidWars -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$A" -allowProvisioningUpdates archive
xcodebuild -jobs 4 -exportArchive -archivePath "$A" -exportOptionsPlist ExportOptions.plist \
  -exportPath build/export -allowProvisioningUpdates      # uploads to App Store Connect
```

Xcode's bundling step needs Node >= 20: `ios/.xcode.env.local` must point `NODE_BINARY` at the nvm v24 binary (prebuild rewrites it to whatever `node` is on PATH, so run prebuild with Node 24 active). Use `-jobs 4`: the Air is fanless.

Lafy's phone runs the iOS 27 beta, which traps at launch unless the app adopts UIScene; keep the scene-lifecycle plugin. To verify on the phone: `xcodebuild -jobs 4 ... -destination id=00008140-00165CCA2402201C -derivedDataPath build/device build`, then `xcrun devicectl device install app` / `process launch` / `capture screenshot`; crash logs: `devicectl device copy from --domain-type systemCrashLogs --source .`.

`ExportOptions.plist` uses automatic signing, `destination: upload`, and `manageAppVersionAndBuildNumber: false` so the project's own build number is the one Apple sees. Processing takes 15–30 minutes before the build appears in TestFlight. The "Upload Symbols Failed" warnings for the prebuilt React/Hermes frameworks are harmless.
