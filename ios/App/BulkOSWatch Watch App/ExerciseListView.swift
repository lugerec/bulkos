//
//  ExerciseListView.swift
//  BulkOSWatch Watch App
//
//  The active workout: a scrollable list of exercises with per-exercise set
//  progress. Tapping one opens its set-by-set screen.
//

import SwiftUI

struct ExerciseListView: View {
    @EnvironmentObject var session: WorkoutSession

    var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                // Overall progress header.
                HStack {
                    Text(session.workout.name)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(Theme.fg)
                    Spacer()
                    Text("\(session.workout.completedSets)/\(session.workout.totalSets)")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(Theme.accent)
                }

                ForEach(Array(session.workout.exercises.enumerated()), id: \.element.id) { index, exercise in
                    NavigationLink {
                        ExerciseDetailView(exerciseIndex: index)
                    } label: {
                        ExerciseRow(exercise: exercise)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 2)
        }
        .navigationTitle("Workout")
    }
}

/// One row in the exercise list: name, set progress, done tick.
private struct ExerciseRow: View {
    let exercise: WorkoutExercise

    var body: some View {
        HStack(spacing: 10) {
            VStack(alignment: .leading, spacing: 2) {
                Text(exercise.name)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Theme.fg)
                    .lineLimit(1)
                Text("\(exercise.completedSets)/\(exercise.totalSets) sets")
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.fg3)
            }

            Spacer()

            if exercise.isDone {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(Theme.accent)
            }
        }
        .padding(12)
        .background(Theme.card, in: RoundedRectangle(cornerRadius: 14))
    }
}

// Needs a navigation container — wrap the list in the app.
#Preview {
    NavigationStack {
        ExerciseListView()
            .environmentObject({
                let s = WorkoutSession()
                s.start()
                return s
            }())
    }
}
