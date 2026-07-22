//
//  WorkoutModel.swift
//  BulkOSWatch Watch App
//
//  Mirrors the app's workout shape (template → exercises → sets) so a session
//  handed over from the phone later maps cleanly. For now it's populated with
//  sample data so the whole flow is testable on-device without the bridge.
//

import Foundation

/// A single set: target reps + weight, and whether it's been completed.
struct WorkoutSet: Identifiable {
    let id = UUID()
    var reps: Int
    var weight: Double
    var completed: Bool = false
}

/// One exercise with its sets and an optional target rep range for display.
struct WorkoutExercise: Identifiable {
    let id = UUID()
    var name: String
    var targetReps: String?
    var sets: [WorkoutSet]

    var completedSets: Int { sets.filter { $0.completed }.count }
    var totalSets: Int { sets.count }
    var isDone: Bool { completedSets == totalSets && totalSets > 0 }
}

/// A full session: a name and its exercises.
struct Workout: Identifiable {
    let id = UUID()
    var name: String
    var exercises: [WorkoutExercise]

    var totalSets: Int { exercises.reduce(0) { $0 + $1.totalSets } }
    var completedSets: Int { exercises.reduce(0) { $0 + $1.completedSets } }
    var progress: Double {
        totalSets == 0 ? 0 : Double(completedSets) / Double(totalSets)
    }
}

extension Workout {
    /// Sample session used until the phone bridge is wired up.
    static let sample = Workout(
        name: "Push Day",
        exercises: [
            WorkoutExercise(
                name: "Bench Press",
                targetReps: "6–8",
                sets: [
                    WorkoutSet(reps: 8, weight: 60),
                    WorkoutSet(reps: 8, weight: 60),
                    WorkoutSet(reps: 6, weight: 65),
                    WorkoutSet(reps: 6, weight: 65),
                ]
            ),
            WorkoutExercise(
                name: "Overhead Press",
                targetReps: "8–10",
                sets: [
                    WorkoutSet(reps: 10, weight: 35),
                    WorkoutSet(reps: 10, weight: 35),
                    WorkoutSet(reps: 8, weight: 40),
                ]
            ),
            WorkoutExercise(
                name: "Incline Dumbbell Press",
                targetReps: "10–12",
                sets: [
                    WorkoutSet(reps: 12, weight: 22),
                    WorkoutSet(reps: 12, weight: 22),
                    WorkoutSet(reps: 10, weight: 24),
                ]
            ),
        ]
    )
}
