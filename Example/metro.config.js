const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Path to the linked library
const libraryRoot = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [libraryRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(libraryRoot, 'node_modules'),
    ],
    // Ensure symlinks are resolved
    unstable_enableSymlinks: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
