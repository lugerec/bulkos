//
//  WatchBridgePlugin.swift
//  App
//
//  Capacitor plugin exposing the phone↔watch link to JavaScript:
//
//    WatchBridge.sendWorkout({ workout })  – push the active session to the watch
//    WatchBridge.isPaired()                – is a watch paired & app installed?
//    addListener('setUpdate', ...)         – set completed/uncompleted on the watch
//
//  Swift-only plugin (Capacitor 6+ CAPBridgedPlugin), so no .m file is needed.
//

import Capacitor
import Foundation
import WatchConnectivity

@objc(WatchBridgePlugin)
public class WatchBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WatchBridgePlugin"
    public let jsName = "WatchBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "sendWorkout", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isPaired", returnType: CAPPluginReturnPromise),
    ]

    private let link = PhoneWatchLink()

    override public func load() {
        link.onSetUpdate = { [weak self] exerciseIndex, setIndex, completed in
            self?.notifyListeners(
                "setUpdate",
                data: [
                    "exerciseIndex": exerciseIndex,
                    "setIndex": setIndex,
                    "completed": completed,
                ]
            )
        }
        link.activate()
    }

    /// Push the active workout (already-serialized JSON string) to the watch.
    @objc func sendWorkout(_ call: CAPPluginCall) {
        guard let json = call.getString("workout") else {
            call.reject("Missing 'workout' JSON string")
            return
        }

        let delivered = link.sendWorkout(json: json)
        call.resolve(["delivered": delivered])
    }

    @objc func isPaired(_ call: CAPPluginCall) {
        call.resolve([
            "supported": WCSession.isSupported(),
            "paired": link.isPaired,
            "appInstalled": link.isWatchAppInstalled,
        ])
    }
}

/// Thin WCSession wrapper for the phone side.
final class PhoneWatchLink: NSObject {
    /// (exerciseIndex, setIndex, completed)
    var onSetUpdate: ((Int, Int, Bool) -> Void)?

    var isPaired: Bool {
        WCSession.isSupported() ? WCSession.default.isPaired : false
    }

    var isWatchAppInstalled: Bool {
        WCSession.isSupported() ? WCSession.default.isWatchAppInstalled : false
    }

    func activate() {
        guard WCSession.isSupported() else { return }
        let session = WCSession.default
        session.delegate = self
        session.activate()
    }

    /// Returns true if the payload was handed to WatchConnectivity.
    @discardableResult
    func sendWorkout(json: String) -> Bool {
        guard WCSession.isSupported() else { return false }
        let session = WCSession.default
        guard session.activationState == .activated else { return false }

        let payload: [String: Any] = ["type": "workout", "workout": json]

        // Application context always holds the latest session, so the watch
        // picks it up whenever it wakes; a direct message makes it instant
        // when the watch app is already in the foreground.
        try? session.updateApplicationContext(payload)

        if session.isReachable {
            session.sendMessage(payload, replyHandler: nil, errorHandler: nil)
        }

        return true
    }

    private func handle(payload: [String: Any]) {
        guard
            payload["type"] as? String == "setUpdate",
            let exerciseIndex = payload["exerciseIndex"] as? Int,
            let setIndex = payload["setIndex"] as? Int,
            let completed = payload["completed"] as? Bool
        else { return }

        DispatchQueue.main.async {
            self.onSetUpdate?(exerciseIndex, setIndex, completed)
        }
    }
}

extension PhoneWatchLink: WCSessionDelegate {
    func session(
        _ session: WCSession,
        activationDidCompleteWith activationState: WCSessionActivationState,
        error: Error?
    ) {}

    // Required on iOS — reactivate so a re-paired watch keeps working.
    func sessionDidBecomeInactive(_ session: WCSession) {}

    func sessionDidDeactivate(_ session: WCSession) {
        WCSession.default.activate()
    }

    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        handle(payload: message)
    }

    func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any]) {
        handle(payload: userInfo)
    }
}
