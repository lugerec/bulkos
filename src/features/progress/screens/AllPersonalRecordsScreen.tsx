import { ArrowLeft, Trophy } from "lucide-react";

import { C } from "@/shared/ui";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";
import { getAllStrengthPRs } from "@/features/progress/utils/personalRecords";

export default function AllPersonalRecordsScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const workouts = useWorkoutHistoryStore((s) => s.workouts);
  const prs = getAllStrengthPRs(workouts);

  return (
    <div className="px-5 pb-10" style={{ paddingTop: 8 }}>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-extrabold" style={{ color: C.fg }}>
          Personal Records
        </h1>
      </div>

      {prs.length === 0 ? (
        <p className="text-sm px-1" style={{ color: C.fg3 }}>
          No personal records yet — complete a set to start setting them.
        </p>
      ) : (
        <div
          className="rounded-[20px] overflow-hidden card-lit"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          {prs.map(({ exerciseId, lift, pr, date }, i) => (
            <div
              key={exerciseId}
              className="flex items-center gap-3 px-4 py-3.5"
              style={{
                borderBottom: i < prs.length - 1 ? `1px solid ${C.border}` : "none",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: C.accentDim }}
              >
                <Trophy size={16} color={C.accent} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate" style={{ color: C.fg }}>
                  {lift}
                </p>
                <p className="text-[11px]" style={{ color: C.fg3 }}>
                  {date}
                </p>
              </div>

              <p className="text-sm font-bold flex-shrink-0" style={{ color: C.accentInk }}>
                {pr}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
