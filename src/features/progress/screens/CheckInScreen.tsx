import { useEffect, useState } from "react";

import { writeWeightKg } from "@/services/healthService";
import { ArrowLeft, Camera, X } from "lucide-react";

import { C } from "@/shared/ui";
import { useAuthStore } from "@/store/authStore";
import { useBodyMetricsStore } from "@/store/bodyMetricsStore";
import { useRewardsStore } from "@/store/rewardsStore";
import { XP_REWARDS } from "@/features/rewards/gamification";
import { uploadProgressPhoto } from "@/services/progressPhotoService";
import { toDateKey } from "@/lib/date";

export default function CheckInScreen({ onBack }: { onBack: () => void }) {
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [chest, setChest] = useState("");
  const [arms, setArms] = useState("");
  const [legs, setLegs] = useState("");
  const [bodyFat, setBodyFat] = useState("");

  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [sidePhoto, setSidePhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);

  const user = useAuthStore((s) => s.user);
  const addBodyMetrics = useBodyMetricsStore((s) => s.add);
  const recordActivity = useRewardsStore((s) => s.recordActivity);
  const loading = useBodyMetricsStore((s) => s.loading);

  const today = toDateKey(new Date());

  const toNumber = (value: string) => {
    const parsed = Number(value);
    return value.trim() === "" || Number.isNaN(parsed) || parsed < 0
      ? undefined
      : parsed;
  };

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaveError(null);

    const parsedWeight = Number(weight);

    if (!user || !weight || Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      return;
    }

    // Photos are best-effort and must never block saving the numbers — a
    // failed upload (e.g. Storage not yet configured) shouldn't lose the
    // weight/measurements the user just entered.
    const [frontResult, sideResult, backResult] = await Promise.allSettled([
      frontPhoto
        ? uploadProgressPhoto({ uid: user.uid, date: today, type: "front", file: frontPhoto })
        : Promise.resolve(undefined),
      sidePhoto
        ? uploadProgressPhoto({ uid: user.uid, date: today, type: "side", file: sidePhoto })
        : Promise.resolve(undefined),
      backPhoto
        ? uploadProgressPhoto({ uid: user.uid, date: today, type: "back", file: backPhoto })
        : Promise.resolve(undefined),
    ]);

    const photoUploadFailed = [frontResult, sideResult, backResult].some(
      (r) => r.status === "rejected"
    );

    try {
      await addBodyMetrics(user.uid, {
        date: today,
        weightKg: parsedWeight,
        bodyFatPct: toNumber(bodyFat),
        waistCm: toNumber(waist),
        chestCm: toNumber(chest),
        armCm: toNumber(arms),
        legCm: toNumber(legs),
      });

      // Mirror weight to Apple Health (no-op off-device / if not granted).
      writeWeightKg(parsedWeight);

      // Progression: a check-in counts as daily activity.
      recordActivity({
        xp: XP_REWARDS.checkIn,
        checkIns: 1,
        streakDayXp: XP_REWARDS.streakDay,
      });

      if (photoUploadFailed) {
        // Metrics saved fine; only the photo(s) failed — let the user know
        // rather than silently dropping them.
        setSaveError(
          "Saved, but one or more photos couldn't upload. Check your connection and try again."
        );
        return;
      }

      onBack();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Couldn't save your check-in — please try again."
      );
    }
  };

  return (
    <div className="px-5 pt-4 pb-8">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-full flex items-center justify-center mb-5"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
        }}
      >
        <ArrowLeft size={18} color={C.fg} />
      </button>

      <h2 className="text-[22px] font-extrabold mb-1" style={{ color: C.fg }}>
        Weekly Check-in
      </h2>

      <p className="text-sm mb-6" style={{ color: C.fg3 }}>
        Track your body changes over time.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <MetricInput label="Weight" value={weight} onChange={setWeight} unit="kg" />
        <MetricInput label="Body Fat" value={bodyFat} onChange={setBodyFat} unit="%" />
        <MetricInput label="Waist" value={waist} onChange={setWaist} unit="cm" />
        <MetricInput label="Chest" value={chest} onChange={setChest} unit="cm" />
        <MetricInput label="Arms" value={arms} onChange={setArms} unit="cm" />
        <MetricInput label="Legs" value={legs} onChange={setLegs} unit="cm" />
      </div>

      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-3"
        style={{ color: C.fg2 }}
      >
        Progress Photos
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <PhotoInput label="Front" file={frontPhoto} onChange={setFrontPhoto} />
        <PhotoInput label="Side" file={sidePhoto} onChange={setSidePhoto} />
        <PhotoInput label="Back" file={backPhoto} onChange={setBackPhoto} />
      </div>

      <button
        onClick={handleSave}
        disabled={loading || !weight}
        className="w-full py-4 rounded-[20px] font-bold text-base card-lit"
        style={{
          background: C.accent,
          color: C.onAccent,
          opacity: loading || !weight ? 0.5 : 1,
        }}
      >
        {loading ? "Saving..." : "Save Check-in"}
      </button>

      {saveError && (
        <p
          className="text-[11px] text-center mt-3"
          style={{ color: C.amber }}
        >
          {saveError}
        </p>
      )}
    </div>
  );
}

function MetricInput({
  label,
  value,
  onChange,
  unit,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit: string;
}) {
  return (
    <div
      className="rounded-[20px] px-4 py-3 card-lit"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <p className="text-[11px] mb-2" style={{ color: C.fg3 }}>
        {label}
      </p>

      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onWheel={(e) => e.currentTarget.blur()}
          type="number"
          inputMode="decimal"
          className="flex-1 bg-transparent outline-none text-[22px] font-bold min-w-0"
          style={{ color: C.fg }}
        />

        <span className="text-sm" style={{ color: C.fg3 }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

function PhotoInput({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <label
      className="relative rounded-[20px] overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer card-lit"
      style={{
        background: C.card,
        border: `1px solid ${file ? C.accent : C.border}`,
        minHeight: 96,
      }}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {previewUrl ? (
        <>
          <img
            src={previewUrl}
            alt={`${label} progress photo`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0) 55%)",
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onChange(null);
            }}
            aria-label={`Remove ${label} photo`}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.55)" }}
          >
            <X size={12} color="#fff" />
          </button>
          <p
            className="relative text-xs font-bold mt-auto mb-2"
            style={{ color: "#fff" }}
          >
            {label}
          </p>
        </>
      ) : (
        <>
          <Camera size={18} color={C.fg3} />
          <p className="text-xs font-bold mt-2" style={{ color: C.fg }}>
            {label}
          </p>
          <p className="text-[11px] mt-1" style={{ color: C.fg3 }}>
            Upload
          </p>
        </>
      )}
    </label>
  );
}