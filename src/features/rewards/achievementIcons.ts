import {
  Award,
  CalendarCheck,
  Dumbbell,
  Flame,
  LineChart,
  Medal,
  Mountain,
  Star,
  Zap,
} from "lucide-react";

/**
 * Maps an achievement's `icon` name to a lucide component. Kept in one place
 * so the Rewards grid and the celebration overlay can't drift apart.
 */
export const ACHIEVEMENT_ICONS: Record<string, typeof Award> = {
  Dumbbell,
  CalendarCheck,
  Medal,
  Flame,
  Zap,
  Mountain,
  Star,
  LineChart,
  // No Anvil in this lucide version — reuse the dumbbell for volume badges.
  Anvil: Dumbbell,
};

export const FALLBACK_ACHIEVEMENT_ICON = Award;
