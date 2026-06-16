const fs = require('fs');
const path = require('path');

// Try to load dotenv if available
try {
  require('dotenv').config();
} catch (e) {
  // If dotenv isn't installed, try to manually load a local .env file
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) return;
      let [, key, val] = match;
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[key] = val;
    });
  }
}

// Fallback chain: Check process.env (EAS Secrets) -> fallback to local parsing
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '<REPLACE_WITH_YOUR_OPENWEATHERMAP_API_KEY>';

module.exports = ({ config }) => ({
  ...config,
  
  // 1. FIX: Added mandatory Android configuration for EAS Build
  android: {
    ...(config.android || {}),
    package: "com.oursmedia.aero"
  },

  // Ensure expo-font is registered
  plugins: [
    ...(config.plugins || []),
    'expo-font'
  ],
  
  extra: {
    ...(config.extra || {}),
    OPENWEATHER_API_KEY,
  },
});