import { useState } from "react";
import { ArrowRight, Dumbbell } from "lucide-react";
import { C } from "../../shared/ui";
import { useAuthStore } from "../../store/authStore";
import type {
  ActivityLevel,
  Goal,
  Sex,
  TrainingFrequency,
  UserProfile,
} from "../../types/profile";
import { calculateMacroTargets } from "../../lib/nutrition";
import { updateUserOnboarding } from "../../services/userService";

export default function OnboardingScreen() {
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState("Lukáš");
  const [age, setAge] = useState(28);
  const [sex, setSex] = useState<Sex>("male");
  const [height, setHeight] = useState(187);
  const [weight, setWeight] = useState(94);
  const [goalWeight, setGoalWeight] = useState(100);
  const [goal, setGoal] = useState<Goal>("bulk");
  const [activity, setActivity] = useState<ActivityLevel>("high");
  const [trainingFrequency, setTrainingFrequency] =
    useState<TrainingFrequency>(5);
  const [saving, setSaving] = useState(false);

  const profile: UserProfile = {
    name,
    age,
    sex,
    height,
    weight,
    goalWeight,
    goal,
    activity,
    trainingFrequency,
  };

  const targets = calculateMacroTargets(profile);

  const finish = async () => {
    if (!user) return;

    setSaving(true);
    await updateUserOnboarding(user.uid, profile, targets);
    window.location.reload();
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-5 py-8"
      style={{ background: "#050505", fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="w-full max-w-[430px] rounded-[32px] p-6"
        style={{ background: C.bg, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: C.accentDim }}
          >
            <Dumbbell size={24} color={C.accent} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: C.fg }}>
              Setup BulkOS
            </h1>
            <p className="text-sm" style={{ color: C.fg2 }}>
              Your lean bulk targets
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Input label="Name" value={name} onChange={setName} />
          <NumberInput label="Age" value={age} onChange={setAge} />
          <NumberInput label="Height (cm)" value={height} onChange={setHeight} />
          <NumberInput label="Weight (kg)" value={weight} onChange={setWeight} />
          <NumberInput
            label="Goal weight (kg)"
            value={goalWeight}
            onChange={setGoalWeight}
          />

          <SelectRow
            label="Sex"
            value={sex}
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]}
            onChange={(v) => setSex(v as Sex)}
          />

          <SelectRow
            label="Goal"
            value={goal}
            options={[
              { label: "Bulk", value: "bulk" },
              { label: "Cut", value: "cut" },
              { label: "Maintain", value: "maintain" },
            ]}
            onChange={(v) => setGoal(v as Goal)}
          />

          <SelectRow
            label="Activity"
            value={activity}
            options={[
              { label: "Low", value: "low" },
              { label: "Moderate", value: "moderate" },
              { label: "High", value: "high" },
            ]}
            onChange={(v) => setActivity(v as ActivityLevel)}
          />

          <SelectRow
            label="Training days"
            value={String(trainingFrequency)}
            options={[
              { label: "3", value: "3" },
              { label: "4", value: "4" },
              { label: "5", value: "5" },
              { label: "6", value: "6" },
            ]}
            onChange={(v) =>
              setTrainingFrequency(Number(v) as TrainingFrequency)
            }
          />
        </div>

        <div
          className="rounded-[22px] p-4 mt-5 mb-5"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ color: C.fg2 }}
          >
            Calculated targets
          </p>

          <div className="grid grid-cols-4 gap-2">
            <Target label="Kcal" value={targets.calories} color={C.amber} />
            <Target label="Protein" value={targets.protein} color={C.accent} />
            <Target label="Carbs" value={targets.carbs} color={C.blue} />
            <Target label="Fat" value={targets.fat} color={C.purple} />
          </div>
        </div>

        <button
          onClick={finish}
          disabled={saving}
          className="w-full py-4 rounded-[18px] font-bold flex items-center justify-center gap-2"
          style={{
            background: C.accent,
            color: C.bg,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving..." : "Finish setup"}
          {!saving && <ArrowRight size={18} />}
        </button>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold" style={{ color: C.fg2 }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 rounded-2xl outline-none text-sm"
        style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold" style={{ color: C.fg2 }}>
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-4 py-3 rounded-2xl outline-none text-sm"
        style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
      />
    </label>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold" style={{ color: C.fg2 }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 rounded-2xl outline-none text-sm"
        style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Target({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className="text-lg font-extrabold" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px]" style={{ color: C.fg3 }}>
        {label}
      </p>
    </div>
  );
}