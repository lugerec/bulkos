import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lugerec.bulkos",
  appName: "BulkOS",
  webDir: "dist",
  ios: {
    // Match the app's dark background so no white flash on launch/overscroll.
    backgroundColor: "#0A0A0B",
    contentInset: "never",
  },
};

export default config;
