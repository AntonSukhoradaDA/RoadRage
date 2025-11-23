// Custom Metro config for Expo to support loading TensorFlow.js binary weight files (.bin)
// used by road damage YOLOv8 model.
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure .bin is treated as an asset so `require('../assets/.../*.bin')` works.
if (!config.resolver.assetExts.includes('bin')) {
  config.resolver.assetExts.push('bin');
}

module.exports = config;


