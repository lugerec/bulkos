import { useState } from "react";
import { Dumbbell } from "lucide-react";

import { C } from "@/shared/ui";
import type { ExerciseDefinition } from "@/types/workout";
import { getExerciseThumbnail } from "@/features/workout/utils/exerciseMedia";

type Props = {
  exercise: Pick<ExerciseDefinition, "id" | "media">;
  size?: number;
};

/**
 * Small square exercise thumbnail for list rows. Falls back to a dumbbell
 * icon when there's no image or it fails to load, so rows always look intact.
 */
export default function ExerciseThumb({ exercise, size = 44 }: Props) {
  const src = getExerciseThumbnail(exercise as ExerciseDefinition);
  const [failed, setFailed] = useState(false);

  const showImage = src && !failed;

  return (
    <div
      className="rounded-[14px] overflow-hidden flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: showImage ? "#FFFFFF" : C.card2,
        border: `1px solid ${C.border}`,
      }}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          className="w-full h-full object-contain p-0.5"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <Dumbbell size={size * 0.4} color={C.fg3} />
      )}
    </div>
  );
}
