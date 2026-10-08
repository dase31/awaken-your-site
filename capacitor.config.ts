import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "world.thymos.app",
  appName: "Thymos",
  webDir: "dist",
  ios: {
    contentInset: "never",
    backgroundColor: "#5aa5e6",
  },
  plugins: {
    SplashScreen: { launchAutoHide: false, backgroundColor: "#5aa5e6" },
    Keyboard: { resize: "native" },
  },
};

export default config;
