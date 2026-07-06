export const C = {
    bg: "#090909",
    card: "#171717",
    card2: "#1e1e1e",
    border: "#252525",
    accent: "#7CFF6B",
    accentDim: "rgba(124,255,107,0.12)",
    accentDim2: "rgba(124,255,107,0.06)",
    fg: "#F0F0F0",
    fg2: "#888888",
    fg3: "#444444",
    red: "#FF4C4C",
    amber: "#FFB547",
    blue: "#5B8DEF",
    purple: "#A855F7",
  } as const;
  
  export type Screen =
  | "dashboard"
  | "nutrition"
  | "food-db"
  | "meal-detail"
  | "workout"
  | "workout-history"
  | "workout-detail"
  | "progress"
  | "analytics"
  | "grocery"
  | "exercise-history"
  | "check-in"
  | "settings";