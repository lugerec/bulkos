/**
 * Accent packs recolour the app's signature accent (buttons, rings, charts).
 *
 * Purely cosmetic on purpose: nothing here changes what the app can do, so
 * selling them never makes the free app worse. Gating a colour is fair;
 * gating your own training history isn't.
 */

export type AccentPack = {
  id: string;
  name: string;
  /** Main accent, used for buttons and highlights. */
  accent: string;
  /** Slightly deeper shade for gradients. */
  accent2: string;
  /** Accent for text/icons on dark backgrounds. */
  inkDark: string;
  /** Accent for text/icons on light backgrounds (needs to stay readable). */
  inkLight: string;
  /** rgb triplet used to build the translucent "dim" fills. */
  rgb: [number, number, number];
  /** Free packs ship with the app; the rest are a one-time unlock. */
  free: boolean;
};

export const ACCENT_PACKS: AccentPack[] = [
  {
    id: "volt",
    name: "Volt",
    accent: "#CCF232",
    accent2: "#BFE829",
    inkDark: "#CCF232",
    inkLight: "#5B7A0A",
    rgb: [204, 242, 50],
    free: true,
  },
  {
    id: "ember",
    name: "Ember",
    accent: "#FF7A45",
    accent2: "#F2622B",
    inkDark: "#FF8F5F",
    inkLight: "#C2410C",
    rgb: [255, 122, 69],
    free: false,
  },
  {
    id: "ice",
    name: "Ice",
    accent: "#4FC3F7",
    accent2: "#31AEE5",
    inkDark: "#6BD0FA",
    inkLight: "#0369A1",
    rgb: [79, 195, 247],
    free: false,
  },
  {
    id: "magma",
    name: "Magma",
    accent: "#F43F5E",
    accent2: "#E11D48",
    inkDark: "#FB6F86",
    inkLight: "#BE123C",
    rgb: [244, 63, 94],
    free: false,
  },
  {
    id: "mint",
    name: "Mint",
    accent: "#34D399",
    accent2: "#10B981",
    inkDark: "#4FE0AB",
    inkLight: "#047857",
    rgb: [52, 211, 153],
    free: false,
  },
  {
    id: "orchid",
    name: "Orchid",
    accent: "#C084FC",
    accent2: "#A855F7",
    inkDark: "#CD9BFD",
    inkLight: "#7E22CE",
    rgb: [192, 132, 252],
    free: false,
  },
];

export const DEFAULT_ACCENT_PACK = ACCENT_PACKS[0];

export function findAccentPack(id: string | undefined): AccentPack {
  return ACCENT_PACKS.find((pack) => pack.id === id) ?? DEFAULT_ACCENT_PACK;
}

/** Packs the user may actually apply, given their unlock status. */
export function availablePacks(hasUnlock: boolean): AccentPack[] {
  return hasUnlock ? ACCENT_PACKS : ACCENT_PACKS.filter((p) => p.free);
}

/**
 * Write a pack's colours onto the document as CSS variables. The rest of the
 * UI already reads these, so every screen recolours at once.
 */
export function applyAccentPack(pack: AccentPack, isLight = false): void {
  if (typeof document === "undefined") return;

  const [r, g, b] = pack.rgb;
  const root = document.documentElement.style;

  root.setProperty("--app-accent", pack.accent);
  root.setProperty("--app-accent-2", pack.accent2);
  root.setProperty(
    "--app-accent-gradient",
    `linear-gradient(135deg, ${pack.accent} 0%, ${pack.accent2} 100%)`
  );
  root.setProperty("--app-accent-ink", isLight ? pack.inkLight : pack.inkDark);
  root.setProperty("--app-accent-dim", `rgba(${r}, ${g}, ${b}, 0.16)`);
  root.setProperty("--app-accent-dim2", `rgba(${r}, ${g}, ${b}, 0.07)`);
}
