import { chestExercises } from "./chest";
import { backExercises } from "./back";
import { shouldersExercises } from "./shoulders";

import { quadsExercises } from "./quads";
import { hamstringsExercises } from "./hamstrings";
import { glutesExercises } from "./glutes";
import { calvesExercises } from "./calves";

import { bicepsExercises } from "./biceps";
import { tricepsExercises } from "./triceps";
import { absExercises } from "./abs";

import { cardioExercises } from "./cardio";

export const exerciseDefinitions = [
  ...chestExercises,
  ...backExercises,
  ...shouldersExercises,

  ...quadsExercises,
  ...hamstringsExercises,
  ...glutesExercises,
  ...calvesExercises,

  ...bicepsExercises,
  ...tricepsExercises,
  ...absExercises,

  ...cardioExercises,
];