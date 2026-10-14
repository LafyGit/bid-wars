#!/bin/zsh
# Low-priority archive + TestFlight upload (fanless Air: nice 19, -jobs 2). Build number comes from app.json.
cd "$(dirname "$0")/.."
export PATH=/Users/lafy/.nvm/versions/node/v24.16.0/bin:$PATH
N=$(node -p "require('./app.json').expo.ios.buildNumber")
V=$(node -p "require('./app.json').expo.version")
echo "Shipping $V ($N)"
LANG=en_US.UTF-8 nice -n 19 npx expo prebuild --platform ios --clean || { echo PREBUILD_FAILED; exit 1; }
echo 'export NODE_BINARY=/Users/lafy/.nvm/versions/node/v24.16.0/bin/node' > ios/.xcode.env.local
xattr -cr ios 2>/dev/null
A=~/Library/Developer/Xcode/Archives/$(date +%F)/BidWars-$V-$N.xcarchive
mkdir -p build; echo "$A" > build/archive-path.txt
nice -n 19 xcodebuild -jobs 2 -workspace ios/BidWars.xcworkspace -scheme BidWars -configuration Release -destination 'generic/platform=iOS' -archivePath "$A" -allowProvisioningUpdates archive > build/archive.log 2>&1
tail -3 build/archive.log
grep -q "ARCHIVE SUCCEEDED" build/archive.log || { grep -m5 "error:" build/archive.log; echo ARCHIVE_FAILED; exit 1; }
nice -n 19 xcodebuild -jobs 2 -exportArchive -archivePath "$A" -exportOptionsPlist ExportOptions.plist -exportPath build/export -allowProvisioningUpdates > build/export.log 2>&1
tail -5 build/export.log
echo SHIP_DONE
