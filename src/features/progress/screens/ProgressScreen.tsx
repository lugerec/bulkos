import MuscleVolumeCard from "../components/MuscleVolumeCard";
import MuscleRecoveryCard from "../components/MuscleRecoveryCard";
import MuscleSetTargetCard from "../components/MuscleSetTargetCard";
import MuscleBalanceCard from "../components/MuscleBalanceCard";
import StallingLiftsCard from "../components/StallingLiftsCard";
import StrengthStandardsCard from "../components/StrengthStandardsCard";
import WeeklyReportCard from "../components/WeeklyReportCard";
import PhotoComparisonCard from "../components/PhotoComparisonCard";
import { getMuscleVolume } from "../utils/muscleVolume";
import { getWeeklyReport } from "../utils/weeklyReport";
import { getMuscleBalance } from "../utils/muscleBalance";
import { getStrengthStandards } from "../utils/strengthStandards";
import { detectPlateaus } from "@/features/workout/utils/plateauDetection";
import {
  getMuscleRecoveryOverview,
  getMuscleSetTargetOverview,
} from "@/features/workout/utils/workoutRecommendation";

import WeeklyWorkoutChart from "../components/WeeklyWorkoutChart";

import BodyweightChartCard from "../components/BodyweightChartCard";
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Camera,
} from "lucide-react";

import { C, type Screen } from "@/shared/ui";
import { ProgressRing, SectionHeader } from "@/shared/components";
import { useAuthStore } from "@/store/authStore";
import { useBodyMetricsStore } from "@/store/bodyMetricsStore";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";
import { toDateKey } from "@/lib/date";

type StrengthPR = {
  lift: string;
  pr: string;
  date: string;
  score: number;
};

