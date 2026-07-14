import type {
    Equipment,
    ExerciseCategory,
    ExerciseDefinition,
    ExerciseDifficulty,
    MuscleGroup,
  } from "@/types/workout";
  
  export type ExerciseFilterOptions = {
    search: string;
    muscle: MuscleGroup | "all";
    equipment: Equipment | "all";
    category?: ExerciseCategory | "all";
    difficulty?: ExerciseDifficulty | "all";
  };
  
  export function filterExercises(
    exercises: ExerciseDefinition[],
    filters: ExerciseFilterOptions
  ) {
    const query = filters.search.trim().toLowerCase();
  
    return exercises.filter((exercise) => {
      const matchesSearch =
        !query ||
        exercise.name.toLowerCase().includes(query) ||
        exercise.aliases?.some((alias) => alias.toLowerCase().includes(query)) ||
        exercise.tags?.some((tag) => tag.toLowerCase().includes(query));
  
      const matchesMuscle =
        filters.muscle === "all" ||
        exercise.primaryMuscle === filters.muscle ||
        exercise.secondaryMuscles?.includes(filters.muscle);
  
      const matchesEquipment =
        filters.equipment === "all" || exercise.equipment === filters.equipment;
  
      const matchesCategory =
        !filters.category ||
        filters.category === "all" ||
        exercise.category === filters.category;
  
      const matchesDifficulty =
        !filters.difficulty ||
        filters.difficulty === "all" ||
        exercise.difficulty === filters.difficulty;
  
      return (
        matchesSearch &&
        matchesMuscle &&
        matchesEquipment &&
        matchesCategory &&
        matchesDifficulty
      );
    });
  }