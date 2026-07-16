import { useEffect, useState } from "react";
import { Dumbbell, ImageOff, Play, Pause } from "lucide-react";

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

/** Milliseconds each phase is shown when the two-phase animation plays. */
const PHASE_MS = 900;

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
 * True when we can build a two-phase animation — i.e. there's a start and a
 * finish still (and no real gif, which would animate on its own).
 */
export function canAnimate(sources: MediaSource[]): boolean {
  const hasStart = sources.some((s) => s.label === "Start");
  const hasFinish = sources.some((s) => s.label === "Finish");
  const hasGif = sources.some((s) => s.kind === "gif");

  return hasStart && hasFinish && !hasGif;
}

/**
 * Visual for an exercise. When start+finish stills exist it can play a
 * simple two-phase animation (alternating the images) to convey the motion,
 * since freely-licensed exercise gifs essentially don't exist. Falls back to
 * a labelled toggle, or a graceful placeholder when media is missing.
 */
export default function ExerciseMedia({ media, name, primaryMuscle }: Props) {
  const sources = collectSources(media);
  const animatable = canAnimate(sources);

  const [activeIndex, setActiveIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [playing, setPlaying] = useState(false);

  // Indexes of the start/finish frames, for the animation loop.
  const startIndex = sources.findIndex((s) => s.label === "Start");
  const finishIndex = sources.findIndex((s) => s.label === "Finish");

  useEffect(() => {
    if (!playing || !animatable) return;

    const t = setInterval(() => {
      setActiveIndex((current) =>
        current === startIndex ? finishIndex : startIndex
      );
    }, PHASE_MS);

    return () => clearInterval(t);
  }, [playing, animatable, startIndex, finishIndex]);

  const active = sources[activeIndex];
  const showPlaceholder = !active || failed[activeIndex];

  const togglePlay = () => {
    setPlaying((p) => {
      const next = !p;
      if (next) setActiveIndex(startIndex);
      return next;
    });
  };

  return (
    <div>
      <div
        className="relative rounded-[20px] overflow-hidden flex items-center justify-center"
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

        {animatable && !showPlaceholder && (
          <button
            onClick={togglePlay}
            aria-label={playing ? "Pause animation" : "Play animation"}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: C.accent, color: C.bg }}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
        )}

        {animatable && playing && (
          <div
            className="absolute bottom-3 left-3 px-2 py-1 rounded-full text-[10px] font-bold"
            style={{ background: "rgba(0,0,0,0.5)", color: C.fg }}
          >
            {active?.label}
          </div>
        )}
      </div>

      {sources.length > 1 && !playing && (
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

      {animatable && (
        <p className="text-[10px] mt-2 text-center" style={{ color: C.fg3 }}>
          {playing
            ? "Playing start → finish"
            : "Tap play to see the movement"}
        </p>
      )}
    </div>
  );
}
