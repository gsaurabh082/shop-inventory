#!/bin/bash

echo "Building Sweet Shop Inventory APK..."

# Install dependencies
npm install --legacy-peer-deps

# Build the app
npm run build

# Add Android platform
npx cap add android

# Sync with Capacitor
npx cap sync android

# Build APK
npx cap build android

echo "APK build complete! Check android/app/build/outputs/apk/ for the APK file."