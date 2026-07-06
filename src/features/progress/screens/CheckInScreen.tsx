import { useAuthStore } from "@/store/authStore";
import { useBodyMetricsStore } from "@/store/bodyMetricsStore";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { C } from "@/shared/ui";

export default function CheckInScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [chest, setChest] = useState("");
  const [arms, setArms] = useState("");
  const [legs, setLegs] = useState("");
  const [bodyFat, setBodyFat] = useState("");

  const user = useAuthStore((s) => s.user);
    const addBodyMetrics = useBodyMetricsStore((s) => s.add);
    const loading = useBodyMetricsStore((s) => s.loading);

    const today = new Date().toISOString().slice(0, 10);

    const toNumber = (value: string) => {
        const parsed = Number(value);
        return value.trim() === "" || Number.isNaN(parsed) || parsed < 0
          ? undefined
          : parsed;
      };

    const handleSave = async () => {
        const parsedWeight = Number(weight);

        if (!user || !weight || Number.isNaN(parsedWeight) || parsedWeight <= 0) return;

    await addBodyMetrics(user.uid, {
        date: today,
        weightKg: parsedWeight,
        bodyFatPct: toNumber(bodyFat),
        waistCm: toNumber(waist),
        chestCm: toNumber(chest),
        armCm: toNumber(arms),
        legCm: toNumber(legs),
    });

    onBack();
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

      <h2
        className="text-2xl font-extrabold mb-1"
        style={{ color: C.fg }}
      >
        Weekly Check-in
      </h2>

      <p
        className="text-sm mb-6"
        style={{ color: C.fg3 }}
      >
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
            <button
        onClick={handleSave}
        disabled={loading || !weight}
        className="w-full py-4 rounded-[18px] font-bold text-base"
        style={{
            background: C.accent,
            color: C.bg,
            opacity: loading || !weight ? 0.5 : 1,
        }}
        >
        {loading ? "Saving..." : "Save Check-in"}
        </button>
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
        className="rounded-[18px] px-4 py-3"
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
        className="flex-1 bg-transparent outline-none text-xl font-bold"
        style={{ color: C.fg }}
            />
  
          <span className="text-sm" style={{ color: C.fg3 }}>
            {unit}
          </span>
        </div>
      </div>
    );
  }