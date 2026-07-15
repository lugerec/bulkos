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

## Known minor issues / follow-ups

- `progression.ts` `ProgressionSuggestion.reason` type includes `"maintain"` and `"deload"`, but `getProgressionSuggestion` never returns them (only `increase_reps` / `increase_weight`). There's no "repeat this session" state when a set fell short of `minReps`. Documented by `progression.test.ts`; changing it would alter behaviour, so left for owner sign-off.

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
- Plateau detection: `detectPlateaus(workouts)` in `features/workout/utils/plateauDetection.ts` — per exercise, best Epley est. 1RM per session (completed sets, weight > 0) over a 90-day window; flagged when the exercise has ≥4 sessions and none of the last 3 beat the earlier best. Returns `sessionsSinceBest` / `bestEst1RM` / `recentBestEst1RM`, sorted most-stuck first. `StallingLiftsCard` on the Progress screen (hidden when nothing stalls) lists them with a plateau-breaking tip. `suggestVariations(exerciseId, count=2)` (same file) offers alternatives for a stalling lift — same primary muscle, non-advanced, different equipment preferred, compounds before isolation — rendered as a "Try: …" line per stalled lift.
- Frequency adherence: `getFrequencyAdherence(workoutDates, targetPerWeek)` in `features/workout/utils/frequencyAdherence.ts` — first consumer of onboarding's `profile.trainingFrequency`. Counts distinct training *days* since Monday, `daysAvailable` (today excluded once trained), `onPace` (remaining fits into available days), plus a 4-week hit/miss history. `FrequencyCard` on the Dashboard (X/Y this week, status Target hit / On pace / Falling behind, 4 history dots).
- Weight-based water goal: `getWaterGoalLiters(weightKg, trainedToday)` in `src/lib/hydration.ts` — ~35 ml/kg, +0.5 L on training days, clamped 2–6 L, rounded to 0.1 L; falls back to the old fixed 3.5 L (`DEFAULT_WATER_GOAL_LITERS`) when weight is unknown. Dashboard hydration widget now uses it (latest check-in weight, else profile weight). Tests in `src/lib/hydration.test.ts`.
- Weekly report: `getWeeklyReport(workouts, weightEntries, targetTrainingDays)` in `features/progress/utils/weeklyReport.ts` — digest of the last completed Mon–Sun week: distinct training days vs target, total volume with delta vs the week before, first-to-last weight change from that week's check-ins (null with <2). `WeeklyReportCard` at the top of the Progress screen (hidden when that week had no training). Tests in `weeklyReport.test.ts`.
- CI: `.github/workflows/ci.yml` — GitHub Action on push/PR to main: Node 22, `npm ci`, `npm run test`, `npm run build`.
- Settings profile editing: `ProfileGoalsCard` (features/settings/components) — edits goal / training frequency / activity / goal weight after onboarding; Save recomputes macros via `calculateMacroTargets` and persists both in one write through the existing `updateUserOnboarding`, then `refreshProfile()`. Save button only appears when dirty; invalid goal weight blocks save.
- CSV export: `src/lib/exportCsv.ts` — `buildWorkoutsCsv` (one row per set: date, workout, exercise, set #, weight, reps, completed; chronological; proper quoting/escaping), `buildBodyMetricsCsv` (row per check-in, blanks for missing measurements), `downloadTextFile` (Blob + anchor). Settings "Export Data (CSV)" button downloads both files; the screen loads workouts + body metrics on mount. Tests in `exportCsv.test.ts`.
- Photo comparison: `PhotoComparisonCard` (features/progress/components) — progress-photo upload already existed via check-ins (`uploadProgressPhoto`, photo URLs on `BodyMetrics`); this adds before/after: two date selectors over all photo check-ins (defaults oldest vs newest), front/side/back toggle, weight under each photo and the kg delta between them. Shown only with ≥2 photo check-ins; rendered under the latest-photos grid on the Progress screen.
- Open Food Facts: `src/services/openFoodFactsService.ts` — `searchOpenFoodFacts(query)` (cgi/search.pl text search, no API key) with a pure `mapOffProductToFoodItem` mapper (per-100g FoodItem, `off-<barcode>` id, brand appended, null when name/barcode/kcal missing, failures degrade to []). FoodDatabaseScreen shows an "Online results" section under local foods (≥3 chars, 500 ms debounce, exact-name dedupe vs local). Logging works unchanged since `addFoodToMeal` denormalizes macros. Tests in `openFoodFactsService.test.ts`. NOTE: photo→macro AI estimation intentionally postponed to a future release (needs a backend proxy for the vision API key).
- Real analytics: `src/lib/analyticsScores.ts` — `getAnalyticsScores` replaces the hardcoded fake scores in `AnalyticsScreen` (App.tsx). Pace score (goal-labelled: Lean Bulk/Cut/Maintenance; 95 in-band, −100×%BW overshoot outside; null on insufficient data → "—" ring), Consistency (70% four-week hit rate + 30% current-week progress), Recovery (avg across muscles), Volume (optimal=1, high=0.7, under=sets/MEV; null with no data). The fake `calData` calorie chart is now real: `getDailyMacros(uid, date)` in logService (parallel across all meal types; `getDailyCalories` kept as the calories-only variant) fetched for the last 7 days; weekly average counts only days with logged food; target from `userDoc.nutrition.calories`. Tests in `analyticsScores.test.ts`.
- Analytics macro adherence + coach insight (previously fake): `getMacroAdherence(days, targets)` in analyticsScores.ts — avg P/C/F intake over logged days as % of targets (capped 100; null → section hidden). `getPaceInsight(pace, goal)` + `applyKcalDeltaToTargets(targets, delta)` in bulkPace.ts — plain-language trend summary; when off-pace the "Apply ±X kcal" button really persists new targets (calories shift, carbs absorb the delta at 4 kcal/g, protein/fat untouched) via `updateNutritionTargets` + `refreshProfile`, with an applied confirmation state. Insufficient data → message asking for 2+ check-ins ≥5 days apart, no button.
- Real grocery list: static `groceryData` (fake items/prices) replaced. `groceryService.ts` — Firestore CRUD on `users/{uid}/groceryItems` (get/add/setChecked/delete, defensive doc mapping). `getRecentFoodNames(uid, days)` in logService counts foods logged in the last N days; `buildGrocerySuggestions` in `src/lib/grocerySuggestions.ts` (case-insensitive dedupe, excludes current list, frequency-sorted, cap 8) feeds "From your recent meals" chips. Search box: ≥3 chars → debounced Open Food Facts results (real store products, "STORE" badge) + "Add custom" via Enter. Checkbox/delete persist to Firestore with optimistic UI. Prices intentionally dropped — no reliable public price source. Tests in `grocerySuggestions.test.ts`.

## Next candidates (agreed with owner)

1. Photo→macro estimation via vision AI (postponed by owner to a future app version; requires Cloud Function proxy for the API key)

## Workflow

- Owner works on Mac (daytime) and PC (evenings); sync via GitHub (`origin` = github.com/lugerec/bulkos, private)
- Commit + push after every finished feature: `git add -A && git commit -m "feat: ..." && git push`
- Always `git pull` before starting work on either machine
- Verify with `npm run build` (vite) before committing
