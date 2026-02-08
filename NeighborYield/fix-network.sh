#!/bin/bash

echo "🔧 Fixing Android Network Issues..."
echo ""

# Kill any running Metro bundler
echo "1️⃣ Stopping Metro bundler..."
pkill -f "react-native" || true
pkill -f "metro" || true

# Clean Android build
echo "2️⃣ Cleaning Android build..."
cd android
./gradlew clean
cd ..

# Clear React Native cache
echo "3️⃣ Clearing React Native cache..."
rm -rf node_modules/.cache
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*

# Rebuild Android app
echo "4️⃣ Rebuilding Android app..."
cd android
./gradlew assembleDebug
cd ..

# Uninstall old app from emulator
echo "5️⃣ Uninstalling old app from emulator..."
adb uninstall com.neighboryieldtemp || true

# Install fresh build
echo "6️⃣ Installing fresh build..."
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Start Metro bundler
echo "7️⃣ Starting Metro bundler..."
npx react-native start --reset-cache &

sleep 5

# Launch app
echo "8️⃣ Launching app..."
adb shell am start -n com.neighboryieldtemp/.MainActivity

echo ""
echo "✅ Done! Check your emulator."
echo "   If you still see network errors, try:"
echo "   - Cold boot the emulator (AVD Manager → Cold Boot Now)"
echo "   - Use a physical device instead"
