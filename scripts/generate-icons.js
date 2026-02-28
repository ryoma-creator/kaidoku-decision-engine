#!/usr/bin/env node
/**
 * Generate placeholder icon and splash PNGs for Expo.
 *
 * Run: node scripts/generate-icons.js
 *
 * This creates minimal valid PNG files so Expo doesn't complain.
 * Replace them with real assets before publishing.
 */

const fs = require("fs");
const path = require("path");

// Minimal 1x1 green PNG (valid PNG file)
// For real icons, replace with 1024x1024 icon.png and splash-icon.png
const MINIMAL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mMUfcxQDwADhgGAqHqXuQAAAABJRU5ErkJggg==",
  "base64"
);

const assetsDir = path.join(__dirname, "..", "assets");

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const files = ["icon.png", "splash-icon.png", "adaptive-icon.png", "favicon.png"];

for (const file of files) {
  const filePath = path.join(assetsDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, MINIMAL_PNG);
    console.log(`Created placeholder: assets/${file}`);
  } else {
    console.log(`Exists: assets/${file}`);
  }
}

console.log("\nDone! Replace these with real assets before publishing.");
