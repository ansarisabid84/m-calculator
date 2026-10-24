import { CapacitorConfig } from '@capacitor/cli';

const config = {
  appId: 'com.sabid.calculator',
  appName: 'Calc',
  webDir: 'dist',
  backgroundColor: '#121317',
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: '#121317',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
    },
  },
};

export default config;
