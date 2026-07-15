# BulkOS Fitness App

React + TypeScript + Vite fitness app (Figma Make export). Firebase (auth + Firestore + storage), Zustand stores, shadcn/ui + Radix, Tailwind 4, Recharts.

Owner: Lukáš. Goal: premium-level fitness app (Strong, Hevy, RP Hypertrophy tier).

## Rules — read first

- NO big refactors. Keep the existing architecture.
- Do not move files, do not invent new structure.
- No `any`, no type assertions unless unavoidable, no mock data.
- Fix type mismatches with minimal-impact helper types (see structural typing pattern below).
- TypeScript strict mode; `npx tsc --noEmit` must stay clean (known pre-existing error: missing `@types/react-dom` in main.tsx — ignore it).

## Architecture

- `src/features/<domain>/{screens,components,utils}` — feature code
- `src/store/*` — Zustand stores (one per domain)
- `src/services/*` — Firebase access
- `src/data/exercises/*` — exercise database per muscle group (`ExerciseDefinition` with `activation` percentages)
- `src/types/*` — shared types
- `src/shared/ui.ts` — colors (`C`) and `Screen` type; `src/shared/components.tsx` — ProgressRing, Badge, SectionHeader

Known quirk: TWO different `WorkoutLog` types exist (`types/workout.ts` vs `store/workoutHistoryStore.ts`). Do NOT unify them. Utils that consume workouts define their own minimal structural input types instead (see `RecommendationWorkout` in `workoutRecommendation.ts`, `MuscleVolumeWorkout` in `muscleVolume.ts`).

## Completed features

Workout history, nutrition log, body metrics, hydration, progress screen, workout templates, and the Smart Coach:

- `features/workout/utils/workoutRecommendation.ts` — recommendation engine:
  - per-muscle recovery (baseline hours × session intensity from weighted sets via `activation`)
  - split scoring (push/pull/legs/upper/lower/fullBody) = readiness + weekly-volume balance + undertrained-muscle bonus − overlap-with-last-workout − generalist penalty
  - recovery day when readiness < 55% or 3+ consecutive training days; rapid weight loss (body metrics) lowers readiness
  - template matching by split classification, least-recently-used tie-break
  - `generateWorkoutTemplate(split)` fallback: builds workout from exercise library (familiar > compound > non-advanced), `isGenerated` flag
  - `getMuscleRecoveryOverview(workouts)` for the Progress screen
  - `getMuscleSetTargetOverview(workouts)` — RP-style weekly MEV/MAV per muscle (`MUSCLE_SET_TARGETS` constants), status `under`/`optimal`/`high`; feeds `undertrainedMuscles` into `WorkoutRecommendation` and nudges split scoring + reason text
- `features/dashboard/components/SmartCoachCard.tsx` — dashboard card (reason, readiness %, focus muscle chips, Start button → `selectTemplate`/`selectGenerated` + navigate to workout)
- `features/progress/components/MuscleRecoveryCard.tsx` — recovery % bars per muscle in Progress screen
- `features/progress/components/MuscleSetTargetCard.tsx` — weekly sets vs MEV/MAV bars per muscle in Progress screen, sorted under → high → optimal
- `store/workoutTemplateStore.ts` — has `selectGenerated(template)` (selects without persisting)
- `src/features/workout/utils/workoutRecommendation.test.ts` — Vitest unit tests (35+6 in muscleVolume.test.ts) for recovery math, split classification, MEV/MAV set-target status, template matching (incl. LRU tie-break), recovery-day trigger, deload detection and recovery detail. Run with `npm run test` (or `npm run test:watch`). Config in `vitest.config.ts` (separate from `vite.config.ts`, shares only the `@` alias).
- Deload detection: `detectDeload(workouts, muscleRecovery)` in `workoutRecommendation.ts` — 7-day weekly buckets, fires after 3+ loaded weeks (≥2 workouts/week) when weekly volume drops ≥15% at equal-or-higher frequency OR average recovery across trained muscles < 60%. Sets `isDeloadWeek` on `WorkoutRecommendation`, swaps the reason for deload advice (half sets, stay short of failure), SmartCoachCard shows an amber "Deload week" badge instead of readiness %.
- Recovery detail: `getMuscleRecoveryDetail(muscle, workouts)` — last 5 sessions that loaded the muscle (workout name, date, weighted sets/volume) + `hoursToFullRecovery` ETA (shares `sessionRecoveryHours` with the recovery math). `MuscleRecoveryCard` rows expand on tap (accordion, `workouts` prop) showing ETA + session list.
- Bodyweight volume: `getEffectiveSetWeight(equipment, setWeight, bodyweightKg)` in `features/workout/utils/setVolume.ts` — for `bodyweight` equipment the logged weight counts as *added* load on top of the latest body weight (Strong/Hevy convention); falls back to logged weight when body weight is unknown. Used at log time in `WorkoutScreen` (stored `volumeKg` + per-exercise volume; loads body metrics on mount) and in `getMuscleVolume(workouts, bodyweightKg?)` for the Muscle Load card (ProgressScreen passes `currentWeight`). Historical workouts logged before this keep their old `volumeKg`. Tests in `features/progress/utils/muscleVolume.test.ts`.
- Deload template adjustment: `applyDeloadToTemplate(template)` in `workoutRecommendation.ts` — returns a fresh copy (new id, "· Deload" name) with half the sets per exercise (min 1, keeps the earlier/heavier sets), sets reset to not-completed, rest +25%. On a deload week the Dashboard Start button starts this copy via `selectGenerated` (never mutates/persists the user's saved template) and its label shows "(deload)".
- Macro target recalibration: `getRecalibratedTargets(profile, currentWeightKg)` + `shouldSuggestTargetUpdate` (≥2 kg drift, `TARGET_UPDATE_WEIGHT_DRIFT_KG`) in `src/lib/nutrition.ts` (reuses `calculateMacroTargets`). `TargetUpdateCard` on the Dashboard appears when the latest check-in weight drifts ≥2 kg from `profile.weight`, previews new kcal/protein and on tap persists via `updateNutritionTargets(uid, weightKg, nutrition)` (userService, merges `profile.weight` so drift resets) then `authStore.refreshProfile()` (new action, re-fetches the user doc). Tests in `src/lib/nutrition.test.ts`.
- Bulk pace tracker: `getBulkPace(entries, goal)` in `src/lib/bulkPace.ts` — weekly weight trend from the oldest+newest check-ins in a 14-day window (needs ≥5-day span, else `insufficient_data`), compared to goal bands (% BW/week: bulk +0.25..+0.5, cut −1.0..−0.5, maintain ±0.25). Status is goal-relative ("too_fast" = faster than the pace *toward the goal*; gaining on a cut = "too_slow"). Suggests a daily kcal delta (7700 kcal/kg, rounded to 50) to land mid-band. `BulkPaceCard` on the Dashboard (hidden on insufficient data). Tests in `src/lib/bulkPace.test.ts`.

## Next candidates (agreed with owner)

Smart Coach roadmap complete. Next feature TBD with owner.

## Workflow

- Owner works on Mac (daytime) and PC (evenings); sync via GitHub (`origin` = github.com/lugerec/bulkos, private)
- Commit + push after every finished feature: `git add -A && git commit -m "feat: ..." && git push`
- Always `git pull` before starting work on either machine
- Verify with `npm run build` (vite) before committing
