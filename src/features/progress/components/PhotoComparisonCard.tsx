import { useState } from "react";
import { GitCompareArrows } from "lucide-react";

import { C } from "@/shared/ui";
import { SectionHeader } from "@/shared/components";
import type { BodyMetrics } from "@/types/bodyMetrics";

type Props = {
  entries: BodyMetrics[];
};

type PhotoType = "front" | "side" | "back";

const PHOTO_TYPES: readonly PhotoType[] = ["front", "side", "back"];

function photoUrl(entry: BodyMetrics, type: PhotoType): string | undefined {
  if (type === "front") return entry.frontPhotoUrl;
  if (type === "side") return entry.sidePhotoUrl;

  return entry.backPhotoUrl;
}

function hasAnyPhoto(entry: BodyMetrics): boolean {
  return Boolean(
    entry.frontPhotoUrl || entry.sidePhotoUrl || entry.backPhotoUrl
  );
}

/**
 * Before/after comparison of progress photos: pick any two photo
 * check-ins, toggle front/side/back. Shown once at least two check-ins
 * have photos.
 */
export default function PhotoComparisonCard({ entries }: Props) {
  const photoEntries = entries
    .filter(hasAnyPhoto)
    .sort((a, b) => a.date.localeCompare(b.date));

  const [type, setType] = useState<PhotoType>("front");
  const [beforeId, setBeforeId] = useState<string | null>(null);
  const [afterId, setAfterId] = useState<string | null>(null);

  if (photoEntries.length < 2) return null;

  const before =
    photoEntries.find((entry) => entry.id === beforeId) ?? photoEntries[0];
  const after =
    photoEntries.find((entry) => entry.id === afterId) ??
    photoEntries[photoEntries.length - 1];

  const weightDelta =
    Math.round((after.weightKg - before.weightKg) * 10) / 10;

  const Side = ({
    entry,
    label,
    selectedId,
    onSelect,
  }: {
    entry: BodyMetrics;
    label: string;
    selectedId: string;
    onSelect: (id: string) => void;
  }) => {
    const url = photoUrl(entry, type);

    return (
      <div className="flex-1 min-w-0">
        <select
          value={selectedId}
          onChange={(event) => onSelect(event.target.value)}
          className="w-full mb-2 px-2 py-1.5 rounded-xl text-xs font-semibold outline-none"
          style={{
            background: C.card2,
            border: `1px solid ${C.border}`,
            color: C.fg,
          }}
        >
          {photoEntries.map((option) => (
            <option key={option.id} value={option.id}>
              {option.date}
            </option>
          ))}
        </select>

        <div
          className="rounded-[14px] overflow-hidden"
          style={{
            height: 220,
            background: C.card2,
            border: `1px solid ${C.border}`,
          }}
        >
          {url ? (
            <img
              src={url}
              alt={`${label} ${type}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-[11px]" style={{ color: C.fg3 }}>
                No {type} photo
              </p>
            </div>
          )}
        </div>

        <p
          className="text-xs font-semibold mt-1.5 text-center"
          style={{ color: C.fg2 }}
        >
          {entry.weightKg} kg
        </p>
      </div>
    );
  };

  return (
    <>
      <SectionHeader title="Photo Comparison" />

      <div
        className="rounded-[20px] p-4 mb-4"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitCompareArrows size={16} color={C.accent} />
            <span
              className="text-[11px] font-bold"
              style={{
                color: weightDelta >= 0 ? C.accent : C.blue,
              }}
            >
              {weightDelta > 0 ? "+" : ""}
              {weightDelta} kg between photos
            </span>
          </div>

          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: `1px solid ${C.border}` }}
          >
            {PHOTO_TYPES.map((option) => (
              <button
                key={option}
                onClick={() => setType(option)}
                className="px-2.5 py-1 text-[11px] font-semibold capitalize"
                style={{
                  background: type === option ? C.accent : "transparent",
                  color: type === option ? C.bg : C.fg3,
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Side
            entry={before}
            label="Before"
            selectedId={before.id}
            onSelect={setBeforeId}
          />
          <Side
            entry={after}
            label="After"
            selectedId={after.id}
            onSelect={setAfterId}
          />
        </div>
      </div>
    </>
  );
}
