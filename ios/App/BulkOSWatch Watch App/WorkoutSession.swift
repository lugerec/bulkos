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

        // Mirror sets the user toggles on the phone.
        WatchBridge.shared.setUpdates
            .receive(on: DispatchQueue.main)
            .sink { [weak self] exerciseIndex, setIndex, completed in
                self?.applyRemoteSetUpdate(
                    exerciseIndex: exerciseIndex,
                    setIndex: setIndex,
                    completed: completed
                )
            }
            .store(in: &cancellables)

        // Mirror weight/reps the user edits on the phone.
        WatchBridge.shared.setValueUpdates
            .receive(on: DispatchQueue.main)
            .sink { [weak self] exerciseIndex, setIndex, weight, reps in
                self?.applyRemoteSetValue(
                    exerciseIndex: exerciseIndex,
                    setIndex: setIndex,
                    weight: weight,
                    reps: reps
                )
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

    /// Apply a set change that originated on the phone. Unlike `toggleSet`, it
    /// sets the exact state, never echoes back (avoids a sync loop), and does
    /// not fire the rest timer or haptic — those belong to the phone side.
    func applyRemoteSetUpdate(exerciseIndex: Int, setIndex: Int, completed: Bool) {
        guard workout.exercises.indices.contains(exerciseIndex),
              workout.exercises[exerciseIndex].sets.indices.contains(setIndex)
        else { return }

        workout.exercises[exerciseIndex].sets[setIndex].completed = completed
    }

    /// Edit a set's weight/reps on the watch and mirror it to the phone.
    func updateSet(exerciseIndex: Int, setIndex: Int, weight: Double, reps: Int) {
        guard workout.exercises.indices.contains(exerciseIndex),
              workout.exercises[exerciseIndex].sets.indices.contains(setIndex)
        else { return }

        let clampedWeight = max(0, weight)
        let clampedReps = max(0, reps)

        workout.exercises[exerciseIndex].sets[setIndex].weight = clampedWeight
        workout.exercises[exerciseIndex].sets[setIndex].reps = clampedReps

        WatchBridge.shared.sendSetValueUpdate(
            exerciseIndex: exerciseIndex,
            setIndex: setIndex,
            weight: clampedWeight,
            reps: clampedReps
        )
    }

    /// Apply a weight/reps edit that originated on the phone. Sets the exact
    /// values and never echoes back, to avoid a sync loop.
    func applyRemoteSetValue(exerciseIndex: Int, setIndex: Int, weight: Double, reps: Int) {
        guard workout.exercises.indices.contains(exerciseIndex),
              workout.exercises[exerciseIndex].sets.indices.contains(setIndex)
        else { return }

        workout.exercises[exerciseIndex].sets[setIndex].weight = weight
        workout.exercises[exerciseIndex].sets[setIndex].reps = reps
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
