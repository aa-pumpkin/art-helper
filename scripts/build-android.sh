#!/bin/sh
# Сборка Android: debug-APK в ~/artificer.apk (для установки на свой телефон)
# и подписанный AAB для Google Play в release/artificer-<версия>.aab.
# Инструменты лежат в проекте: .jdk, .android-sdk, .gradle-home; ключ — .signing/.
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"
export JAVA_HOME="$ROOT/.jdk" ANDROID_HOME="$ROOT/.android-sdk" GRADLE_USER_HOME="$ROOT/.gradle-home"
export PATH="$JAVA_HOME/bin:$PATH"
VERSION=$(node -p "require('./package.json').version")

npx quasar build -m capacitor -T android --skip-pkg
(cd src-capacitor && npx cap sync android)

TASKS=assembleDebug
[ -f .signing/keystore.properties ] && TASKS="$TASKS bundleRelease"
(cd src-capacitor/android && sh ./gradlew $TASKS --no-daemon -q)

OUT=src-capacitor/android/app/build/outputs
cp "$OUT/apk/debug/app-debug.apk" "$HOME/artificer.apk"
echo "APK: $HOME/artificer.apk"
if [ -f "$OUT/bundle/release/app-release.aab" ] && [ -f .signing/keystore.properties ]; then
  mkdir -p release
  cp "$OUT/bundle/release/app-release.aab" "release/artificer-$VERSION.aab"
  echo "AAB: $ROOT/release/artificer-$VERSION.aab"
fi
