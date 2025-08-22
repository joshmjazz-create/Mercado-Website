#!/bin/bash

# Build script for GitHub Pages deployment

echo "🚀 Building Joshua Mercado Website for GitHub Pages..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Pre-build static data from Google APIs
echo "📊 Generating static data from Google APIs..."
node scripts/build-static-data.js

# Build the frontend
echo "🏗️  Building frontend..."
npm run build

# Copy static API data to build output
echo "📁 Copying static data..."
mkdir -p dist/public/api
cp -r dist/public/api/* dist/public/ 2>/dev/null || true

echo "✅ Build complete! Ready for GitHub Pages deployment."
echo "📂 Build output located in: dist/public/"