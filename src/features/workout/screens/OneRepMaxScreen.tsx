import { useState } from "react";
import { Calculator } from "lucide-react";

import { C } from "@/shared/ui";
import {
  estimateOneRepMaxDetailed,
  getRepTargets,
} from "@/lib/oneRepMax";
import { SubScreenHeader } from "@/shared/components";

/**
 * Standalone 1RM calculator: enter a weight × reps set, get an averaged
 * one-rep-max estimate plus a percent-of-1RM training table.
 */
export default function OneRepMaxScreen({ onBack }: { onBack: () => void }) {
  const [weight, setWeight] = useState("100");
  const [reps, setReps] = useState("5");

  const parsedWeight = Number(weight);
  const parsedReps = Number(reps);

  const estimate = estimateOneRepMaxDetailed(parsedWeight, parsedReps);
  const repTargets = estimate ? getRepTargets(estimate.average) : [];
  const highReps = parsedReps > 10;

  const Field = ({
    label,
    value,
    onChange,
    unit,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    unit: string;
  }) => (
    <div className="flex-1">
      <label className="text-[11px] font-semibold" style={{ color: C.fg3 }}>
        {label}
      </label>
      <div
        className="flex items-center gap-1 mt-1 px-3 py-2.5 rounded-xl"
        style={{ background: C.card2, border: `1px solid ${C.border}` }}
      >
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1 bg-transparent outline-none text-lg font-bold w-full"
          style={{ color: C.fg }}
        />
        <span className="text-xs" style={{ color: C.fg3 }}>
          {unit}
        </span>
      </div>
    </div>
  );

  return (
    <div className="pb-8">
      <SubScreenHeader title="1RM Calculator" onBack={onBack} />

      <div className="px-5">
        <div
          className="rounded-[20px] p-4 mb-5"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex gap-3 mb-4">
            <Field label="Weight" value={weight} onChange={setWeight} unit="kg" />
            <Field label="Reps" value={reps} onChange={setReps} unit="reps" />
          </div>

          {estimate ? (
            <div
              className="rounded-[14px] p-4 text-center"
              style={{ background: C.accentDim }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calculator size={14} color={C.accent} />
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: C.accent }}
                >
                  Estimated 1RM
                </span>
              </div>
              <p className="text-3xl font-extrabold" style={{ color: C.fg }}>
                {estimate.average}
                <span className="text-base font-medium ml-1" style={{ color: C.fg2 }}>
                  kg
                </span>
              </p>
              <p className="text-[10px] mt-1" style={{ color: C.fg2 }}>
                Epley {estimate.epley} · Brzycki {estimate.brzycki} · Lombardi{" "}
                {estimate.lombardi}
              </p>
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: C.fg3 }}>
              Enter a weight and rep count to estimate your 1RM.
            </p>
          )}

          {highReps && (
            <p className="text-[11px] mt-3 text-center" style={{ color: C.amber }}>
              Estimates are most accurate at 10 reps or fewer.
            </p>
          )}
        </div>

        {repTargets.length > 0 && (
          <div
            className="rounded-[20px] overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div
              className="flex items-center px-4 py-3"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <span className="text-[10px] uppercase tracking-wide flex-1" style={{ color: C.fg3 }}>
                Reps
              </span>
              <span className="text-[10px] uppercase tracking-wide flex-1 text-center" style={{ color: C.fg3 }}>
                % of 1RM
              </span>
              <span className="text-[10px] uppercase tracking-wide flex-1 text-right" style={{ color: C.fg3 }}>
                Weight
              </span>
            </div>

            {repTargets.map((target, index) => (
              <div
                key={target.reps}
                className="flex items-center px-4 py-3"
                style={{
                  borderBottom:
                    index < repTargets.length - 1 ? `1px solid ${C.border}` : "none",
                }}
              >
                <span className="text-sm font-semibold flex-1" style={{ color: C.fg }}>
                  {target.reps}
                </span>
                <span className="text-sm flex-1 text-center" style={{ color: C.fg2 }}>
                  {target.percent}%
                </span>
                <span className="text-sm font-bold flex-1 text-right" style={{ color: C.accent }}>
                  {target.weight} kg
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
