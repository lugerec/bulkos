import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dumbbell,
  Flame,
  Target,
} from "lucide-react";

import { C } from "@/shared/ui";
import { useAuthStore } from "@/store/authStore";
import type {
  ActivityLevel,
  Goal,
  Sex,
  TrainingFrequency,
  UserProfile,
} from "@/types/profile";
import { calculateMacroTargets } from "@/lib/nutrition";
import { updateUserOnboarding } from "@/services/userService";

const TOTAL_STEPS = 8;

export default function OnboardingScreen() {
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("Lukáš");
  const [age, setAge] = useState(28);
  const [sex, setSex] = useState<Sex>("male");
  const [height, setHeight] = useState(187);
  const [weight, setWeight] = useState(94);
  const [goalWeight, setGoalWeight] = useState(100);
  const [goal, setGoal] = useState<Goal>("bulk");
  const [activity, setActivity] = useState<ActivityLevel>("high");
  const [trainingFrequency, setTrainingFrequency] = useState<TrainingFrequency>(5);
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

  const targets = useMemo(() => calculateMacroTargets(profile), [profile]);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const isLastStep = step === TOTAL_STEPS - 1;

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

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
        className="relative w-full max-w-[430px] min-h-[720px] rounded-[36px] p-6 flex flex-col"
        style={{ background: C.bg, border: `1px solid ${C.border}` }}
      >
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={back}
              disabled={step === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: step === 0 ? "transparent" : C.card,
                border: step === 0 ? "1px solid transparent" : `1px solid ${C.border}`,
                opacity: step === 0 ? 0.25 : 1,
              }}
            >
              <ArrowLeft size={18} color={C.fg} />
            </button>

            <div className="text-xs font-bold" style={{ color: C.fg3 }}>
              {step + 1}/{TOTAL_STEPS}
            </div>
          </div>

          <div style={{ height: 5, background: C.border, borderRadius: 99 }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: C.accent,
                borderRadius: 99,
                transition: "width 0.25s ease",
              }}
            />
          </div>
        </div>

        <div className="flex-1">
          {step === 0 && (
            <IntroStep name={name} setName={setName} sex={sex} setSex={setSex} />
          )}

          {step === 1 && (
            <ChoiceStep
              eyebrow="Goal"
              title="What are we building?"
              subtitle="Pick the phase. This decides your calorie direction."
              value={goal}
              onChange={(v) => setGoal(v as Goal)}
              options={[
                { value: "bulk", title: "Lean bulk", description: "Gain muscle with controlled fat gain." },
                { value: "cut", title: "Cut", description: "Drop fat while preserving performance." },
                { value: "maintain", title: "Maintain", description: "Stay around the same weight and improve habits." },
              ]}
            />
          )}

          {step === 2 && (
            <NumberStep
              eyebrow="Age"
              title="How old are you?"
              subtitle="Used for baseline calorie calculation."
              value={age}
              setValue={setAge}
              unit="years"
              min={14}
              max={80}
            />
          )}

          {step === 3 && (
            <NumberStep
              eyebrow="Height"
              title="How tall are you?"
              subtitle="Height helps estimate your daily expenditure."
              value={height}
              setValue={setHeight}
              unit="cm"
              min={120}
              max={230}
            />
          )}

          {step === 4 && (
            <NumberStep
              eyebrow="Current weight"
              title="Where are we starting?"
              subtitle="This is your baseline for targets and progress tracking."
              value={weight}
              setValue={setWeight}
              unit="kg"
              min={40}
              max={180}
            />
          )}

          {step === 5 && (
            <NumberStep
              eyebrow="Target weight"
              title="Where are we going?"
              subtitle="Be realistic. Aggressive targets usually create worse adherence."
              value={goalWeight}
              setValue={setGoalWeight}
              unit="kg"
              min={40}
              max={180}
            />
          )}

          {step === 6 && (
            <ChoiceStep
              eyebrow="Activity"
              title="How active are you?"
              subtitle="Include work, steps, sport and general movement."
              value={activity}
              onChange={(v) => setActivity(v as ActivityLevel)}
              options={[
                { value: "low", title: "Low", description: "Desk job, low steps, mostly gym only." },
                { value: "moderate", title: "Moderate", description: "Regular movement, 7–10k steps, training." },
                { value: "high", title: "High", description: "Very active lifestyle, sport, high output." },
              ]}
            />
          )}

          {step === 7 && (
            <SummaryStep
              trainingFrequency={trainingFrequency}
              setTrainingFrequency={setTrainingFrequency}
              targets={targets}
              saving={saving}
            />
          )}
        </div>

        <div className="pt-5">
          {isLastStep ? (
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
              {saving ? "Saving..." : "Start using BulkOS"}
              {!saving && <ArrowRight size={18} />}
            </button>
          ) : (
            <button
              onClick={next}
              className="w-full py-4 rounded-[18px] font-bold flex items-center justify-center gap-2"
              style={{ background: C.accent, color: C.bg }}
            >
              Continue
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function IntroStep({
  name,
  setName,
  sex,
  setSex,
}: {
  name: string;
  setName: (v: string) => void;
  sex: Sex;
  setSex: (v: Sex) => void;
}) {
  return (
    <div>
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: C.accentDim }}
      >
        <Dumbbell size={32} color={C.accent} />
      </div>

      <p className="text-sm font-bold mb-2" style={{ color: C.accent }}>
        Welcome
      </p>

      <h1 className="text-4xl font-extrabold leading-tight mb-3" style={{ color: C.fg }}>
        Let's build your operating system.
      </h1>

      <p className="text-base leading-relaxed mb-8" style={{ color: C.fg2 }}>
        BulkOS will calculate your starting targets and turn your training, food and progress into one system.
      </p>

      <label className="flex flex-col gap-2 mb-4">
        <span className="text-xs font-semibold" style={{ color: C.fg2 }}>
          Name
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-4 rounded-2xl outline-none text-base"
          style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Male", value: "male" },
          { label: "Female", value: "female" },
        ].map((option) => {
          const active = sex === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setSex(option.value as Sex)}
              className="py-4 rounded-2xl font-bold"
              style={{
                background: active ? C.accent : C.card,
                color: active ? C.bg : C.fg2,
                border: `1px solid ${active ? C.accent : C.border}`,
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChoiceStep({
  eyebrow,
  title,
  subtitle,
  value,
  options,
  onChange,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  value: string;
  options: { value: string; title: string; description: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-bold mb-2" style={{ color: C.accent }}>
        {eyebrow}
      </p>

      <h2 className="text-4xl font-extrabold leading-tight mb-3" style={{ color: C.fg }}>
        {title}
      </h2>

      <p className="text-base leading-relaxed mb-8" style={{ color: C.fg2 }}>
        {subtitle}
      </p>

      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className="text-left rounded-[22px] p-4 flex gap-4 items-start"
              style={{
                background: active ? C.accentDim : C.card,
                border: `1px solid ${active ? "rgba(163,230,53,0.45)" : C.border}`,
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: active ? C.accent : C.card2,
                  border: `1px solid ${active ? C.accent : C.border}`,
                }}
              >
                {active && <Check size={15} color={C.bg} strokeWidth={3} />}
              </div>

              <div>
                <p className="text-base font-bold mb-1" style={{ color: C.fg }}>
                  {option.title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: C.fg2 }}>
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NumberStep({
  eyebrow,
  title,
  subtitle,
  value,
  setValue,
  unit,
  min,
  max,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  value: number;
  setValue: (v: number) => void;
  unit: string;
  min: number;
  max: number;
}) {
  const decrease = () => setValue(Math.max(min, value - 1));
  const increase = () => setValue(Math.min(max, value + 1));

  return (
    <div>
      <p className="text-sm font-bold mb-2" style={{ color: C.accent }}>
        {eyebrow}
      </p>

      <h2 className="text-4xl font-extrabold leading-tight mb-3" style={{ color: C.fg }}>
        {title}
      </h2>

      <p className="text-base leading-relaxed mb-10" style={{ color: C.fg2 }}>
        {subtitle}
      </p>

      <div
        className="rounded-[32px] p-6 text-center"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between gap-5">
          <button
            onClick={decrease}
            className="w-14 h-14 rounded-full text-3xl font-bold"
            style={{ background: C.card2, color: C.fg }}
          >
            −
          </button>

          <div>
            <p className="text-6xl font-extrabold leading-none" style={{ color: C.fg }}>
              {value}
            </p>
            <p className="text-sm mt-2" style={{ color: C.fg3 }}>
              {unit}
            </p>
          </div>

          <button
            onClick={increase}
            className="w-14 h-14 rounded-full text-3xl font-bold"
            style={{ background: C.accent, color: C.bg }}
          >
            +
          </button>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full mt-8"
        />
      </div>
    </div>
  );
}

function SummaryStep({
  trainingFrequency,
  setTrainingFrequency,
  targets,
  saving,
}: {
  trainingFrequency: TrainingFrequency;
  setTrainingFrequency: (v: TrainingFrequency) => void;
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  saving: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-bold mb-2" style={{ color: C.accent }}>
        Plan ready
      </p>

      <h2 className="text-4xl font-extrabold leading-tight mb-3" style={{ color: C.fg }}>
        Your starting targets are ready.
      </h2>

      <p className="text-base leading-relaxed mb-6" style={{ color: C.fg2 }}>
        These are not permanent. BulkOS should adjust them from your weekly trend, not your ego.
      </p>

      <div className="mb-5">
        <p className="text-xs font-semibold mb-2" style={{ color: C.fg2 }}>
          Training days per week
        </p>

        <div className="grid grid-cols-4 gap-2">
          {[3, 4, 5, 6].map((days) => {
            const active = trainingFrequency === days;
            return (
              <button
                key={days}
                onClick={() => setTrainingFrequency(days as TrainingFrequency)}
                className="py-3 rounded-2xl font-bold"
                style={{
                  background: active ? C.accent : C.card,
                  color: active ? C.bg : C.fg2,
                  border: `1px solid ${active ? C.accent : C.border}`,
                }}
              >
                {days}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="rounded-[26px] p-5"
        style={{
          background: "linear-gradient(135deg, rgba(163,230,53,0.08), rgba(96,165,250,0.06))",
          border: "1px solid rgba(163,230,53,0.2)",
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: C.accentDim }}
          >
            <Flame size={21} color={C.accent} />
          </div>

          <div>
            <p className="text-sm font-bold" style={{ color: C.fg }}>
              Daily targets
            </p>
            <p className="text-xs" style={{ color: C.fg3 }}>
              Start here. Adjust after 7–14 days.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Macro label="Calories" value={targets.calories} unit="kcal" color={C.amber} />
          <Macro label="Protein" value={targets.protein} unit="g" color={C.accent} />
          <Macro label="Carbs" value={targets.carbs} unit="g" color={C.blue} />
          <Macro label="Fat" value={targets.fat} unit="g" color={C.purple} />
        </div>
      </div>

      {saving && (
        <p className="text-center text-sm mt-4" style={{ color: C.fg3 }}>
          Saving your profile...
        </p>
      )}
    </div>
  );
}

function Macro({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "rgba(10,10,11,0.35)", border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Target size={14} color={color} />
        <p className="text-xs font-semibold" style={{ color: C.fg2 }}>
          {label}
        </p>
      </div>
      <p className="text-2xl font-extrabold" style={{ color }}>
        {value}
        <span className="text-xs ml-1" style={{ color: C.fg3 }}>
          {unit}
        </span>
      </p>
    </div>
  );
}