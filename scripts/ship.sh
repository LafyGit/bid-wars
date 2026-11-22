#!/bin/zsh
# Low-priority archive + TestFlight upload (fanless Air: nice 19, -jobs 2). Build number comes from app.json.
cd "$(dirname "$0")/.."
export PATH=/Users/lafy/.nvm/versions/node/v24.16.0/bin:$PATH
# Expo's prebuilt module xcframeworks are built with an older Swift than Xcode 27.1 can import; build them from source.
export EXPO_USE_PRECOMPILED_MODULES=0
N=$(node -p "require('./app.json').expo.ios.buildNumber")
V=$(node -p "require('./app.json').expo.version")
echo "Shipping $V ($N)"
# The AI judge key would be bundled in plain text (EXPO_PUBLIC_*). Refuse to ship a public build with one set.
if [ -n "$EXPO_PUBLIC_ANTHROPIC_API_KEY" ] || grep -qsE '^EXPO_PUBLIC_ANTHROPIC_API_KEY=.+' .env .env.local .env.production; then
  echo "EXPO_PUBLIC_ANTHROPIC_API_KEY is set: it would ship inside the app. Unset it (or move the judge behind a proxy)."; exit 1
fi
LANG=en_US.UTF-8 nice -n 19 npx expo prebuild --platform ios --clean || { echo PREBUILD_FAILED; exit 1; }
echo 'export NODE_BINARY=/Users/lafy/.nvm/versions/node/v24.16.0/bin/node' > ios/.xcode.env.local
xattr -cr ios 2>/dev/null
A=~/Library/Developer/Xcode/Archives/$(date +%F)/Outbid-$V-$N.xcarchive
mkdir -p build; echo "$A" > build/archive-path.txt
nice -n 19 xcodebuild -jobs 2 -workspace ios/Outbid.xcworkspace -scheme Outbid -configuration Release -destination 'generic/platform=iOS' -archivePath "$A" -allowProvisioningUpdates archive > build/archive.log 2>&1
tail -3 build/archive.log
grep -q "ARCHIVE SUCCEEDED" build/archive.log || { grep -m5 "error:" build/archive.log; echo ARCHIVE_FAILED; exit 1; }
if grep -aqE 'sk-ant-[A-Za-z0-9_-]{10}' "$A/Products/Applications/Outbid.app/main.jsbundle"; then echo "Anthropic key found in the bundle: not uploading."; exit 1; fi
nice -n 19 xcodebuild -jobs 2 -exportArchive -archivePath "$A" -exportOptionsPlist ExportOptions.plist -exportPath build/export -allowProvisioningUpdates > build/export.log 2>&1
tail -5 build/export.log
echo SHIP_DONE
