import { useState } from "react";

import { C } from "@/shared/ui";
import { SectionHeader } from "@/shared/components";
import { calculateMacroTargets } from "@/lib/nutrition";
import { updateUserOnboarding } from "@/services/userService";
import type {
  ActivityLevel,
  Goal,
  TrainingFrequency,
  UserProfile,
} from "@/types/profile";

type Props = {
  uid: string;
  profile: UserProfile;
  onSaved: () => Promise<void>;
};

const GOALS: readonly Goal[] = ["bulk", "maintain", "cut"];
const FREQUENCIES: readonly TrainingFrequency[] = [3, 4, 5, 6];
const ACTIVITIES: readonly ActivityLevel[] = ["low", "moderate", "high"];

/**
 * Settings section for editing goal, training frequency, activity level
 * and goal weight after onboarding. Saving recomputes macro targets from
 * the updated profile and persists both in one write.
 */
export default function ProfileGoalsCard({ uid, profile, onSaved }: Props) {
  const [goal, setGoal] = useState<Goal>(profile.goal);
  const [frequency, setFrequency] = useState<TrainingFrequency>(
    profile.trainingFrequency
  );
  const [activity, setActivity] = useState<ActivityLevel>(profile.activity);
  const [goalWeight, setGoalWeight] = useState(String(profile.goalWeight));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const parsedGoalWeight = Number(goalWeight);
  const goalWeightValid =
    Number.isFinite(parsedGoalWeight) && parsedGoalWeight > 0;

  const dirty =
    goal !== profile.goal ||
    frequency !== profile.trainingFrequency ||
    activity !== profile.activity ||
    (goalWeightValid && parsedGoalWeight !== profile.goalWeight);

  const handleSave = async () => {
    if (saving || !dirty || !goalWeightValid) return;

    const nextProfile: UserProfile = {
      ...profile,
      goal,
      trainingFrequency: frequency,
      activity,
      goalWeight: parsedGoalWeight,
    };

    try {
      setSaving(true);
      setError(null);
      await updateUserOnboarding(
        uid,
        nextProfile,
        calculateMacroTargets(nextProfile)
      );
      await onSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Could not save changes. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const Segmented = <T extends string | number>({
    options,
    value,
    onChange,
  }: {
    options: readonly T[];
    value: T;
    onChange: (option: T) => void;
  }) => (
    <div
      className="flex rounded-xl overflow-hidden"
      style={{ border: `1px solid ${C.border}` }}
    >
      {options.map((option) => (
        <button
          key={String(option)}
          onClick={() => onChange(option)}
          className="px-3 py-1.5 text-xs font-semibold capitalize"
          style={{
            background: value === option ? C.accent : "transparent",
            color: value === option ? C.bg : C.fg3,
          }}
        >
          {String(option)}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <SectionHeader title="Profile & Goals" />

      <div
        className="rounded-[20px] mb-4 overflow-hidden card-lit"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div
          className="flex justify-between items-center px-4 py-3.5"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <span className="text-sm" style={{ color: C.fg2 }}>
            Goal
          </span>
          <Segmented options={GOALS} value={goal} onChange={setGoal} />
        </div>

        <div
          className="flex justify-between items-center px-4 py-3.5"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <span className="text-sm" style={{ color: C.fg2 }}>
            Training days / week
          </span>
          <Segmented
            options={FREQUENCIES}
            value={frequency}
            onChange={setFrequency}
          />
        </div>

        <div
          className="flex justify-between items-center px-4 py-3.5"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <span className="text-sm" style={{ color: C.fg2 }}>
            Activity level
          </span>
          <Segmented
            options={ACTIVITIES}
            value={activity}
            onChange={setActivity}
          />
        </div>

        <div className="flex justify-between items-center px-4 py-3.5">
          <span className="text-sm" style={{ color: C.fg2 }}>
            Goal weight (kg)
          </span>
          <input
            type="number"
            inputMode="decimal"
            value={goalWeight}
            onChange={(event) => setGoalWeight(event.target.value)}
            className="w-20 px-2 py-1.5 rounded-xl text-xs font-semibold text-right outline-none"
            style={{
              background: C.card2,
              border: `1px solid ${goalWeightValid ? C.border : C.red}`,
              color: C.fg,
            }}
          />
        </div>

        {(dirty || error || saved) && (
          <div className="px-4 pb-4">
            {error && (
              <p className="text-xs mb-2" style={{ color: C.red }}>
                {error}
              </p>
            )}

            {saved && !dirty ? (
              <p className="text-xs font-semibold" style={{ color: C.accentInk }}>
                Saved — macro targets updated.
              </p>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving || !goalWeightValid}
                className="w-full py-2.5 rounded-[14px] text-xs font-bold"
                style={{
                  background: C.accent,
                  color: C.onAccent,
                  opacity: saving || !goalWeightValid ? 0.6 : 1,
                }}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
