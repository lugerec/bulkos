import type { Equipment } from "@/types/workout";

/**
 * Effective load of one set. For bodyweight equipment the logged weight is
 * treated as *added* load (weighted pull-ups, dips) on top of the lifter's
 * body weight — matching how Strong/Hevy count bodyweight volume. When the
 * body weight is unknown, falls back to the logged weight alone.
 */
export function getEffectiveSetWeight(
  equipment: Equipment | undefined,
  setWeight: number,
  bodyweightKg?: number
): number {
  if (
    equipment === "bodyweight" &&
    typeof bodyweightKg === "number" &&
    bodyweightKg > 0
  ) {
    return setWeight + bodyweightKg;
  }

  return setWeight;
}
