import { describe, expect, it } from "vitest";

import { getMuscleBalance } from "./muscleBalance";
import type { MuscleSetTargetInfo } from "@/features/workout/utils/workoutRecommendation";

function target(
  muscle: MuscleSetTargetInfo["muscle"],
  weeklySets: number
): MuscleSetTargetInfo {
  return { muscle, weeklySets, mev: 8, mav: 20, status: "optimal" };
}

function findBalance(
  targets: MuscleSetTargetInfo[],
  label: string
) {
  return getMuscleBalance(targets).find((b) => b.label === label);
}

describe("getMuscleBalance", () => {
  it("returns nothing when no pairing has volume", () => {
    expect(getMuscleBalance([])).toHaveLength(0);
    expect(getMuscleBalance([target("calves", 10)])).toHaveLength(0);
  });

  it("marks even push/pull volume as balanced", () => {
    const push = findBalance(
      [
        target("chest", 6),
        target("shoulders", 4),
        target("triceps", 2), // push = 12
        target("back", 10),
        target("biceps", 2), // pull = 12
      ],
      "Push / Pull"
    );

    expect(push?.status).toBe("balanced");
    expect(push?.ratio).toBe(1);
    expect(push?.weakerSide).toBeNull();
  });

  it("flags a push-dominant split and names pull as the weaker side", () => {
    const push = findBalance(
      [
        target("chest", 12),
        target("shoulders", 6),
        target("triceps", 6), // push = 24
        target("back", 8),
        target("biceps", 2), // pull = 10
      ],
      "Push / Pull"
    );

    expect(push?.status).toBe("imbalanced");
    expect(push?.weakerSide).toBe("Pull");
  });

  it("names push as weaker when pull dominates", () => {
    const push = findBalance(
      [
        target("chest", 4),
        target("back", 14),
        target("biceps", 4),
      ],
      "Push / Pull"
    );

    expect(push?.weakerSide).toBe("Push");
    expect(push?.status).toBe("imbalanced");
  });

  it("treats a mild deviation as slightly off", () => {
    // push 12 / pull 9 -> ratio 1.33 -> ln(1.33)=0.29 -> mild
    const push = findBalance(
      [
        target("chest", 6),
        target("shoulders", 6),
        target("back", 7),
        target("biceps", 2),
      ],
      "Push / Pull"
    );

    expect(push?.status).toBe("mild");
    expect(push?.weakerSide).toBe("Pull");
  });

  it("handles one side having zero volume as imbalanced", () => {
    const balance = findBalance(
      [target("biceps", 10)],
      "Biceps / Triceps"
    );

    expect(balance?.status).toBe("imbalanced");
    expect(balance?.weakerSide).toBe("Triceps");
    expect(balance?.ratio).toBe(0);
  });
});
