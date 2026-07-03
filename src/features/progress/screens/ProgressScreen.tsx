import {
    ArrowDownRight,
    ArrowUpRight,
    Award,
    Camera,
  } from "lucide-react";
  import {
    AreaChart,
    Area,
    XAxis,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  
  import { C } from "@/shared/ui";
  import { ProgressRing, Badge, SectionHeader } from "@/shared/components";
const weightTrend = [
    { week: "W1", weight: 80.2 }, { week: "W2", weight: 80.5 },
    { week: "W3", weight: 81.0 }, { week: "W4", weight: 81.3 },
    { week: "W5", weight: 81.7 }, { week: "W6", weight: 82.0 },
    { week: "W7", weight: 82.3 }, { week: "W8", weight: 82.4 },
  ];
  
  export default function ProgressScreen() {
    return (
      <div className="px-5 pb-8 pt-4">
        <h2 className="text-2xl font-bold mb-0.5" style={{ color: C.fg }}>Progress</h2>
        <p className="text-sm mb-5" style={{ color: C.fg3 }}>Last 8 weeks · Lean Bulk Phase</p>
  
        {/* Weight chart */}
        <div className="rounded-[22px] p-4 mb-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: C.fg2 }}>Bodyweight</p>
              <p className="text-2xl font-extrabold mt-0.5 leading-none" style={{ color: C.fg }}>
                82.4<span className="text-sm font-medium ml-1" style={{ color: C.fg3 }}>kg</span>
              </p>
            </div>
            <div className="flex items-center gap-1 pb-0.5">
              <ArrowUpRight size={14} color={C.accent} />
              <span className="text-sm font-bold" style={{ color: C.accent }}>+2.2 kg</span>
              <span className="text-xs ml-1" style={{ color: C.fg3 }}>8 weeks</span>
            </div>
          </div>
          <div style={{ height: 100 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightTrend} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.accent} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week" axisLine={false} tickLine={false}
                  tick={{ fill: C.fg3, fontSize: 10, fontFamily: "Inter" }}
                />
                <Tooltip
                  contentStyle={{
                    background: C.card2, border: `1px solid ${C.border}`,
                    borderRadius: 10, color: C.fg, fontSize: 12, fontFamily: "Inter",
                  }}
                  labelStyle={{ color: C.fg2 }}
                  cursor={{ stroke: C.border }}
                />
                <Area type="monotone" dataKey="weight" stroke={C.accent} strokeWidth={2} fill="url(#wGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        {/* Measurements */}
        <SectionHeader title="Measurements" action="Update" />
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: "Waist", val: "79", unit: "cm", change: "-0.5", down: true },
            { label: "Chest", val: "102", unit: "cm", change: "+1.2", down: false },
            { label: "Arms", val: "38.5", unit: "cm", change: "+0.8", down: false },
            { label: "Legs", val: "61", unit: "cm", change: "+1.0", down: false },
          ].map(({ label, val, unit, change, down }) => (
            <div key={label} className="rounded-[18px] p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <p className="text-[11px] mb-2" style={{ color: C.fg2 }}>{label}</p>
              <p className="text-2xl font-bold leading-none" style={{ color: C.fg }}>
                {val}<span className="text-xs ml-1" style={{ color: C.fg3 }}>{unit}</span>
              </p>
              <div className="flex items-center gap-1 mt-2">
                {down
                  ? <ArrowDownRight size={11} color={C.accent} />
                  : <ArrowUpRight size={11} color={C.accent} />
                }
                <span className="text-[11px] font-semibold" style={{ color: C.accent }}>{change} cm</span>
              </div>
            </div>
          ))}
        </div>
  
        {/* Body fat */}
        <div className="rounded-[22px] p-4 mb-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: C.fg2 }}>
                Est. Body Fat
              </p>
              <p className="text-3xl font-extrabold leading-none" style={{ color: C.fg }}>
                13.2<span className="text-lg ml-0.5">%</span>
              </p>
              <p className="text-xs mt-2" style={{ color: C.fg3 }}>Lean athlete range</p>
            </div>
            <ProgressRing value={13.2} max={30} size={72} stroke={6} color={C.accent}>
              <span className="text-[13px] font-bold" style={{ color: C.fg }}>13%</span>
            </ProgressRing>
          </div>
        </div>
  
        {/* Strength PRs */}
        <SectionHeader title="Personal Records" action="View all" />
        <div className="rounded-[20px] mb-5 overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          {[
            { lift: "Bench Press", pr: "102.5 kg", date: "Jun 18", isNew: true },
            { lift: "Squat", pr: "140 kg", date: "Jun 10", isNew: false },
            { lift: "Deadlift", pr: "175 kg", date: "May 28", isNew: false },
            { lift: "Overhead Press", pr: "72.5 kg", date: "Jun 22", isNew: true },
          ].map(({ lift, pr, date, isNew }, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3.5"
              style={{ borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}
            >
              <div className="flex items-center gap-3">
                <Award size={16} color={isNew ? C.accent : C.fg3} />
                <div>
                  <p className="text-sm font-medium" style={{ color: C.fg }}>{lift}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: C.fg3 }}>{date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold" style={{ color: C.fg }}>{pr}</p>
                {isNew && <Badge>New PR</Badge>}
              </div>
            </div>
          ))}
        </div>
  
        {/* Photo comparison */}
        <SectionHeader title="Progress Photos" action="Upload" />
        <div
          className="rounded-[20px] overflow-hidden flex items-center justify-center"
          style={{ height: 140, background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="text-center">
            <Camera size={22} color={C.fg3} className="mx-auto mb-2" />
            <p className="text-sm font-medium" style={{ color: C.fg3 }}>Upload progress photos</p>
            <p className="text-xs mt-1" style={{ color: C.fg3 }}>Compare your transformation week by week</p>
          </div>
        </div>
      </div>
    );
  }