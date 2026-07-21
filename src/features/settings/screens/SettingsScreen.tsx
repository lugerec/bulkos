import { useEffect, useState } from "react";
import {
  BarChart3,
  Calculator,
  ChevronRight,
  Download,
  Dumbbell,
  Flame,
} from "lucide-react";

import { C, type Screen } from "@/shared/ui";
import { SectionHeader } from "@/shared/components";
import { useAuthStore } from "@/store/authStore";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";
import { useBodyMetricsStore } from "@/store/bodyMetricsStore";
import { useSettingsStore } from "@/store/settingsStore";
import ProfileGoalsCard from "../components/ProfileGoalsCard";
import {
  buildBodyMetricsCsv,
  buildWorkoutsCsv,
  downloadTextFile,
} from "@/lib/exportCsv";
import { toDateKey } from "@/lib/date";

export default function SettingsScreen({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void;
}) {
  const [notifications, setNotifications] = useState(true);
  const units = useSettingsStore((s) => s.units);
  const setUnits = useSettingsStore((s) => s.setUnits);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const userDoc = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const workouts = useWorkoutHistoryStore((s) => s.workouts);
  const loadWorkouts = useWorkoutHistoryStore((s) => s.loadWorkouts);
  const bodyEntries = useBodyMetricsStore((s) => s.entries);
  const loadBodyMetrics = useBodyMetricsStore((s) => s.load);

  useEffect(() => {
    if (!user) return;
    loadWorkouts(user.uid);
    loadBodyMetrics(user.uid);
  }, [user, loadWorkouts, loadBodyMetrics]);

  const todayKey = toDateKey(new Date());

  const handleExport = () => {
    downloadTextFile(
      `bulkos-workouts-${todayKey}.csv`,
      buildWorkoutsCsv(workouts)
    );
    downloadTextFile(
      `bulkos-body-metrics-${todayKey}.csv`,
      buildBodyMetricsCsv(bodyEntries)
    );
  };

  const Toggle = ({
    value,
    onChange,
  }: {
    value: boolean;
    onChange: () => void;
  }) => (
    <button
      onClick={onChange}
      className="relative flex-shrink-0"
      style={{
        width: 44,
        height: 24,
        borderRadius: 99,
        background: value ? C.accent : C.card2,
        border: `1px solid ${value ? C.accent : C.border}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: value ? "calc(100% - 22px)" : 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: value ? C.bg : C.fg3,
          transition: "left 0.2s",
        }}
      />
    </button>
  );

  return (
    <div className="px-5 pb-8 pt-4">
      <h2 className="text-[22px] font-bold mb-5" style={{ color: C.fg }}>
        Settings
      </h2>

      {user && userDoc?.profile && (
        <ProfileGoalsCard
          uid={user.uid}
          profile={userDoc.profile}
          onSaved={refreshProfile}
        />
      )}

      <SectionHeader title="Tools" />

      <div
        className="rounded-[20px] mb-4 overflow-hidden card-lit"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        {[
          {
            label: "Workout Templates",
            icon: Dumbbell,
            screen: "template-builder" as Screen,
            color: C.accentInk,
          },
          {
            label: "Analytics",
            icon: BarChart3,
            screen: "analytics" as Screen,
            color: C.blue,
          },
          {
            label: "Grocery List",
            icon: Flame,
            screen: "grocery" as Screen,
            color: C.amber,
          },
          {
            label: "1RM Calculator",
            icon: Calculator,
            screen: "one-rep-max" as Screen,
            color: C.purple,
          },
        ].map(({ label, icon: Icon, screen, color }, i, arr) => (
          <button
            key={label}
            onClick={() => onNavigate(screen)}
            className="w-full flex items-center gap-3 px-4 py-3.5"
            style={{
              borderBottom:
                i < arr.length - 1 ? `1px solid ${C.border}` : "none",
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18` }}
            >
              <Icon size={16} color={color} />
            </div>

            <span
              className="text-sm font-medium flex-1 text-left"
              style={{ color: C.fg }}
            >
              {label}
            </span>

            <ChevronRight size={14} color={C.fg3} />
          </button>
        ))}
      </div>

      <SectionHeader title="Preferences" />

      <div
        className="rounded-[20px] mb-4 overflow-hidden card-lit"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div
          className="flex justify-between items-center px-4 py-3.5"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <span className="text-sm" style={{ color: C.fg2 }}>
            Notifications
          </span>
          <Toggle
            value={notifications}
            onChange={() => setNotifications((n) => !n)}
          />
        </div>

        <div
          className="flex justify-between items-center px-4 py-3.5"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <span className="text-sm" style={{ color: C.fg2 }}>
            Dark Mode
          </span>
          <Toggle
            value={theme === "dark"}
            onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
        </div>

        <div className="flex justify-between items-center px-4 py-3.5">
          <span className="text-sm" style={{ color: C.fg2 }}>
            Units
          </span>

          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: `1px solid ${C.border}` }}
          >
            {(["metric", "imperial"] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnits(u)}
                className="px-3 py-1.5 text-xs font-semibold capitalize"
                style={{
                  background: units === u ? C.accent : "transparent",
                  color: units === u ? "#0A0A0B" : C.fg2,
                }}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleExport}
        className="w-full py-4 rounded-[20px] font-semibold text-sm flex items-center justify-center gap-2 mb-3 card-lit"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          color: C.fg2,
        }}
      >
        <Download size={16} />
        Export Data (CSV)
      </button>

      <button
        onClick={logout}
        className="w-full py-4 rounded-[20px] font-semibold text-sm mb-3 card-lit"
        style={{
          background: "rgba(255,76,76,0.08)",
          border: `1px solid rgba(255,76,76,0.25)`,
          color: C.red,
        }}
      >
        Logout
      </button>

      <p className="text-center text-xs mt-2" style={{ color: C.fg3 }}>
        BulkOS v2.4.1 · Premium
      </p>
    </div>
  );
}