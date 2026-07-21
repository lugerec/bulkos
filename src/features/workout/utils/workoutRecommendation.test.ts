import { describe, expect, it } from "vitest";
import { toDateKey } from "@/lib/date";

import {
  applyDeloadToTemplate,
  classifyWorkoutSplit,
  detectDeload,
  getMuscleRecoveryDetail,
  getMuscleRecoveryOverview,
  getMuscleSetTargetOverview,
  getRecentEffortStrain,
  getWorkoutRecommendation,
  generateWorkoutTemplate,
  type RecommendationExercise,
  type RecommendationWorkout,
} from "./workoutRecommendation";
import type { WorkoutExercise, WorkoutTemplate } from "@/types/workout";

/**
 * Helpers build minimal, realistic fixtures using real exercise IDs from
 * the exercise library (bench-press → chest, pull-up → back, squat →
 * legs), following the "no mock data" rule: these are real definitions,
 * not fakes.
 */
function completedSet(weight = 60, reps = 8) {
  return { weight, reps, completed: true };
}

function exercise(
  exerciseId: string,
  name: string,
  setCount: number,
  completed = true
): RecommendationExercise {
  return {
    id: exerciseId,
    exerciseId,
    name,
    sets: Array.from({ length: setCount }, () =>
      completed ? completedSet() : { weight: 0, reps: 8, completed: false }
    ),
  };
}

/**
 * `WorkoutTemplate.exercises` wants mutable `WorkoutExercise[]`, whereas
 * `RecommendationExercise.sets` is `readonly` — a separate minimal helper
 * avoids a type assertion for the (structurally identical) template case.
 */
function templateExercise(
  exerciseId: string,
  name: string,
  setCount: number
): WorkoutExercise {
  return {
    id: exerciseId,
    exerciseId,
    name,
    sets: Array.from({ length: setCount }, () => ({
      weight: 60,
      reps: 8,
      completed: true,
    })),
  };
}

function workout(
  date: string,
  exercises: RecommendationExercise[],
  overrides: Partial<RecommendationWorkout> = {}
): RecommendationWorkout {
  return {
    id: `workout-${date}-${Math.random()}`,
    date,
    name: "Workout",
    volumeKg: 0,
    exercises,
    ...overrides,
  };
}

const NOW = new Date("2026-07-14T12:00:00");

function daysAgo(days: number): string {
  const date = new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
  return toDateKey(date);
}

describe("getMuscleRecoveryOverview", () => {
  it("treats every muscle as fully recovered with no training history", () => {
    const recovery = getMuscleRecoveryOverview([], NOW);
    const chest = recovery.find((item) => item.muscle === "chest");

    expect(chest?.recoveryPercent).toBe(100);
    expect(chest?.hoursSinceTrained).toBeNull();
    expect(chest?.weeklyVolumeKg).toBe(0);
  });

  it("lowers recovery for a muscle trained earlier today", () => {
    const workouts = [
      workout(daysAgo(0), [exercise("bench-press", "Bench Press", 4)]),
    ];

    const recovery = getMuscleRecoveryOverview(workouts, NOW);
    const chest = recovery.find((item) => item.muscle === "chest");

    expect(chest?.hoursSinceTrained).not.toBeNull();
    expect(chest?.hoursSinceTrained).toBeLessThan(24);
    expect(chest?.recoveryPercent).toBeLessThan(100);
    expect(chest?.recoveryPercent).toBeGreaterThanOrEqual(0);
  });

  it("returns to full recovery once the muscle's recovery window has passed", () => {
    // Chest's baseline recovery window is 48h; go well beyond it.
    const workouts = [
      workout(daysAgo(6), [exercise("bench-press", "Bench Press", 4)]),
    ];

    const recovery = getMuscleRecoveryOverview(workouts, NOW);
    const chest = recovery.find((item) => item.muscle === "chest");

    expect(chest?.recoveryPercent).toBe(100);
  });

  it("only counts sets within the last 7 days towards weekly volume", () => {
    const workouts = [
      workout(daysAgo(2), [exercise("bench-press", "Bench Press", 4)]),
      workout(daysAgo(10), [exercise("bench-press", "Bench Press", 4)]),
    ];

    const recovery = getMuscleRecoveryOverview(workouts, NOW);
    const chest = recovery.find((item) => item.muscle === "chest");
    const recentOnly = getMuscleRecoveryOverview(
      [workout(daysAgo(2), [exercise("bench-press", "Bench Press", 4)])],
      NOW
    ).find((item) => item.muscle === "chest");

    expect(chest?.weeklyVolumeKg).toBe(recentOnly?.weeklyVolumeKg);
    expect(chest?.weeklyVolumeKg).toBeGreaterThan(0);
  });

  it("ignores sets that were never completed", () => {
    const workouts = [
      workout(daysAgo(0), [
        exercise("bench-press", "Bench Press", 4, false),
      ]),
    ];

    const recovery = getMuscleRecoveryOverview(workouts, NOW);
    const chest = recovery.find((item) => item.muscle === "chest");

    expect(chest?.recoveryPercent).toBe(100);
    expect(chest?.hoursSinceTrained).toBeNull();
  });
});

