export const C = {
    bg: "#0A0A0B",
    card: "#16161A",
    card2: "#1F1F26",
    border: "#2A2A31",
    accent: "#CCF232",
    accentDim: "rgba(204,242,50,0.16)",
    accentDim2: "rgba(204,242,50,0.07)",
    /** signature gradient for primary CTAs and hero accents */
    accentGradient: "linear-gradient(135deg, #D8FA4F 0%, #BFE829 100%)",
    accent2: "#BFE829",
    fg: "#F4F4F5",
    fg2: "#B0B0BA",
    fg3: "#999AA4",
    red: "#F87171",
    amber: "#FBBF24",
    blue: "#60A5FA",
    purple: "#C084FC",
    /** dark ink for text sitting on the lime accent */
    onAccent: "#0A0A0B",
  } as const;

/**
 * Type scale as a small set of semantic roles, so screens stop mixing a
 * dozen ad-hoc pixel sizes. Each returns inline-style props (fontSize,
 * fontWeight, letterSpacing, lineHeight). Use with `style={{ ...T.title }}`.
 */
export const T = {
  /** Big screen hero number/name — used sparingly, once per screen. */
  display: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.05,
  },
  /** Screen or major section title. */
  title: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.01em",
    lineHeight: 1.15,
  },
  /** Card heading. */
  heading: {
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: 1.25,
  },
  /** Default body copy. */
  body: {
    fontSize: 15,
    fontWeight: 400,
    lineHeight: 1.45,
  },
  /** Emphasised body / list item. */
  bodyStrong: {
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.4,
  },
  /** Small label. */
  label: {
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.3,
  },
  /** Uppercase eyebrow above a title/section. */
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    lineHeight: 1.2,
  },
  /** Smallest caption / meta text. */
  caption: {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.3,
  },
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
  | "exercise-detail"
  | "check-in"
  | "template-builder"
  | "template-editor"
  | "settings";