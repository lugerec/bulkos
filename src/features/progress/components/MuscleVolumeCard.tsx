import { C } from "@/shared/ui";
import type { MuscleVolumeItem } from "@/features/progress/utils/muscleVolume";

type Props = {
  data: MuscleVolumeItem[];
  previousData?: MuscleVolumeItem[];
};

function formatMuscleName(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export default function MuscleVolumeCard({
  data,
  previousData = [],
}: Props) {
  const visibleData = data.slice(0, 6);
  const maxVolume = visibleData[0]?.volume ?? 0;

  const previousByMuscle = new Map(
    previousData.map((item) => [item.muscle, item.volume])
  );

  return (
    <div
      className="rounded-[20px] p-4 mb-4"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
      }}
    >
      <div className="mb-4">
        <p className="text-sm font-bold" style={{ color: C.fg }}>
          Muscle Load
        </p>

        <p className="text-[11px] mt-1" style={{ color: C.fg3 }}>
          Estimated weighted volume this week
        </p>
      </div>

      {visibleData.length === 0 ? (
        <div
          className="flex items-center justify-center text-center"
          style={{ minHeight: 120 }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: C.fg }}>
              No muscle load data yet
            </p>

            <p className="text-xs mt-1" style={{ color: C.fg3 }}>
              Complete a weighted workout to populate this section.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleData.map((item) => {
            const percentage =
              maxVolume > 0 ? (item.volume / maxVolume) * 100 : 0;

            const previousVolume =
              previousByMuscle.get(item.muscle) ?? 0;

            const difference = item.volume - previousVolume;

            const changeLabel =
              previousVolume > 0
                ? `${difference >= 0 ? "+" : ""}${Math.round(
                    (difference / previousVolume) * 100
                  )}%`
                : item.volume > 0
                ? "New"
                : "0%";

            return (
              <div key={item.muscle}>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: C.fg }}
                  >
                    {formatMuscleName(item.muscle)}
                  </span>

                  <div className="text-right">
                    <span
                      className="text-[11px] font-bold block"
                      style={{ color: C.accent }}
                    >
                      {item.volume.toLocaleString()} kg
                    </span>

                    <span
                      className="text-[11px]"
                      style={{
                        color:
                          difference > 0
                            ? C.accent
                            : difference < 0
                            ? C.red
                            : C.fg3,
                      }}
                    >
                      {changeLabel} vs last week
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    height: 6,
                    background: C.border,
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: C.accent,
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}