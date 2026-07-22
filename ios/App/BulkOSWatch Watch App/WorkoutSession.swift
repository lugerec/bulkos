//
//  WorkoutSession.swift
//  BulkOSWatch Watch App
//
//  Holds the live workout state across screens: which sets are done, and the
//  rest timer. Marked @MainActor so UI updates are safe.
//

import Foundation
import SwiftUI
import WatchKit

@MainActor
final class WorkoutSession: ObservableObject {
    @Published var workout: Workout
    @Published var isActive = false

    /// Seconds left on the rest timer, or nil when not resting.
    @Published var restRemaining: Int?

    private var restTimer: Timer?
    private let defaultRest = 90

    init(workout: Workout = .sample) {
        self.workout = workout
    }

    func start() {
        isActive = true
    }

    /// Toggle a set's completed state. Completing a set starts the rest timer
    /// and gives a little haptic confirmation.
    func toggleSet(exerciseIndex: Int, setIndex: Int) {
        guard workout.exercises.indices.contains(exerciseIndex),
              workout.exercises[exerciseIndex].sets.indices.contains(setIndex)
        else { return }

        let nowCompleted = !workout.exercises[exerciseIndex].sets[setIndex].completed
        workout.exercises[exerciseIndex].sets[setIndex].completed = nowCompleted

        if nowCompleted {
            WKInterfaceDevice.current().play(.success)
            startRest()
        }
    }

    // MARK: - Rest timer

    func startRest(seconds: Int? = nil) {
        restRemaining = seconds ?? defaultRest
        restTimer?.invalidate()
        restTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) {
            [weak self] _ in
            Task { @MainActor in self?.tickRest() }
        }
    }

    func adjustRest(by delta: Int) {
        guard let current = restRemaining else { return }
        restRemaining = max(0, current + delta)
    }

    func stopRest() {
        restTimer?.invalidate()
        restTimer = nil
        restRemaining = nil
    }

    private func tickRest() {
        guard let current = restRemaining else { return }
        if current <= 1 {
            WKInterfaceDevice.current().play(.notification)
            stopRest()
        } else {
            restRemaining = current - 1
        }
    }
}
