//
//  ContentView.swift  → RootView
//  BulkOSWatch Watch App
//
//  Entry screen: preview the session, then Start. Once started, shows the
//  exercise list. A rest-timer overlay floats above everything while resting.
//

import SwiftUI

struct RootView: View {
    @EnvironmentObject var session: WorkoutSession

    var body: some View {
        ZStack {
            if session.isActive {
                NavigationStack {
                    ExerciseListView()
                }
            } else {
                PreviewView()
            }

            // Rest timer floats over the workout when active.
            if session.restRemaining != nil {
                RestTimerView()
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .animation(.easeInOut(duration: 0.25), value: session.restRemaining)
    }
}

/// Pre-start preview: workout name, set count, big Start button.
struct PreviewView: View {
    @EnvironmentObject var session: WorkoutSession

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 10) {
                Text("TODAY")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundStyle(Theme.accent)

                Text(session.workout.name)
                    .font(.system(size: 22, weight: .bold))
                    .foregroundStyle(Theme.fg)

                Text("\(session.workout.exercises.count) exercises · \(session.workout.totalSets) sets")
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.fg2)

                Button {
                    session.start()
                } label: {
                    Text("Start Workout")
                        .font(.system(size: 16, weight: .bold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 6)
                }
                .buttonStyle(.borderedProminent)
                .tint(Theme.accent)
                .foregroundStyle(Theme.onAccent)
                .padding(.top, 4)
            }
            .padding(.horizontal, 4)
        }
    }
}

#Preview {
    RootView()
        .environmentObject(WorkoutSession())
}
