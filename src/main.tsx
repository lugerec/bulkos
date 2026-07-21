import { createRoot } from "react-dom/client";

import App from "./app/App.tsx";
import "./styles/index.css";
import { useSettingsStore, applyTheme } from "./store/settingsStore";

// Apply the saved theme before first paint so there's no flash of dark
// when the user picked light (or vice versa).
applyTheme(useSettingsStore.getState().theme);

createRoot(document.getElementById("root")!).render(<App />);
