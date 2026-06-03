const path = require('path');

const APP_ENV = process.env.APP_ENV ?? 'development';
const IS_PROD = APP_ENV === 'production';

// Load env file sesuai APP_ENV: .env.production atau .env.development
require('dotenv').config({
  path: path.resolve(__dirname, `.env.${APP_ENV}`),
  override: true,
});

module.exports = {
  expo: {
    name: IS_PROD ? 'Arisan' : 'Arisan (Dev)',
    slug: 'arisanapppro',
    owner: 'arsdevdev123',
    version: '1.0.3',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#00C897',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.ruhaparelstudio.arisan',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#00C897',
      },
      package: 'com.ruhaparelstudio.arisan',
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      versionCode: 4,
    },
    extra: {
      appEnv: APP_ENV,
      eas: {
        projectId: '397d607e-0b51-400f-a968-a4eeb8b003ac',
      },
    },
    plugins: [
      'expo-secure-store',
      ['expo-notifications', { sounds: [] }],
      'expo-asset',
      '@react-native-firebase/app',
      '@react-native-firebase/crashlytics',
    ],
  },
};
