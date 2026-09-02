import { createRoot } from "react-dom/client";

import App from "./app/App.tsx";
import "./styles/index.css";
import {
  applyAccentPack,
  findAccentPack,
} from "@/features/appearance/accentPacks";
import { useSettingsStore, applyTheme } from "./store/settingsStore";

// Apply the saved theme before first paint so there's no flash of dark
// when the user picked light (or vice versa).
applyTheme(useSettingsStore.getState().theme);
// Restore the chosen accent pack before first paint so the app never flashes
// the default colour.
applyAccentPack(
  findAccentPack(useSettingsStore.getState().accentPack),
  useSettingsStore.getState().theme === "light"
);

createRoot(document.getElementById("root")!).render(<App />);
