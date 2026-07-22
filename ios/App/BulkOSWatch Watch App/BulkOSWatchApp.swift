//
//  BulkOSWatchApp.swift
//  BulkOSWatch Watch App
//

import SwiftUI

@main
struct BulkOSWatch_Watch_AppApp: App {
    @StateObject private var session = WorkoutSession()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(session)
                .tint(Theme.accent)
        }
    }
}
