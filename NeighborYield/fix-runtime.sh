#!/bin/bash

# Runtime Issues Fix Script
# This script clears all caches and rebuilds the app

echo "🔧 Starting runtime issues fix..."
echo ""

# Step 1: Clear Metro bundler cache
echo "📦 Clearing Metro bundler cache..."
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*
rm -rf $TMPDIR/react-*
echo "✅ Metro cache cleared"
echo ""

# Step 2: Clear watchman cache
echo "👁️  Clearing Watchman cache..."
watchman watch-del-all 2>/dev/null || echo "⚠️  Watchman not installed (optional)"
echo ""

# Step 3: Clear Android build cache
echo "🤖 Clearing Android build cache..."
cd android
./gradlew clean
cd ..
echo "✅ Android cache cleared"
echo ""

# Step 4: Clear node_modules and reinstall
echo "📚 Reinstalling dependencies..."
rm -rf node_modules
rm -f package-lock.json
npm install
echo "✅ Dependencies reinstalled"
echo ""

echo "🎉 All caches cleared!"
echo ""
echo "Next steps:"
echo "1. Start Metro bundler: npx react-native start --reset-cache"
echo "2. In a new terminal, run: npx react-native run-android"
echo ""
