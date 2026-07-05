export function getSuggestedWeight(
    previousWeight: number,
    previousReps: number,
    targetReps: number
  ) {
    // zvládol všetky opakovania
    if (previousReps >= targetReps) {
      return previousWeight + 2.5;
    }
  
    // chýbalo len 1 opakovanie
    if (previousReps === targetReps - 1) {
      return previousWeight;
    }
  
    // veľký fail
    return previousWeight;
  }