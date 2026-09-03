import { ArrowLeft } from "lucide-react";

import { C } from "@/shared/ui";
import { useBodyMetricsStore } from "@/store/bodyMetricsStore";
import { resolvePhotoSrc } from "@/services/progressPhotoService";

export default function CheckInHistoryScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const entries = useBodyMetricsStore((s) => s.entries);

  // Newest first — entries load sorted by date ascending.
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

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
          Check-in History
        </h1>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm px-1" style={{ color: C.fg3 }}>
          No check-ins logged yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((entry) => {
            const photos = [
              entry.frontPhotoUrl,
              entry.sidePhotoUrl,
              entry.backPhotoUrl,
            ].filter((p): p is string => Boolean(p));

            return (
              <div
                key={entry.id}
                className="rounded-[20px] p-4 card-lit"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <p className="text-sm font-bold" style={{ color: C.fg }}>
                    {entry.date}
                  </p>
                  <p className="text-sm font-bold" style={{ color: C.accentInk }}>
                    {entry.weightKg} kg
                  </p>
                </div>

                {photos.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {photos.map((url, i) => (
                      <div
                        key={i}
                        className="rounded-[14px] overflow-hidden flex-1"
                        style={{ height: 90, background: C.card2 }}
                      >
                        <img
                          src={resolvePhotoSrc(url)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {entry.bodyFatPct != null && (
                    <Stat label="Body Fat" value={`${entry.bodyFatPct}%`} />
                  )}
                  {entry.waistCm != null && (
                    <Stat label="Waist" value={`${entry.waistCm} cm`} />
                  )}
                  {entry.chestCm != null && (
                    <Stat label="Chest" value={`${entry.chestCm} cm`} />
                  )}
                  {entry.armCm != null && (
                    <Stat label="Arms" value={`${entry.armCm} cm`} />
                  )}
                  {entry.legCm != null && (
                    <Stat label="Legs" value={`${entry.legCm} cm`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="px-2.5 py-1.5 rounded-lg"
      style={{ background: C.card2, border: `1px solid ${C.border}` }}
    >
      <span className="text-[10px]" style={{ color: C.fg3 }}>
        {label}:{" "}
      </span>
      <span className="text-[11px] font-bold" style={{ color: C.fg }}>
        {value}
      </span>
    </div>
  );
}
