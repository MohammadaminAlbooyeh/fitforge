export default {
  expo: {
    name: 'FitForge',
    slug: 'fitforge',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/assets/images/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './src/assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#1A1A2E',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.fitforge.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './src/assets/images/adaptive-icon.png',
        backgroundColor: '#1A1A2E',
      },
      package: 'com.fitforge.app',
      permissions: [
        'android.permission.health.READ_STEPS',
        'android.permission.health.READ_EXERCISE',
        'android.permission.health.READ_HEART_RATE',
      ],
    },
    extra: {
      apiUrl: process.env.API_URL ?? 'http://localhost:8000',
    },
    plugins: [
      ['expo-health-kit', { permissions: ['Workout', 'HealthRecords'] }],
      'react-native-health-connect',
    ],
  },
};