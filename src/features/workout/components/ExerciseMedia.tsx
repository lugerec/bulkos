import { useState } from "react";
import { Dumbbell, ImageOff } from "lucide-react";

import { C } from "@/shared/ui";
import type { ExerciseMedia as ExerciseMediaData } from "@/types/workout";

type Props = {
  media: ExerciseMediaData | undefined;
  name: string;
  primaryMuscle: string;
};

export type MediaSource = {
  kind: "gif" | "image";
  src: string;
  label: string;
};

/**
 * Collects the usable visual sources from an exercise's media, preferring
 * an animated gif, then start/finish position stills, then a thumbnail.
 */
export function collectSources(
  media: ExerciseMediaData | undefined
): MediaSource[] {
  if (!media) return [];

  const sources: MediaSource[] = [];

  if (media.gif) sources.push({ kind: "gif", src: media.gif, label: "Motion" });
  if (media.start)
    sources.push({ kind: "image", src: media.start, label: "Start" });
  if (media.finish)
    sources.push({ kind: "image", src: media.finish, label: "Finish" });
  if (sources.length === 0 && media.thumbnail)
    sources.push({ kind: "image", src: media.thumbnail, label: "Preview" });

  return sources;
}

/**
 * Visual for an exercise: shows a gif or position stills when available,
 * with a labelled toggle when there's more than one, and a graceful
 * placeholder when there's no media or an image fails to load.
 */
export default function ExerciseMedia({ media, name, primaryMuscle }: Props) {
  const sources = collectSources(media);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  const active = sources[activeIndex];
  const showPlaceholder = !active || failed[activeIndex];

  return (
    <div>
      <div
        className="rounded-[20px] overflow-hidden flex items-center justify-center"
        style={{
          aspectRatio: "4 / 3",
          background: C.card2,
          border: `1px solid ${C.border}`,
        }}
      >
        {showPlaceholder ? (
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            {active ? (
              <ImageOff size={28} color={C.fg3} />
            ) : (
              <Dumbbell size={28} color={C.fg3} />
            )}
            <p className="text-xs font-medium" style={{ color: C.fg2 }}>
              {active ? "Image unavailable" : "No demo yet"}
            </p>
            <p className="text-[10px] capitalize" style={{ color: C.fg3 }}>
              {primaryMuscle}
            </p>
          </div>
        ) : (
          <img
            src={active.src}
            alt={`${name} — ${active.label}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() =>
              setFailed((prev) => ({ ...prev, [activeIndex]: true }))
            }
          />
        )}
      </div>

      {sources.length > 1 && (
        <div className="flex gap-2 mt-2">
          {sources.map((source, index) => (
            <button
              key={source.label}
              onClick={() => setActiveIndex(index)}
              className="flex-1 py-1.5 rounded-[14px] text-[11px] font-semibold"
              style={{
                background: index === activeIndex ? C.accentDim : C.card2,
                border: `1px solid ${
                  index === activeIndex ? C.accent : C.border
                }`,
                color: index === activeIndex ? C.accent : C.fg2,
              }}
            >
              {source.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
