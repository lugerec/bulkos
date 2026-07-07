export type BodyMetrics = {
  id: string;
  date: string;

  weightKg: number;
  bodyFatPct?: number;

  waistCm?: number;
  chestCm?: number;
  armCm?: number;
  legCm?: number;

  frontPhotoUrl?: string;
  sidePhotoUrl?: string;
  backPhotoUrl?: string;

  createdAt?: unknown;
};