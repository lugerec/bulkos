import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { C } from "@/shared/ui";
import {
  getRecalibratedTargets,
  shouldSuggestTargetUpdate,
} from "@/lib/nutrition";
import { updateNutritionTargets } from "@/services/userService";
import type { MacroTargets, UserProfile } from "@/types/profile";

type Props = {
  uid: string;
  profile: UserProfile;
  currentNutrition: MacroTargets | null | undefined;
  /** latest body weight from check-ins */
  currentWeightKg: number;
  onUpdated: () => Promise<void>;
};

/**
 * Shown when body weight has drifted from the weight the macro targets
 * were computed with. One tap recalculates and persists new targets.
 */
export default function TargetUpdateCard({
  uid,
  profile,
  currentNutrition,
  currentWeightKg,
  onUpdated,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!shouldSuggestTargetUpdate(profile.weight, currentWeightKg)) {
    return null;
  }

  const next = getRecalibratedTargets(profile, currentWeightKg);
  const proteinDiff = next.protein - (currentNutrition?.protein ?? 0);
  const caloriesDiff = next.calories - (currentNutrition?.calories ?? 0);

  const formatDiff = (value: number, unit: string) =>
    `${value >= 0 ? "+" : ""}${value} ${unit}`;

  const handleUpdate = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setError(null);
      await updateNutritionTargets(uid, currentWeightKg, next);
      await onUpdated();
    } catch {
      setError("Could not update targets. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="rounded-[22px] p-4 mb-5"
      style={{
        background: "rgba(91,141,239,0.08)",
        border: "1px solid rgba(91,141,239,0.25)",
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <RefreshCw size={14} color={C.blue} />
        <span className="text-sm font-semibold" style={{ color: C.fg }}>
          Update your macro targets?
        </span>
      </div>

      <p className="text-xs mb-3" style={{ color: C.fg2 }}>
        Your weight changed from {profile.weight} kg to {currentWeightKg} kg
        since your targets were set. New targets: {next.calories} kcal (
        {formatDiff(caloriesDiff, "kcal")}), {next.protein} g protein (
        {formatDiff(proteinDiff, "g")}).
      </p>

      {error && (
        <p className="text-xs mb-2" style={{ color: C.red }}>
          {error}
        </p>
      )}

      <button
        onClick={handleUpdate}
        disabled={saving}
        className="w-full py-2.5 rounded-[14px] text-xs font-bold"
        style={{
          background: C.blue,
          color: C.bg,
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? "Updating…" : "Update targets"}
      </button>
    </div>
  );
}
