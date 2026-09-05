const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require("nativewind/metro");
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add @ alias to Metro's resolver so it can find modules imported as "@/..."
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@': path.resolve(__dirname, 'src'),
};

module.exports = withNativeWind(config, { input: "./global.css" });
