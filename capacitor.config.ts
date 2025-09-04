import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mobile.dserve',
  appName: 'D-serve',
  webDir: 'dist/mmonitoring-tambang/browser',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    }
  }
};

export default config;
