export const C = {
    bg: "#0A0A0B",
    card: "#16161A",
    card2: "#1F1F26",
    border: "#2A2A31",
    accent: "#A3E635",
    accentDim: "rgba(163,230,53,0.14)",
    accentDim2: "rgba(163,230,53,0.06)",
    fg: "#F4F4F5",
    fg2: "#A1A1AA",
    fg3: "#71717A",
    red: "#F87171",
    amber: "#FBBF24",
    blue: "#60A5FA",
    purple: "#C084FC",
    /** dark ink for text sitting on the lime accent */
    onAccent: "#0A0A0B",
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
  | "one-rep-max"
  | "exercise-history"
  | "check-in"
  | "template-builder"
  | "template-editor"
  | "settings";