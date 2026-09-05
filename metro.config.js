const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// Add @ alias to Metro's resolver so it can find modules imported as "@/..."
defaultConfig.resolver.extraNodeModules = {
  ...(defaultConfig.resolver.extraNodeModules || {}),
  '@': path.resolve(__dirname, 'src'),
};

module.exports = defaultConfig;
