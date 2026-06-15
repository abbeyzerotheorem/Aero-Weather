const { getDefaultConfig } = require('expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.transformer = {
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  experimentalImportSupport: false,
  inlineRequires: {
    // Enable inline requires to improve startup, but blacklist known problematic modules
    // (some native modules like lottie-react-native can break when inlined)
    blacklist: [ /node_modules\/lottie-react-native\/.*$/ ],
  },
};

defaultConfig.resolver = {
  assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
};

module.exports = defaultConfig;
