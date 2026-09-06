import { useState } from "react";
import { GitCompareArrows } from "lucide-react";

import { C } from "@/shared/ui";
import { SectionHeader } from "@/shared/components";
import type { BodyMetrics } from "@/types/bodyMetrics";
import { usePhotoSrc } from "@/features/progress/hooks/usePhotoSrc";
import { t } from "@/i18n";

type Props = {
  entries: BodyMetrics[];
};

type PhotoType = "front" | "side" | "back";

const PHOTO_TYPES: readonly PhotoType[] = ["front", "side", "back"];

/** Slovak has no neat lowercase-in-a-sentence form here, so label separately. */
function photoTypeLabel(type: PhotoType): string {
  if (type === "front") return t("Front");
  if (type === "side") return t("Side");

  return t("Back photo");
}

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
 * Hoisted out of the parent on purpose: defined inline it was a brand new
 * component type on every render, remounting both sides (and re-resolving
 * their photo src) on every state change.
 */
function Side({
  entry,
  label,
  type,
  options,
  selectedId,
  onSelect,
}: {
  entry: BodyMetrics;
  label: string;
  type: PhotoType;
  options: BodyMetrics[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const src = usePhotoSrc(photoUrl(entry, type));
  const typeLabel = photoTypeLabel(type);

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
        {options.map((option) => (
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
        {src ? (
          <img
            src={src}
            alt={`${label} — ${typeLabel}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-[11px]" style={{ color: C.fg3 }}>
              {t("No {type} photo", { type: typeLabel })}
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

  return (
    <>
      <SectionHeader title={t("Photo Comparison")} />

      <div
        className="rounded-[20px] p-4 mb-4 card-lit"
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
              {t("{delta} kg between photos", {
                delta: `${weightDelta > 0 ? "+" : ""}${weightDelta}`,
              })}
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
                className="px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  background: type === option ? C.accent : "transparent",
                  color: type === option ? C.bg : C.fg3,
                }}
              >
                {photoTypeLabel(option)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Side
            entry={before}
            label={t("Before")}
            type={type}
            options={photoEntries}
            selectedId={before.id}
            onSelect={setBeforeId}
          />
          <Side
            entry={after}
            label={t("After")}
            type={type}
            options={photoEntries}
            selectedId={after.id}
            onSelect={setAfterId}
          />
        </div>
      </div>
    </>
  );
}
