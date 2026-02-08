#!/bin/bash

echo "🔧 Rebuilding Android App with Network Fixes"
echo "=============================================="
echo ""

# Step 1: Clean Android build
echo "📦 Step 1: Cleaning Android build..."
cd android
./gradlew clean
cd ..
echo "✅ Clean complete"
echo ""

# Step 2: Clear Metro cache
echo "🗑️  Step 2: Clearing Metro bundler cache..."
rm -rf node_modules/.cache
echo "✅ Cache cleared"
echo ""

# Step 3: Kill any existing Metro processes
echo "🛑 Step 3: Stopping existing Metro processes..."
pkill -f "react-native" || true
pkill -f "metro" || true
echo "✅ Processes stopped"
echo ""

echo "=============================================="
echo "✅ Rebuild preparation complete!"
echo ""
echo "Next steps:"
echo "1. Start Metro bundler:"
echo "   npm start -- --reset-cache"
echo ""
echo "2. In a NEW terminal, run:"
echo "   npm run android"
echo ""
echo "3. Watch the Metro console for network test results"
echo "=============================================="
