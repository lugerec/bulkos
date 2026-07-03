import { useState } from "react";
import {
  BarChart3,
  ChevronRight,
  Download,
  Flame,
} from "lucide-react";

import { C, type Screen } from "@/shared/ui";
import { SectionHeader } from "@/shared/components";

export default function SettingsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
    const [notifications, setNotifications] = useState(true);
    const [units, setUnits] = useState<"metric" | "imperial">("metric");
    const logout = useAuthStore((s) => s.logout);
  
    const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
      <button
        onClick={onChange}
        className="relative flex-shrink-0"
        style={{
          width: 44,
          height: 24,
          borderRadius: 99,
          background: value ? C.accent : C.card2,
          border: `1px solid ${value ? C.accent : C.border}`,
          transition: "background 0.2s",
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
        <h2 className="text-2xl font-bold mb-5" style={{ color: C.fg }}>Settings</h2>
  
        {/* Profile card */}
        <div
          className="flex items-center gap-4 p-4 rounded-[20px] mb-6"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: C.accentDim, color: C.accent }}
          >
            AM
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold" style={{ color: C.fg }}>Alex Morrison</p>
            <p className="text-sm" style={{ color: C.fg2 }}>alex@bulkos.app</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.accent }} />
              <p className="text-xs font-semibold" style={{ color: C.accent }}>Premium · Active</p>
            </div>
          </div>
          <ChevronRight size={16} color={C.fg3} />
        </div>
  
        {/* Personal data */}
        <SectionHeader title="Personal Data" />
        <div
          className="rounded-[20px] mb-5 overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          {[
            { label: "Age", val: "27 years" },
            { label: "Height", val: "182 cm" },
            { label: "Current Weight", val: "82.4 kg" },
            { label: "Goal Weight", val: "86.0 kg" },
            { label: "Activity Level", val: "Highly Active" },
            { label: "Training Days", val: "Mon, Tue, Thu, Fri, Sat" },
          ].map(({ label, val }, i, arr) => (
            <div
              key={label}
              className="flex justify-between items-center px-4 py-3.5"
              style={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}
            >
              <span className="text-sm" style={{ color: C.fg2 }}>{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: C.fg }}>{val}</span>
                <ChevronRight size={13} color={C.fg3} />
              </div>
            </div>
          ))}
        </div>
  
        {/* Macro targets */}
        <SectionHeader title="Calorie & Macro Targets" />
        <div
          className="rounded-[20px] mb-5 overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          {[
            { label: "Daily Calories", val: "3,100 kcal" },
            { label: "Protein", val: "220 g" },
            { label: "Carbohydrates", val: "310 g" },
            { label: "Fat", val: "85 g" },
          ].map(({ label, val }, i, arr) => (
            <div
              key={label}
              className="flex justify-between items-center px-4 py-3.5"
              style={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}
            >
              <span className="text-sm" style={{ color: C.fg2 }}>{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: C.accent }}>{val}</span>
                <ChevronRight size={13} color={C.fg3} />
              </div>
            </div>
          ))}
        </div>
  
        {/* Dietary */}
        <SectionHeader title="Dietary Preferences" />
        <div
          className="rounded-[20px] mb-5 overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          {[
            { label: "Food Allergies", val: "None" },
            { label: "Dietary Restrictions", val: "None" },
            { label: "Cuisine Preferences", val: "Mediterranean" },
          ].map(({ label, val }, i) => (
            <div
              key={label}
              className="flex justify-between items-center px-4 py-3.5"
              style={{ borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}
            >
              <span className="text-sm" style={{ color: C.fg2 }}>{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: C.fg3 }}>{val}</span>
                <ChevronRight size={13} color={C.fg3} />
              </div>
            </div>
          ))}
        </div>
  
        {/* App preferences */}
        <SectionHeader title="Preferences" />
        <div
          className="rounded-[20px] mb-5 overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div
            className="flex justify-between items-center px-4 py-3.5"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            <span className="text-sm" style={{ color: C.fg2 }}>Notifications</span>
            <Toggle value={notifications} onChange={() => setNotifications((n) => !n)} />
          </div>
          <div
            className="flex justify-between items-center px-4 py-3.5"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            <span className="text-sm" style={{ color: C.fg2 }}>Dark Mode</span>
            <Toggle value={true} onChange={() => {}} />
          </div>
          <div className="flex justify-between items-center px-4 py-3.5">
            <span className="text-sm" style={{ color: C.fg2 }}>Units</span>
            <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
              {(["metric", "imperial"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnits(u)}
                  className="px-3 py-1.5 text-xs font-semibold capitalize"
                  style={{
                    background: units === u ? C.accent : "transparent",
                    color: units === u ? C.bg : C.fg3,
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
  
        {/* More screens */}
        <SectionHeader title="Tools" />
        <div
          className="rounded-[20px] mb-5 overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          {[
            { label: "Analytics", icon: BarChart3, screen: "analytics" as Screen, color: C.blue },
            { label: "Grocery List", icon: Flame, screen: "grocery" as Screen, color: C.amber },
          ].map(({ label, icon: Icon, screen, color }, i) => (
            <button
              key={label}
              onClick={() => onNavigate(screen)}
              className="w-full flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: i === 0 ? `1px solid ${C.border}` : "none" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18` }}
              >
                <Icon size={16} color={color} />
              </div>
              <span className="text-sm font-medium flex-1 text-left" style={{ color: C.fg }}>{label}</span>
              <ChevronRight size={14} color={C.fg3} />
            </button>
          ))}
        </div>
  
        {/* Export */}
        <button
          className="w-full py-4 rounded-[18px] font-semibold text-sm flex items-center justify-center gap-2 mb-3"
          style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg2 }}
        >
          <Download size={16} />
          Export Data
        </button>
  
  
        <button
        onClick={logout}
        className="w-full py-4 rounded-[18px] font-semibold text-sm mb-3"
        style={{ background: "rgba(255,76,76,0.08)", border: `1px solid rgba(255,76,76,0.25)`, color: C.red }}
        >
        Logout
        </button>
        <p className="text-center text-xs mt-2" style={{ color: C.fg3 }}>BulkOS v2.4.1 · Premium</p>
      </div>
    );
  }