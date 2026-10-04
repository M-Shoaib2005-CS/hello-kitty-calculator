import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Permanent Play Store id. Never change after the first upload.
  appId: "com.shoaib.catularor",
  appName: "Catularor",
  webDir: "dist",
  backgroundColor: "#fff9fb",
  android: {
    allowMixedContent: false,
  },
  // Fully offline app: no server block, no network permissions needed.
};

export default config;
