import { C } from "@/shared/ui";
import type { MuscleActivation } from "@/types/workout";

type Props = {
  activation?: MuscleActivation;
};

export default function MuscleActivationList({ activation }: Props) {
  if (!activation) return null;

  const entries = Object.entries(activation)
    .filter(([, value]) => typeof value === "number" && value > 0)
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([muscle, value]) => (
        <div key={muscle}>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-semibold" style={{ color: C.fg }}>
              {muscle}
            </span>

            <span className="text-xs font-bold" style={{ color: C.accentInk }}>
              {value}%
            </span>
          </div>

          <div
            style={{
              height: 6,
              background: C.border,
              borderRadius: 99,
            }}
          >
            <div
              style={{
                height: "100%",
                transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)", width: `${Math.min(value, 100)}%`,
                background: C.accent,
                borderRadius: 99,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}