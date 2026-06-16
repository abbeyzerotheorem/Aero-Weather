const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1. MERGE Transformer settings instead of overwriting them
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  experimentalImportSupport: false,
  inlineRequires: {
    ...config.transformer?.inlineRequires,
    // Enable inline requires to improve startup, but blacklist known problematic modules
    blacklist: [ /node_modules\/lottie-react-native\/.*$/ ],
  },
};

// 2. MERGE Resolver settings instead of overwriting them
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

module.exports = config;