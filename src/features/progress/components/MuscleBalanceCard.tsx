import { Scale } from "lucide-react";

import { C } from "@/shared/ui";
import { SectionHeader } from "@/shared/components";
import type {
  BalanceStatus,
  MuscleBalance,
} from "../utils/muscleBalance";

type Props = {
  balances: MuscleBalance[];
};

function statusColor(status: BalanceStatus): string {
  if (status === "imbalanced") return C.red;
  if (status === "mild") return C.amber;

  return C.accent;
}

function statusLabel(status: BalanceStatus): string {
  if (status === "imbalanced") return "Imbalanced";
  if (status === "mild") return "Slightly off";

  return "Balanced";
}

/**
 * Progress-screen card showing antagonist / push-pull balance from weekly
 * sets, with a split bar per pairing and a nudge toward the weaker side.
 * Hidden until at least one pairing has volume.
 */
export default function MuscleBalanceCard({ balances }: Props) {
  if (balances.length === 0) return null;

  return (
    <>
      <SectionHeader title="Muscle Balance" />

      <div
        className="rounded-[22px] p-4 mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Scale size={16} color={C.accent} />
          <span className="text-sm font-semibold" style={{ color: C.fg }}>
            Antagonist set ratios
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {balances.map((balance) => {
            const color = statusColor(balance.status);
            const total = balance.leftSets + balance.rightSets;
            const leftPercent =
              total > 0 ? (balance.leftSets / total) * 100 : 50;

            return (
              <div key={balance.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium" style={{ color: C.fg }}>
                    {balance.label}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color }}
                  >
                    {statusLabel(balance.status)}
                  </span>
                </div>

                <div
                  className="flex overflow-hidden"
                  style={{ height: 6, borderRadius: 99, background: C.border }}
                >
                  <div
                    style={{
                      width: `${leftPercent}%`,
                      background: color,
                      opacity: 0.9,
                    }}
                  />
                  <div
                    style={{
                      width: `${100 - leftPercent}%`,
                      background: color,
                      opacity: 0.35,
                    }}
                  />
                </div>

                <div className="flex justify-between mt-1">
                  <span className="text-[10px]" style={{ color: C.fg3 }}>
                    {balance.leftLabel} {balance.leftSets}
                  </span>
                  <span className="text-[10px]" style={{ color: C.fg3 }}>
                    {balance.rightSets} {balance.rightLabel}
                  </span>
                </div>

                {balance.weakerSide && (
                  <p className="text-[10px] mt-1" style={{ color }}>
                    Add volume to {balance.weakerSide} to even this out.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[10px] mt-4" style={{ color: C.fg3 }}>
          Based on this week's weighted sets. Aim for roughly even antagonist
          volume to support posture and joint health.
        </p>
      </div>
    </>
  );
}