describe("classifyWorkoutSplit", () => {
  it("classifies a chest/shoulders/triceps-only session as push", () => {
    const split = classifyWorkoutSplit({
      exercises: [exercise("bench-press", "Bench Press", 4)],
    });

    expect(split).toBe("push");
  });

  it("classifies a back/biceps-only session as pull", () => {
    const split = classifyWorkoutSplit({
      exercises: [exercise("pull-up", "Pull-up", 4)],
    });

    expect(split).toBe("pull");
  });

  it("classifies a legs-only session as legs", () => {
    const split = classifyWorkoutSplit({
      exercises: [exercise("squat", "Squat", 4)],
    });

    expect(split).toBe("legs");
  });

  it("classifies a push+pull session with no lower-body work as upper", () => {
    const split = classifyWorkoutSplit({
      exercises: [
        exercise("bench-press", "Bench Press", 4),
        exercise("pull-up", "Pull-up", 4),
      ],
    });

    expect(split).toBe("upper");
  });

  it("classifies an even push/lower split as lower", () => {
    const split = classifyWorkoutSplit({
      exercises: [
        exercise("squat", "Squat", 5),
        exercise("bench-press", "Bench Press", 5),
      ],
    });

    expect(split).toBe("lower");
  });

  it("classifies an even push/pull/legs session as fullBody", () => {
    const split = classifyWorkoutSplit({
      exercises: [
        exercise("bench-press", "Bench Press", 2),
        exercise("pull-up", "Pull-up", 2),
        exercise("squat", "Squat", 2),
      ],
    });

    expect(split).toBe("fullBody");
  });

  it("returns null when no exercise in the workout is recognized", () => {
    const split = classifyWorkoutSplit({
      exercises: [exercise("not-a-real-exercise-id", "Mystery Move", 3)],
    });

    expect(split).toBeNull();
  });

  it("returns null for a workout with no exercises", () => {
    expect(classifyWorkoutSplit({ exercises: [] })).toBeNull();
  });
});

describe("getMuscleSetTargetOverview", () => {
  it("marks every tracked muscle as under target with no training history", () => {
    const targets = getMuscleSetTargetOverview([], NOW);
    const chest = targets.find((item) => item.muscle === "chest");

    expect(chest?.weeklySets).toBe(0);
    expect(chest?.status).toBe("under");
  });

  it("marks a muscle optimal once weekly sets land between MEV and MAV", () => {
    // chest MEV 8 / MAV 20 — 10 completed sets this week lands in range.
    const workouts = [
      workout(daysAgo(1), [exercise("bench-press", "Bench Press", 10)]),
    ];

    const targets = getMuscleSetTargetOverview(workouts, NOW);
    const chest = targets.find((item) => item.muscle === "chest");

    expect(chest?.weeklySets).toBe(10);
    expect(chest?.status).toBe("optimal");
  });

  it("marks a muscle high once weekly sets exceed MAV", () => {
    const workouts = [
      workout(daysAgo(1), [exercise("bench-press", "Bench Press", 25)]),
    ];

    const targets = getMuscleSetTargetOverview(workouts, NOW);
    const chest = targets.find((item) => item.muscle === "chest");

    expect(chest?.status).toBe("high");
  });

  it("does not count sets older than 7 days", () => {
    const workouts = [
      workout(daysAgo(10), [exercise("bench-press", "Bench Press", 15)]),
    ];

    const targets = getMuscleSetTargetOverview(workouts, NOW);
    const chest = targets.find((item) => item.muscle === "chest");

    expect(chest?.weeklySets).toBe(0);
    expect(chest?.status).toBe("under");
  });
});

