/**
 * Avatars are earned by levelling, never bought.
 *
 * Deliberately kept separate from the paid accent packs: progression rewards
 * that can also be purchased stop feeling earned, and paid items that can also
 * be earned stop being worth paying for. Levels give identity, money gives
 * colour.
 *
 * Each avatar is a lucide icon over a colour, so there's no artwork to source
 * or ship — the same reason the exercise media has been a headache.
 */

export type Avatar = {
  id: string;
  name: string;
  /** lucide icon name, resolved by the UI. */
  icon: string;
  /** Background colour behind the icon. */
  color: string;
  /** Level required to unlock. 1 = available from the start. */
  unlocksAtLevel: number;
};

export const AVATARS: Avatar[] = [
  { id: "dumbbell", name: "Rookie", icon: "Dumbbell", color: "#64748B", unlocksAtLevel: 1 },
  { id: "flame", name: "Warmed Up", icon: "Flame", color: "#FB923C", unlocksAtLevel: 3 },
  { id: "zap", name: "Charged", icon: "Zap", color: "#FACC15", unlocksAtLevel: 5 },
  { id: "target", name: "Focused", icon: "Target", color: "#38BDF8", unlocksAtLevel: 8 },
  { id: "mountain", name: "Climber", icon: "Mountain", color: "#34D399", unlocksAtLevel: 12 },
  { id: "shield", name: "Ironclad", icon: "Shield", color: "#A78BFA", unlocksAtLevel: 16 },
  { id: "rocket", name: "Ascending", icon: "Rocket", color: "#F472B6", unlocksAtLevel: 20 },
  { id: "crown", name: "Apex", icon: "Crown", color: "#FBBF24", unlocksAtLevel: 25 },
];

export const DEFAULT_AVATAR = AVATARS[0];

export function findAvatar(id: string | undefined): Avatar {
  return AVATARS.find((a) => a.id === id) ?? DEFAULT_AVATAR;
}

/** Avatars the user has earned at this level. */
export function unlockedAvatars(level: number): Avatar[] {
  return AVATARS.filter((a) => a.unlocksAtLevel <= level);
}

export function isAvatarUnlocked(avatar: Avatar, level: number): boolean {
  return avatar.unlocksAtLevel <= level;
}

/**
 * Avatars unlocked by crossing from `fromLevel` to `toLevel`, so a level-up can
 * announce exactly what was earned.
 */
export function avatarsUnlockedBetween(
  fromLevel: number,
  toLevel: number
): Avatar[] {
  if (toLevel <= fromLevel) return [];

  return AVATARS.filter(
    (a) => a.unlocksAtLevel > fromLevel && a.unlocksAtLevel <= toLevel
  );
}

/** The next avatar still to be earned, for a "keep going" hint. */
export function nextAvatar(level: number): Avatar | null {
  return AVATARS.find((a) => a.unlocksAtLevel > level) ?? null;
}