function estimateOneRepMax(weight: number, reps: number) {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

function getStrengthPRs(
  workouts: ReturnType<typeof useWorkoutHistoryStore.getState>["workouts"]
) {
  const bestByExercise = new Map<string, StrengthPR>();

  for (const workout of workouts) {
    for (const exercise of workout.exercises ?? []) {
      for (const set of exercise.sets) {
        if (!set.completed) continue;

        const score = estimateOneRepMax(set.weight, set.reps);
        const current = bestByExercise.get(exercise.id);

        if (!current || score > current.score) {
          bestByExercise.set(exercise.id, {
            lift: exercise.name,
            pr: `${set.weight} kg × ${set.reps}`,
            date: workout.date,
            score,
          });
        }
      }
    }
  }

  return Array.from(bestByExercise.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function getStrengthPRCount(
  workouts: ReturnType<typeof useWorkoutHistoryStore.getState>["workouts"]
) {
  const exerciseIds = new Set<string>();

  for (const workout of workouts) {
    for (const exercise of workout.exercises ?? []) {
      const hasCompletedSet = exercise.sets.some((set) => set.completed);

      if (hasCompletedSet) {
        exerciseIds.add(exercise.id);
      }
    }
  }

  return exerciseIds.size;
}

function getWeekStartKey() {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);

  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  return toDateKey(monday);
}

function formatTrainingTime(seconds: number) {
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function formatChange(value: number, unit: string) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)} ${unit}`;
}

export default function ProgressScreen({
  onNavigate,
}: {
  onNavigate: (screen: Screen) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const userDoc = useAuthStore((s) => s.profile);
  const workouts = useWorkoutHistoryStore((s) => s.workouts);
  const loadWorkouts = useWorkoutHistoryStore((s) => s.loadWorkouts);

  const bodyEntries = useBodyMetricsStore((s) => s.entries);
  const loadBodyMetrics = useBodyMetricsStore((s) => s.load);

  useEffect(() => {
    if (!user) return;
  
    loadBodyMetrics(user.uid);
    loadWorkouts(user.uid);
  }, [user, loadBodyMetrics, loadWorkouts]);

  const sortedBodyEntries = [...bodyEntries].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const latestBodyEntry =
    sortedBodyEntries.length > 0
      ? sortedBodyEntries[sortedBodyEntries.length - 1]
      : undefined;

  const previousBodyEntry =
    sortedBodyEntries.length > 1
      ? sortedBodyEntries[sortedBodyEntries.length - 2]
      : undefined;

  const currentWeight = latestBodyEntry?.weightKg;
  const currentBodyFat = latestBodyEntry?.bodyFatPct;

  const weightChange =
    latestBodyEntry && previousBodyEntry
      ? latestBodyEntry.weightKg - previousBodyEntry.weightKg
      : 0;

  const bodyFatChange =
    latestBodyEntry?.bodyFatPct != null &&
    previousBodyEntry?.bodyFatPct != null
      ? latestBodyEntry.bodyFatPct - previousBodyEntry.bodyFatPct
      : undefined;

      const chartData = sortedBodyEntries.map((entry) => ({
        week: new Date(entry.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        weight: entry.weightKg,
        bodyFat: entry.bodyFatPct,
        waist: entry.waistCm,
      }));

  const strengthPRs = getStrengthPRs(workouts);

  const totalWorkouts = workouts.length;

  const totalVolume = workouts.reduce(
    (sum, workout) => sum + workout.volumeKg,
    0
  );

  const totalTrainingTime = workouts.reduce(
    (sum, workout) => sum + workout.durationSeconds,
    0
  );

  const weekStartKey = getWeekStartKey();

const workoutsThisWeek = workouts.filter(
  (workout) => workout.date >= weekStartKey
);

const currentWeekStart = new Date(`${weekStartKey}T00:00:00`);

const previousWeekStart = new Date(currentWeekStart);
previousWeekStart.setDate(previousWeekStart.getDate() - 7);

const previousWeekEnd = new Date(currentWeekStart);
previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);

const previousWeekStartKey = previousWeekStart
  .toISOString()
  .slice(0, 10);

const previousWeekEndKey = previousWeekEnd
  .toISOString()
  .slice(0, 10);

const workoutsPreviousWeek = workouts.filter(
  (workout) =>
    workout.date >= previousWeekStartKey &&
    workout.date <= previousWeekEndKey
);

const weeklyMuscleVolume = getMuscleVolume(workoutsThisWeek, currentWeight);
const muscleRecovery = getMuscleRecoveryOverview(workouts);
const muscleSetTargets = getMuscleSetTargetOverview(workouts);
const muscleBalance = getMuscleBalance(muscleSetTargets);
const plateaus = detectPlateaus(workouts);
const strengthStandards =
  currentWeight && userDoc?.profile?.sex
    ? getStrengthStandards(workouts, currentWeight, userDoc.profile.sex)
    : [];
const weeklyReport = getWeeklyReport(
  workouts,
  bodyEntries,
  userDoc?.profile?.trainingFrequency ?? 4
);
const previousWeeklyMuscleVolume = getMuscleVolume(
  workoutsPreviousWeek,
  currentWeight
);

const weeklyWorkoutCount = workoutsThisWeek.length;

const weeklyVolume = workoutsThisWeek.reduce(
  (sum, workout) => sum + workout.volumeKg,
  0
);

const weeklyTrainingTime = workoutsThisWeek.reduce(
  (sum, workout) => sum + workout.durationSeconds,
  0
);

const averageWorkoutDuration =
  weeklyWorkoutCount > 0
    ? Math.round(weeklyTrainingTime / weeklyWorkoutCount)
    : 0;

  const prCount = getStrengthPRCount(workouts);

  const weeklyChartData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
  
    const dateKey = toDateKey(date);
  
    const dayWorkouts = workouts.filter(
      (workout) => workout.date === dateKey
    );
  
    return {
      day: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      volume: dayWorkouts.reduce(
        (sum, workout) => sum + workout.volumeKg,
        0
      ),
      workouts: dayWorkouts.length,
    };
  });

  const [chartMetric, setChartMetric] = useState<
  "weight" | "bodyFat" | "waist"
  >("weight");

  const measurementCards = [
    {
      label: "Waist",
      current: latestBodyEntry?.waistCm,
      previous: previousBodyEntry?.waistCm,
      unit: "cm",
    },
    {
      label: "Chest",
      current: latestBodyEntry?.chestCm,
      previous: previousBodyEntry?.chestCm,
      unit: "cm",
    },
    {
      label: "Arms",
      current: latestBodyEntry?.armCm,
      previous: previousBodyEntry?.armCm,
      unit: "cm",
    },
    {
      label: "Legs",
      current: latestBodyEntry?.legCm,
      previous: previousBodyEntry?.legCm,
      unit: "cm",
    },
  ];

  return (
    <div className="px-5 pb-8 pt-4">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-[22px] font-bold mb-0.5" style={{ color: C.fg }}>
            Progress
          </h2>
          <p className="text-sm" style={{ color: C.fg3 }}>
            Body metrics · Strength · Photos
          </p>
        </div>

        <button
          onClick={() => onNavigate("check-in")}
          className="px-3 py-2 rounded-[14px] text-xs font-bold"
          style={{
            background: C.accent,
            color: C.bg,
          }}
        >
          Check-in
        </button>
      </div>

      <BodyweightChartCard
        currentWeight={currentWeight}
        weightChange={weightChange}
        chartData={chartData}
        chartMetric={chartMetric}
        setChartMetric={setChartMetric}
      />

      <SectionHeader title="This Week" />

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Stat
          label="Workouts"
          value={`${weeklyWorkoutCount}`}
        />

        <Stat
          label="Volume"
          value={`${weeklyVolume.toLocaleString()} kg`}
        />

        <Stat
          label="Training time"
          value={formatTrainingTime(weeklyTrainingTime)}
        />

        <Stat
          label="Average session"
          value={
            averageWorkoutDuration > 0
              ? formatTrainingTime(averageWorkoutDuration)
              : "—"
          }
        />
      </div>

      <WeeklyReportCard report={weeklyReport} />
      <WeeklyWorkoutChart data={weeklyChartData} />
      <MuscleVolumeCard data={weeklyMuscleVolume} />
      <MuscleRecoveryCard data={muscleRecovery} workouts={workouts} />
      <MuscleSetTargetCard data={muscleSetTargets} />
      <MuscleBalanceCard balances={muscleBalance} />
      <StallingLiftsCard plateaus={plateaus} />
      <StrengthStandardsCard standards={strengthStandards} />

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Stat label="Workouts" value={`${totalWorkouts}`} />
        <Stat label="Volume" value={`${totalVolume.toLocaleString()} kg`} />
        <Stat label="Time" value={formatTrainingTime(totalTrainingTime)} />
        <Stat label="PRs" value={`${prCount}`} />
      </div>

      <SectionHeader
        title="Measurements"
        action="New Check-in"
        onAction={() => onNavigate("check-in")}
      />

      <div className="grid grid-cols-2 gap-3 mb-5">
        {measurementCards.map(({ label, current, previous, unit }) => {
          const hasValue = current != null;
          const change =
            current != null && previous != null ? current - previous : null;
          const isDown = change != null && change < 0;

          return (
            <div
              key={label}
              className="rounded-[20px] p-4 card-lit"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <p className="text-[11px] mb-2" style={{ color: C.fg2 }}>
                {label}
              </p>

              <p
                className="text-[22px] font-bold leading-none"
                style={{ color: C.fg }}
              >
                {hasValue ? current : "--"}
                <span className="text-xs ml-1" style={{ color: C.fg3 }}>
                  {unit}
                </span>
              </p>

              <div className="flex items-center gap-1 mt-2">
                {change == null ? (
                  <span className="text-[11px]" style={{ color: C.fg3 }}>
                    No previous data
                  </span>
                ) : (
                  <>
                    {isDown ? (
                      <ArrowDownRight size={11} color={C.accent} />
                    ) : (
                      <ArrowUpRight size={11} color={C.accent} />
                    )}

                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: C.accent }}
                    >
                      {formatChange(change, unit)}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-[20px] p-4 mb-4 card-lit"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[11px] uppercase tracking-wider font-semibold mb-1.5"
              style={{ color: C.fg2 }}
            >
              Est. Body Fat
            </p>

            <p
              className="text-[32px] font-extrabold leading-none"
              style={{ color: C.fg }}
            >
              {currentBodyFat?.toFixed(1) ?? "--"}
              <span className="text-[17px] ml-0.5">%</span>
            </p>

            {bodyFatChange == null ? (
              <p className="text-xs mt-2" style={{ color: C.fg3 }}>
                Based on latest check-in
              </p>
            ) : (
              <div className="flex items-center gap-1 mt-2">
                {bodyFatChange < 0 ? (
                  <ArrowDownRight size={11} color={C.accent} />
                ) : (
                  <ArrowUpRight size={11} color={C.red} />
                )}

                <span
                  className="text-xs font-semibold"
                  style={{ color: bodyFatChange < 0 ? C.accent : C.red }}
                >
                  {formatChange(bodyFatChange, "%")}
                </span>
              </div>
            )}
          </div>

          <ProgressRing
            value={currentBodyFat ?? 0}
            max={30}
            size={72}
            stroke={6}
            color={C.accent}
          >
            <span className="text-[13px] font-bold" style={{ color: C.fg }}>
              {currentBodyFat != null ? `${Math.round(currentBodyFat)}%` : "--"}
            </span>
          </ProgressRing>
        </div>
      </div>

      <SectionHeader title="Personal Records" action="View all" />

      <div
        className="rounded-[20px] mb-4 overflow-hidden card-lit"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        {strengthPRs.length === 0 ? (
          <div className="px-4 py-5">
            <p className="text-sm" style={{ color: C.fg3 }}>
              No personal records yet.
            </p>
          </div>
        ) : (
          strengthPRs.map(({ lift, pr, date }, i) => (
            <div
              key={`${lift}-${date}`}
              className="flex items-center justify-between px-4 py-3.5"
              style={{
                borderBottom:
                  i < strengthPRs.length - 1
                    ? `1px solid ${C.border}`
                    : "none",
              }}
            >
              <div className="flex items-center gap-3">
                <Award size={16} color={C.accent} />

                <div>
                  <p className="text-sm font-medium" style={{ color: C.fg }}>
                    {lift}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: C.fg3 }}>
                    {date}
                  </p>
                </div>
              </div>

              <p className="text-sm font-bold" style={{ color: C.fg }}>
                {pr}
              </p>
            </div>
          ))
        )}
      </div>

      <SectionHeader
        title="Progress Photos"
        action="Upload"
        onAction={() => onNavigate("check-in")}
      />

      {latestBodyEntry?.frontPhotoUrl ||
      latestBodyEntry?.sidePhotoUrl ||
      latestBodyEntry?.backPhotoUrl ? (
        <div className="grid grid-cols-3 gap-3">
          <ProgressPhoto label="Front" url={latestBodyEntry.frontPhotoUrl} />
          <ProgressPhoto label="Side" url={latestBodyEntry.sidePhotoUrl} />
          <ProgressPhoto label="Back" url={latestBodyEntry.backPhotoUrl} />
        </div>
      ) : (
        <div
          className="rounded-[20px] overflow-hidden flex items-center justify-center card-lit"
          style={{
            height: 140,
            background: C.card,
            border: `1px solid ${C.border}`,
          }}
        >
          <div className="text-center">
            <Camera size={22} color={C.fg3} className="mx-auto mb-2" />
            <p className="text-sm font-medium" style={{ color: C.fg3 }}>
              Upload progress photos
            </p>
            <p className="text-xs mt-1" style={{ color: C.fg3 }}>
              Compare your transformation week by week
            </p>
          </div>
        </div>
      )}

      <div className="mt-5">
        <PhotoComparisonCard entries={bodyEntries} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[20px] p-4 card-lit"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <p className="text-[11px] mb-2" style={{ color: C.fg2 }}>
        {label}
      </p>

      <p className="text-[22px] font-bold leading-none" style={{ color: C.fg }}>
        {value}
      </p>
    </div>
  );
}

function ProgressPhoto({
  label,
  url,
}: {
  label: string;
  url?: string;
}) {
  return (
    <div
      className="rounded-[20px] overflow-hidden card-lit"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        height: 150,
      }}
    >
      {url ? (
        <img src={url} alt={label} className="w-full h-full object-cover" />
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-[11px]" style={{ color: C.fg3 }}>
            No {label}
          </p>
        </div>
      )}
    </div>
  );
}