describe("getWorkoutRecommendation", () => {
  it("recommends push on a completely fresh account (tie-break default)", () => {
    const recommendation = getWorkoutRecommendation({
      workouts: [],
      templates: [],
      now: NOW,
    });

    expect(recommendation.split).toBe("push");
    expect(recommendation.readinessPercent).toBe(100);
  });

  it("recommends a recovery day after 3+ consecutive training days", () => {
    const workouts = [
      workout(daysAgo(0), [exercise("squat", "Squat", 4)]),
      workout(daysAgo(1), [exercise("pull-up", "Pull-up", 4)]),
      workout(daysAgo(2), [exercise("bench-press", "Bench Press", 4)]),
    ];

    const recommendation = getWorkoutRecommendation({
      workouts,
      templates: [],
      now: NOW,
    });

    expect(recommendation.split).toBe("recovery");
    expect(recommendation.template).toBeNull();
  });

  it("matches a user template classified for the recommended split", () => {
    const pushTemplate: WorkoutTemplate = {
      id: "template-push",
      name: "My Push Day",
      description: "",
      exercises: [templateExercise("bench-press", "Bench Press", 4)],
    };

    const recommendation = getWorkoutRecommendation({
      workouts: [],
      templates: [pushTemplate],
      now: NOW,
    });

    expect(recommendation.split).toBe("push");
    expect(recommendation.template?.id).toBe("template-push");
    expect(recommendation.isGenerated).toBe(false);
  });

  it("generates a template from the exercise library when nothing matches", () => {
    const recommendation = getWorkoutRecommendation({
      workouts: [],
      templates: [],
      now: NOW,
    });

    expect(recommendation.template).not.toBeNull();
    expect(recommendation.template?.exercises.length).toBeGreaterThan(0);
    expect(recommendation.isGenerated).toBe(true);
  });

  it("prefers the least-recently-used template when several match the split", () => {
    const templateA: WorkoutTemplate = {
      id: "template-push-a",
      name: "Push A",
      description: "",
      exercises: [templateExercise("bench-press", "Bench Press", 4)],
    };
    const templateB: WorkoutTemplate = {
      id: "template-push-b",
      name: "Push B",
      description: "",
      exercises: [templateExercise("bench-press", "Bench Press", 4)],
    };

    const workouts = [
      workout(daysAgo(5), [exercise("squat", "Squat", 4)], {
        templateId: "template-push-a",
      }),
      workout(daysAgo(1), [exercise("squat", "Squat", 4)], {
        templateId: "template-push-b",
      }),
    ];

    const recommendation = getWorkoutRecommendation({
      workouts,
      templates: [templateA, templateB],
      now: NOW,
    });

    // template-push-a was used longer ago than template-push-b, so it's due.
    expect(recommendation.template?.id).toBe("template-push-a");
  });

  it("reports undertrained muscles and excludes muscles that already hit MEV", () => {
    const workouts = [
      workout(daysAgo(1), [exercise("bench-press", "Bench Press", 10)]),
    ];

    const recommendation = getWorkoutRecommendation({
      workouts,
      templates: [],
      now: NOW,
    });

    expect(recommendation.undertrainedMuscles).not.toContain("chest");
    expect(recommendation.undertrainedMuscles).toContain("back");
  });
});

