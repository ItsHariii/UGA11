#!/bin/bash

echo "🔄 Restarting NeighborYield with cache clear..."
echo ""

# Kill any existing Metro bundler
echo "Stopping Metro bundler..."
pkill -f "react-native" || true
pkill -f "metro" || true

echo ""
echo "Starting Metro with reset cache..."
npm start -- --reset-cache
