import { CalendarRange } from "lucide-react";

import { C } from "@/shared/ui";
import { SectionHeader } from "@/shared/components";
import type { WeeklyReport } from "../utils/weeklyReport";

type Props = {
  report: WeeklyReport;
};

function signed(value: number, unit: string): string {
  return `${value > 0 ? "+" : ""}${value.toLocaleString()}${unit}`;
}

/**
 * Progress-screen digest of the last completed week. Hidden when the week
 * had no training at all (nothing worth reporting).
 */
export default function WeeklyReportCard({ report }: Props) {
  if (report.trainingDays === 0) return null;

  const hitTarget = report.trainingDays >= report.targetTrainingDays;

  return (
    <>
      <SectionHeader title="Last Week in Review" />

      <div
        className="rounded-[20px] p-4 mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <CalendarRange size={16} color={C.accent} />
          <span className="text-xs" style={{ color: C.fg2 }}>
            {report.weekStart} – {report.weekEnd}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <p
              className="text-lg font-extrabold"
              style={{ color: hitTarget ? C.accent : C.amber }}
            >
              {report.trainingDays}/{report.targetTrainingDays}
            </p>
            <p className="text-[10px]" style={{ color: C.fg3 }}>
              Training days
            </p>
          </div>

          <div>
            <p className="text-lg font-extrabold" style={{ color: C.fg }}>
              {report.volumeKg.toLocaleString()} kg
            </p>
            <p className="text-[10px]" style={{ color: C.fg3 }}>
              Volume ({signed(report.volumeDeltaKg, " kg")} vs prior)
            </p>
          </div>

          <div>
            <p className="text-lg font-extrabold" style={{ color: C.fg }}>
              {report.weightChangeKg === null
                ? "—"
                : signed(report.weightChangeKg, " kg")}
            </p>
            <p className="text-[10px]" style={{ color: C.fg3 }}>
              Body weight
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
