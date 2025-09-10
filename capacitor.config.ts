import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mobile.dserve',
  appName: 'D-serve',
  webDir: 'dist/mmonitoring-tambang/browser',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    FirebaseApp: {
      apiKey: "AIzaSyDpxIPMP-LGJDE3UzRhkklPDd0iKvoqfK0",
      authDomain: "dserve-8157d.firebaseapp.com",
      projectId: "dserve-8157d",
      storageBucket: "dserve-8157d.firebasestorage.app",
      messagingSenderId: "479454192713",
      appId: "1:479454192713:web:53165ed6434f1c8f9b8b98",
      measurementId: "G-TEYZC4NTT1"
    }
  }
};

export default config;
