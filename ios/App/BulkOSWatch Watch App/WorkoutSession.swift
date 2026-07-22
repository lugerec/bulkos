//
//  WorkoutSession.swift
//  BulkOSWatch Watch App
//
//  Holds the live workout state across screens: which sets are done, and the
//  rest timer. Marked @MainActor so UI updates are safe.
//

import Combine
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
    private var cancellables = Set<AnyCancellable>()

    /// True while showing the built-in sample instead of a real session
    /// pushed from the phone.
    @Published private(set) var isSample = true

    init(workout: Workout = .sample) {
        self.workout = workout

        // Adopt any workout the phone pushes over.
        WatchBridge.shared.$receivedWorkout
            .compactMap { $0 }
            .receive(on: DispatchQueue.main)
            .sink { [weak self] incoming in
                guard let self else { return }
                self.workout = incoming
                self.isSample = false
                self.isActive = false
                self.stopRest()
            }
            .store(in: &cancellables)

        WatchBridge.shared.activate()
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

        // Keep the phone in sync (no-op if it isn't paired/reachable).
        WatchBridge.shared.sendSetUpdate(
            exerciseIndex: exerciseIndex,
            setIndex: setIndex,
            completed: nowCompleted
        )
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
