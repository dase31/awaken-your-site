import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "world.thymos.app",
  appName: "Thymos",
  webDir: "dist",
  ios: {
    contentInset: "never",
    backgroundColor: "#F7F5F1",
  },
  plugins: {
    SplashScreen: { launchAutoHide: false, backgroundColor: "#F7F5F1" },
    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] },
    Keyboard: { resize: "native" },
  },
};

export default config;