describe("detectDeload", () => {
  /**
   * Build a week of training: `count` workouts inside the 7-day window
   * that starts `weeksAgo` weeks back, each carrying `volumePerWorkout`.
   * Days are spread out so they never create a 3-day consecutive streak.
   */
  function trainingWeek(
    weeksAgo: number,
    count: number,
    volumePerWorkout: number
  ): RecommendationWorkout[] {
    return Array.from({ length: count }, (_, index) =>
      workout(
        daysAgo(weeksAgo * 7 + index * 2 + 1),
        [exercise("bench-press", "Bench Press", 4)],
        { volumeKg: volumePerWorkout }
      )
    );
  }

  it("does not fire with no training history", () => {
    const signal = detectDeload([], getMuscleRecoveryOverview([], NOW), NOW);

    expect(signal.isDeloadWeek).toBe(false);
    expect(signal.loadedWeekStreak).toBe(0);
  });

  it("does not fire after fewer than 3 loaded weeks", () => {
    const workouts = [
      ...trainingWeek(0, 3, 5000),
      ...trainingWeek(1, 3, 5000),
    ];

    const signal = detectDeload(
      workouts,
      getMuscleRecoveryOverview(workouts, NOW),
      NOW
    );

    expect(signal.loadedWeekStreak).toBe(2);
    expect(signal.isDeloadWeek).toBe(false);
  });

  it("does not fire when volume holds steady over 3+ loaded weeks", () => {
    const workouts = [
      ...trainingWeek(0, 3, 5000),
      ...trainingWeek(1, 3, 5000),
      ...trainingWeek(2, 3, 5000),
    ];

    const signal = detectDeload(
      workouts,
      getMuscleRecoveryOverview(workouts, NOW),
      NOW
    );

    expect(signal.loadedWeekStreak).toBeGreaterThanOrEqual(3);
    expect(signal.volumeDropping).toBe(false);
  });

  it("fires when weekly volume drops despite equal frequency after 3 loaded weeks", () => {
    const workouts = [
      ...trainingWeek(0, 3, 3000),
      ...trainingWeek(1, 3, 5000),
      ...trainingWeek(2, 3, 5000),
    ];

    const signal = detectDeload(
      workouts,
      getMuscleRecoveryOverview(workouts, NOW),
      NOW
    );

    expect(signal.loadedWeekStreak).toBeGreaterThanOrEqual(3);
    expect(signal.volumeDropping).toBe(true);
    expect(signal.isDeloadWeek).toBe(true);
  });

  it("does not fire when a volume drop comes from fewer sessions (planned light week)", () => {
    const workouts = [
      ...trainingWeek(0, 2, 3500),
      ...trainingWeek(1, 3, 5000),
      ...trainingWeek(2, 3, 5000),
    ];

    const signal = detectDeload(
      workouts,
      getMuscleRecoveryOverview(workouts, NOW),
      NOW
    );

    expect(signal.volumeDropping).toBe(false);
  });

  it("propagates the deload flag into the workout recommendation", () => {
    const workouts = [
      ...trainingWeek(0, 3, 3000),
      ...trainingWeek(1, 3, 5000),
      ...trainingWeek(2, 3, 5000),
    ];

    const recommendation = getWorkoutRecommendation({
      workouts,
      templates: [],
      now: NOW,
    });

    expect(recommendation.isDeloadWeek).toBe(true);
    expect(recommendation.split).not.toBe("recovery");
    expect(recommendation.reason).toContain("deload");
  });

  it("keeps isDeloadWeek false for a fresh account", () => {
    const recommendation = getWorkoutRecommendation({
      workouts: [],
      templates: [],
      now: NOW,
    });

    expect(recommendation.isDeloadWeek).toBe(false);
  });
});

describe("getMuscleRecoveryDetail", () => {
  it("returns no sessions and zero ETA for a never-trained muscle", () => {
    const detail = getMuscleRecoveryDetail("chest", [], NOW);

    expect(detail.sessions).toHaveLength(0);
    expect(detail.hoursToFullRecovery).toBe(0);
  });

  it("lists recent sessions that loaded the muscle with a positive ETA", () => {
    const workouts = [
      workout(daysAgo(0), [exercise("bench-press", "Bench Press", 4)], {
        name: "Push Day A",
      }),
    ];

    const detail = getMuscleRecoveryDetail("chest", workouts, NOW);

    expect(detail.sessions).toHaveLength(1);
    expect(detail.sessions[0].workoutName).toBe("Push Day A");
    expect(detail.sessions[0].weightedSets).toBe(4);
    expect(detail.sessions[0].weightedVolumeKg).toBeGreaterThan(0);
    expect(detail.hoursToFullRecovery).toBeGreaterThan(0);
  });

  it("reports zero ETA once the recovery window has fully passed", () => {
    const workouts = [
      workout(daysAgo(6), [exercise("bench-press", "Bench Press", 4)]),
    ];

    const detail = getMuscleRecoveryDetail("chest", workouts, NOW);

    expect(detail.sessions).toHaveLength(1);
    expect(detail.hoursToFullRecovery).toBe(0);
  });

  it("orders sessions newest first", () => {
    const workouts = [
      workout(daysAgo(3), [exercise("bench-press", "Bench Press", 4)], {
        name: "Older",
      }),
      workout(daysAgo(1), [exercise("bench-press", "Bench Press", 4)], {
        name: "Newer",
      }),
    ];

    const detail = getMuscleRecoveryDetail("chest", workouts, NOW);

    expect(detail.sessions.map((session) => session.workoutName)).toEqual([
      "Newer",
      "Older",
    ]);
  });

  it("excludes sessions that did not load the muscle", () => {
    const workouts = [
      workout(daysAgo(1), [exercise("squat", "Squat", 4)]),
    ];

    const detail = getMuscleRecoveryDetail("chest", workouts, NOW);

    expect(detail.sessions).toHaveLength(0);
  });
});

