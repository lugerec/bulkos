import {
  Crown,
  Dumbbell,
  Flame,
  Mountain,
  Rocket,
  Shield,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { Avatar } from "@/features/rewards/avatars";

const ICONS: Record<string, LucideIcon> = {
  Dumbbell,
  Flame,
  Zap,
  Target,
  Mountain,
  Shield,
  Rocket,
  Crown,
};

/**
 * Renders an avatar as an icon on a coloured disc. Generated rather than an
 * image asset, so there's nothing to ship, license or keep in sync.
 */
export default function AvatarBadge({
  avatar,
  size = 40,
  locked = false,
  ring,
}: {
  avatar: Avatar;
  size?: number;
  locked?: boolean;
  /** Optional ring colour, used to mark the current selection. */
  ring?: string;
}) {
  const Icon = ICONS[avatar.icon] ?? Dumbbell;

  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: avatar.color,
        opacity: locked ? 0.3 : 1,
        border: ring ? `2.5px solid ${ring}` : undefined,
      }}
    >
      <Icon size={Math.round(size * 0.48)} color="#0A0A0B" />
    </div>
  );
}
