//
//  WatchBridge.swift
//  BulkOSWatch Watch App
//
//  WatchConnectivity link to the phone:
//   • receives the active workout (JSON) pushed from the iPhone app
//   • sends completed-set updates back so the phone stays in sync
//
//  Delegate callbacks arrive off the main thread, so everything that touches
//  published state hops to the main actor.
//

import Combine
import Foundation
import WatchConnectivity

final class WatchBridge: NSObject, ObservableObject {
    static let shared = WatchBridge()

    /// Last workout pushed from the phone, if any.
    @Published private(set) var receivedWorkout: Workout?
    /// True once the phone is reachable at least once — used for UI hints.
    @Published private(set) var isReachable = false

    /// Set updates pushed from the phone: (exerciseIndex, setIndex, completed).
    let setUpdates = PassthroughSubject<(Int, Int, Bool), Never>()
    /// Weight/reps edits pushed from the phone: (exerciseIndex, setIndex, weight, reps).
    let setValueUpdates = PassthroughSubject<(Int, Int, Double, Int), Never>()

    private override init() {
        super.init()
    }

    func activate() {
        guard WCSession.isSupported() else { return }
        let session = WCSession.default
        session.delegate = self
        session.activate()
    }

    /// Tell the phone a set was completed (or un-completed).
    func sendSetUpdate(exerciseIndex: Int, setIndex: Int, completed: Bool) {
        guard WCSession.isSupported() else { return }
        let session = WCSession.default
        guard session.activationState == .activated else { return }

        let payload: [String: Any] = [
            "type": "setUpdate",
            "exerciseIndex": exerciseIndex,
            "setIndex": setIndex,
            "completed": completed,
        ]

        if session.isReachable {
            session.sendMessage(payload, replyHandler: nil, errorHandler: nil)
        } else {
            // Phone asleep / out of range — queue it so it lands later.
            session.transferUserInfo(payload)
        }
    }

    /// Tell the phone a set's weight/reps changed.
    func sendSetValueUpdate(exerciseIndex: Int, setIndex: Int, weight: Double, reps: Int) {
        guard WCSession.isSupported() else { return }
        let session = WCSession.default
        guard session.activationState == .activated else { return }

        let payload: [String: Any] = [
            "type": "setValueUpdate",
            "exerciseIndex": exerciseIndex,
            "setIndex": setIndex,
            "weight": weight,
            "reps": reps,
        ]

        if session.isReachable {
            session.sendMessage(payload, replyHandler: nil, errorHandler: nil)
        } else {
            session.transferUserInfo(payload)
        }
    }

    // MARK: - Decoding

    private func handle(payload: [String: Any]) {
        guard let type = payload["type"] as? String else { return }

        switch type {
        case "workout":
            guard
                let json = payload["workout"] as? String,
                let data = json.data(using: .utf8),
                let workout = try? JSONDecoder().decode(Workout.self, from: data)
            else { return }

            Task { @MainActor in
                self.receivedWorkout = workout
            }

        case "setUpdate":
            guard
                let exerciseIndex = payload["exerciseIndex"] as? Int,
                let setIndex = payload["setIndex"] as? Int,
                let completed = payload["completed"] as? Bool
            else { return }

            self.setUpdates.send((exerciseIndex, setIndex, completed))

        case "setValueUpdate":
            guard
                let exerciseIndex = payload["exerciseIndex"] as? Int,
                let setIndex = payload["setIndex"] as? Int
            else { return }

            let weight = (payload["weight"] as? Double)
                ?? Double(payload["weight"] as? Int ?? 0)
            let reps = (payload["reps"] as? Int)
                ?? Int(payload["reps"] as? Double ?? 0)

            self.setValueUpdates.send((exerciseIndex, setIndex, weight, reps))

        default:
            break
        }
    }
}

extension WatchBridge: WCSessionDelegate {
    func session(
        _ session: WCSession,
        activationDidCompleteWith activationState: WCSessionActivationState,
        error: Error?
    ) {
        Task { @MainActor in
            self.isReachable = session.isReachable
        }

        // The phone may have set a context before we activated.
        handle(payload: session.receivedApplicationContext)
    }

    func sessionReachabilityDidChange(_ session: WCSession) {
        Task { @MainActor in
            self.isReachable = session.isReachable
        }
    }

    func session(
        _ session: WCSession,
        didReceiveApplicationContext applicationContext: [String: Any]
    ) {
        handle(payload: applicationContext)
    }

    func session(
        _ session: WCSession,
        didReceiveMessage message: [String: Any]
    ) {
        handle(payload: message)
    }

    func session(
        _ session: WCSession,
        didReceiveUserInfo userInfo: [String: Any]
    ) {
        handle(payload: userInfo)
    }
}