describe("applyDeloadToTemplate", () => {
  const source: WorkoutTemplate = {
    id: "template-push",
    name: "My Push Day",
    description: "Regular push day",
    exercises: [
      templateExercise("bench-press", "Bench Press", 4),
      templateExercise("pull-up", "Pull-up", 3),
      templateExercise("squat", "Squat", 1),
    ],
  };

  it("halves the sets per exercise, keeping at least one", () => {
    const deload = applyDeloadToTemplate(source, NOW);

    expect(deload.exercises[0].sets).toHaveLength(2);
    expect(deload.exercises[1].sets).toHaveLength(2);
    expect(deload.exercises[2].sets).toHaveLength(1);
  });

  it("marks all remaining sets as not completed", () => {
    const deload = applyDeloadToTemplate(source, NOW);

    for (const exercise of deload.exercises) {
      for (const set of exercise.sets) {
        expect(set.completed).toBe(false);
      }
    }
  });

  it("labels the copy and gives it a new id without mutating the source", () => {
    const deload = applyDeloadToTemplate(source, NOW);

    expect(deload.id).not.toBe(source.id);
    expect(deload.name).toBe("My Push Day · Deload");
    expect(source.exercises[0].sets).toHaveLength(4);
    expect(source.name).toBe("My Push Day");
  });

  it("increases rest time by 25% when rest is defined", () => {
    const withRest: WorkoutTemplate = {
      ...source,
      exercises: [
        { ...templateExercise("bench-press", "Bench Press", 4), restSeconds: 120 },
      ],
    };

    const deload = applyDeloadToTemplate(withRest, NOW);

    expect(deload.exercises[0].restSeconds).toBe(150);
  });
});

describe("getRecentEffortStrain", () => {
  function workoutWithEfforts(
    date: string,
    efforts: ("easy" | "moderate" | "hard")[]
  ): RecommendationWorkout {
    return {
      id: date,
      date,
      name: "W",
      volumeKg: 1000,
      exercises: [
        {
          id: "bench-press",
          name: "Bench Press",
          sets: efforts.map((effort) => ({
            reps: 8,
            weight: 60,
            completed: true,
            effort,
          })),
        },
      ],
    };
  }

  it("flags strain when most recent rated sets are hard", () => {
    const hard = Array<"hard">(6).fill("hard");
    const workouts = [
      workoutWithEfforts("2026-07-15", hard),
      workoutWithEfforts("2026-07-13", ["hard", "hard", "moderate"]),
    ];

    const strain = getRecentEffortStrain(workouts);

    expect(strain.ratedSets).toBe(9);
    expect(strain.hardRatio).toBeGreaterThanOrEqual(0.6);
    expect(strain.highStrain).toBe(true);
  });

  it("does not flag when too few sets are rated", () => {
    const workouts = [workoutWithEfforts("2026-07-15", ["hard", "hard"])];

    const strain = getRecentEffortStrain(workouts);

    expect(strain.ratedSets).toBe(2);
    expect(strain.highStrain).toBe(false);
  });

  it("does not flag when most sets felt moderate", () => {
    const mostlyModerate: ("moderate" | "hard")[] = [
      "moderate",
      "moderate",
      "moderate",
      "moderate",
      "moderate",
      "moderate",
      "hard",
      "hard",
    ];
    const workouts = [workoutWithEfforts("2026-07-15", mostlyModerate)];

    const strain = getRecentEffortStrain(workouts);

    expect(strain.highStrain).toBe(false);
  });

  it("ignores unrated and incomplete sets", () => {
    const workouts: RecommendationWorkout[] = [
      {
        id: "w1",
        date: "2026-07-15",
        name: "W",
        volumeKg: 1000,
        exercises: [
          {
            id: "bench-press",
            name: "Bench Press",
            sets: [
              { reps: 8, weight: 60, completed: true }, // unrated
              { reps: 8, weight: 60, completed: false, effort: "hard" }, // not completed
            ],
          },
        ],
      },
    ];

    const strain = getRecentEffortStrain(workouts);

    expect(strain.ratedSets).toBe(0);
    expect(strain.highStrain).toBe(false);
  });
});

describe("generateWorkoutTemplate — experience set bias", () => {
  it("produces fewer sets for beginners than advanced", () => {
    const beginner = generateWorkoutTemplate("push", [], new Date(), 0.8);
    const advanced = generateWorkoutTemplate("push", [], new Date(), 1.1);

    const totalSets = (t: { exercises: { sets: unknown[] }[] }) =>
      t.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

    expect(totalSets(beginner)).toBeLessThanOrEqual(totalSets(advanced));
    // Every exercise keeps at least one set.
    expect(beginner.exercises.every((ex) => ex.sets.length >= 1)).toBe(true);
  });

  it("defaults to unbiased set counts when no bias is given", () => {
    const a = generateWorkoutTemplate("pull", []);
    const b = generateWorkoutTemplate("pull", [], new Date(), 1);

    const totalSets = (t: { exercises: { sets: unknown[] }[] }) =>
      t.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

    expect(totalSets(a)).toBe(totalSets(b));
  });
});
