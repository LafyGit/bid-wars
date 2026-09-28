# Releasing Bid Wars to TestFlight / the App Store

Identifiers
- Bundle ID `com.lafyalmutlaq.bidwars`, team `CN8378NUAA` (both set in `app.json`).
- App Store Connect record: "Bid Wars: Blind Auction" (the plain name "Bid Wars" is taken by another developer; the on-device name is still Bid Wars). SKU `bidwars`.

Build numbers are burned on upload. Bump `expo.ios.buildNumber` in `app.json` before every upload.
- 1.0 (1): uploaded 2026-09-28, commit `8f59424`.
- 1.1.0 (2): uploaded 2026-09-28, commit `65a587d`. Open bidding, 3-second rule, 5-item cap, AI judge, topic catalog, green/pink icon.

Steps (mirrors the Footies flow; Xcode account must be signed in):

```bash
npm test && npm run typecheck
LANG=en_US.UTF-8 npx expo prebuild --platform ios --clean   # regenerates ios/ (gitignored)
xattr -cr ios
A=~/Library/Developer/Xcode/Archives/$(date +%F)/BidWars-1.0-N.xcarchive
xcodebuild -workspace ios/BidWars.xcworkspace -scheme BidWars -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$A" -allowProvisioningUpdates archive
xcodebuild -exportArchive -archivePath "$A" -exportOptionsPlist ExportOptions.plist \
  -exportPath build/export -allowProvisioningUpdates      # uploads to App Store Connect
```

`ExportOptions.plist` uses automatic signing, `destination: upload`, and `manageAppVersionAndBuildNumber: false` so the project's own build number is the one Apple sees. Processing takes 15–30 minutes before the build appears in TestFlight. The "Upload Symbols Failed" warnings for the prebuilt React/Hermes frameworks are harmless.
