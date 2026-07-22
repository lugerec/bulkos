//
//  RestTimerView.swift
//  BulkOSWatch Watch App
//
//  Floating rest-timer bar shown while resting between sets. Big countdown,
//  ±15s buttons, and a skip. Haptic fires on completion (in WorkoutSession).
//

import SwiftUI

struct RestTimerView: View {
    @EnvironmentObject var session: WorkoutSession

    var body: some View {
        VStack {
            Spacer()

            VStack(spacing: 8) {
                Text("REST")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(Theme.onAccent.opacity(0.6))

                Text(formatted(session.restRemaining ?? 0))
                    .font(.system(size: 30, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.onAccent)
                    .monospacedDigit()

                HStack(spacing: 6) {
                    RestButton(label: "−15") { session.adjustRest(by: -15) }
                    RestButton(label: "+15") { session.adjustRest(by: 15) }
                    RestButton(label: "Skip") { session.stopRest() }
                }
            }
            .padding(.vertical, 10)
            .padding(.horizontal, 8)
            .frame(maxWidth: .infinity)
            .background(Theme.accent, in: RoundedRectangle(cornerRadius: 18))
            .padding(.horizontal, 4)
        }
    }

    private func formatted(_ seconds: Int) -> String {
        let m = seconds / 60
        let s = seconds % 60
        return String(format: "%d:%02d", m, s)
    }
}

private struct RestButton: View {
    let label: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(Theme.onAccent)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 4)
        }
        .buttonStyle(.plain)
        .background(
            Theme.onAccent.opacity(0.12),
            in: RoundedRectangle(cornerRadius: 10)
        )
    }
}

#Preview {
    RestTimerView()
        .environmentObject({
            let s = WorkoutSession()
            s.startRest(seconds: 90)
            return s
        }())
}
