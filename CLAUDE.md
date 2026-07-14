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
  - split scoring (push/pull/legs/upper/lower/fullBody) = readiness + weekly-volume balance − overlap-with-last-workout − generalist penalty
  - recovery day when readiness < 55% or 3+ consecutive training days; rapid weight loss (body metrics) lowers readiness
  - template matching by split classification, least-recently-used tie-break
  - `generateWorkoutTemplate(split)` fallback: builds workout from exercise library (familiar > compound > non-advanced), `isGenerated` flag
  - `getMuscleRecoveryOverview(workouts)` for the Progress screen
- `features/dashboard/components/SmartCoachCard.tsx` — dashboard card (reason, readiness %, focus muscle chips, Start button → `selectTemplate`/`selectGenerated` + navigate to workout)
- `features/progress/components/MuscleRecoveryCard.tsx` — recovery % bars per muscle in Progress screen
- `store/workoutTemplateStore.ts` — has `selectGenerated(template)` (selects without persisting)

## Next candidates (agreed with owner)

1. Weekly set targets per muscle (RP-style MEV/MAV), surface undertrained muscles, feed into recommendation
2. Unit tests (Vitest) for recovery math, split classification, template matching
3. Polish: recovery detail, deload detection

## Workflow

- Owner works on Mac (daytime) and PC (evenings); sync via GitHub (`origin` = github.com/lugerec/bulkos, private)
- Commit + push after every finished feature: `git add -A && git commit -m "feat: ..." && git push`
- Always `git pull` before starting work on either machine
- Verify with `npm run build` (vite) before committing
