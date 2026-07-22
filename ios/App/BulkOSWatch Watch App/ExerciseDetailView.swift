//
//  ExerciseDetailView.swift
//  BulkOSWatch Watch App
//
//  Set-by-set view for one exercise. Each row shows weight × reps and a big
//  tap target to complete it — completing a set fires haptics and the rest
//  timer (handled in WorkoutSession).
//

import SwiftUI

struct ExerciseDetailView: View {
    @EnvironmentObject var session: WorkoutSession
    let exerciseIndex: Int

    private var exercise: WorkoutExercise? {
        session.workout.exercises.indices.contains(exerciseIndex)
            ? session.workout.exercises[exerciseIndex]
            : nil
    }

    var body: some View {
        ScrollView {
            if let exercise {
                VStack(spacing: 8) {
                    if let target = exercise.targetReps {
                        HStack {
                            Text("Target \(target) reps")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(Theme.accent)
                            Spacer()
                        }
                    }

                    ForEach(Array(exercise.sets.enumerated()), id: \.element.id) { setIndex, set in
                        SetRow(
                            number: setIndex + 1,
                            set: set
                        ) {
                            session.toggleSet(
                                exerciseIndex: exerciseIndex,
                                setIndex: setIndex
                            )
                        }
                    }
                }
                .padding(.horizontal, 2)
                .navigationTitle(exercise.name)
            }
        }
    }
}

/// A single set row: number, weight × reps, and a complete toggle.
private struct SetRow: View {
    let number: Int
    let set: WorkoutSet
    let onToggle: () -> Void

    var body: some View {
        Button(action: onToggle) {
            HStack(spacing: 10) {
                Text("\(number)")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(Theme.fg3)
                    .frame(width: 18)

                Text("\(cleanWeight(set.weight)) kg × \(set.reps)")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(set.completed ? Theme.fg3 : Theme.fg)

                Spacer()

                Image(systemName: set.completed ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 22))
                    .foregroundStyle(set.completed ? Theme.accent : Theme.fg3)
            }
            .padding(12)
            .background(
                set.completed ? Theme.card2 : Theme.card,
                in: RoundedRectangle(cornerRadius: 14)
            )
        }
        .buttonStyle(.plain)
    }
}

/// "60" not "60.0", but "22.5" stays.
private func cleanWeight(_ w: Double) -> String {
    w.truncatingRemainder(dividingBy: 1) == 0
        ? String(Int(w))
        : String(format: "%.1f", w)
}

#Preview {
    NavigationStack {
        ExerciseDetailView(exerciseIndex: 0)
            .environmentObject(WorkoutSession())
    }
}
