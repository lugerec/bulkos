import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  Timer,
  X,
} from "lucide-react";

import { C } from "@/shared/ui";

const workoutExercises = [
    {
      name: "Barbell Bench Press",
      sets: [
        { reps: 5, weight: 100 }, { reps: 5, weight: 100 },
        { reps: 5, weight: 100 }, { reps: 3, weight: 100 },
      ],
    },
    {
      name: "Incline Dumbbell Press",
      sets: [{ reps: 10, weight: 34 }, { reps: 10, weight: 34 }, { reps: 10, weight: 34 }],
    },
    {
      name: "Overhead Press",
      sets: [{ reps: 8, weight: 65 }, { reps: 8, weight: 65 }, { reps: 6, weight: 65 }],
    },
    {
      name: "Lateral Raises",
      sets: [{ reps: 15, weight: 12 }, { reps: 15, weight: 12 }, { reps: 12, weight: 12 }],
    },
    {
      name: "Tricep Pushdown",
      sets: [{ reps: 12, weight: 40 }, { reps: 12, weight: 40 }, { reps: 10, weight: 40 }],
    },
    {
      name: "Cable Flyes",
      sets: [{ reps: 15, weight: 15 }, { reps: 15, weight: 15 }],
    },
  ];
  
  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  export default function WorkoutScreen() {
  
  function WorkoutScreen() {
    const [completed, setCompleted] = useState<Set<string>>(new Set());
    const [restTimer, setRestTimer] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [done, setDone] = useState(false);
  
    useEffect(() => {
      const t = setInterval(() => setElapsed((e) => e + 1), 1000);
      return () => clearInterval(t);
    }, []);
  
    useEffect(() => {
      if (!isResting) return;
      const t = setInterval(() => {
        setRestTimer((r) => {
          if (r <= 1) { setIsResting(false); return 0; }
          return r - 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }, [isResting]);
  
    const toggleSet = (exIdx: number, setIdx: number) => {
      const key = `${exIdx}-${setIdx}`;
      setCompleted((prev) => {
        const n = new Set(prev);
        if (n.has(key)) {
          n.delete(key);
        } else {
          n.add(key);
          setRestTimer(90);
          setIsResting(true);
        }
        return n;
      });
    };
  
    const totalSets = workoutExercises.reduce((a, e) => a + e.sets.length, 0);
    const doneSets = completed.size;
  
    if (done) {
      return (
        <div
          className="flex flex-col items-center justify-center px-8 text-center"
          style={{ minHeight: "100%", paddingTop: 60 }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
            style={{
              background: C.accentDim,
              border: `2px solid ${C.accent}`,
              boxShadow: `0 0 40px rgba(124,255,107,0.2)`,
            }}
          >
            <CheckCircle2 size={48} color={C.accent} />
          </div>
          <h2 className="text-3xl font-extrabold mb-2" style={{ color: C.fg }}>Workout Complete</h2>
          <p className="text-base mb-1" style={{ color: C.fg2 }}>Push Day A</p>
          <p className="text-sm mb-8" style={{ color: C.fg3 }}>
            {fmt(elapsed)} elapsed · {doneSets} sets completed
          </p>
          <div className="grid grid-cols-3 gap-3 w-full mb-8">
            {[
              { label: "Volume", val: "8,450 kg" },
              { label: "Sets", val: `${doneSets}` },
              { label: "Duration", val: fmt(elapsed) },
            ].map(({ label, val }) => (
              <div
                key={label}
                className="rounded-[16px] p-3 text-center"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <p className="text-lg font-bold" style={{ color: C.accent }}>{val}</p>
                <p className="text-[11px] mt-1" style={{ color: C.fg3 }}>{label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setDone(false); setCompleted(new Set()); setElapsed(0); }}
            className="w-full py-4 rounded-[18px] font-semibold"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
          >
            Back to Dashboard
          </button>
        </div>
      );
    }
  
    return (
      <div className="pb-8">
        {/* Header */}
        <div className="px-5 pt-4 pb-4">
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: C.accent }}>
                Active Workout
              </p>
              <h2 className="text-2xl font-extrabold" style={{ color: C.fg }}>Push Day A</h2>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold font-mono" style={{ color: C.fg }}>{fmt(elapsed)}</p>
              <p className="text-[11px]" style={{ color: C.fg3 }}>elapsed</p>
            </div>
          </div>
  
          {/* Progress bar */}
          <div style={{ height: 4, background: C.border, borderRadius: 99, marginTop: 14 }}>
            <div
              style={{
                height: "100%",
                width: `${(doneSets / totalSets) * 100}%`,
                background: C.accent,
                borderRadius: 99,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px]" style={{ color: C.fg3 }}>{doneSets}/{totalSets} sets</span>
            <span className="text-[11px]" style={{ color: C.fg3 }}>{totalSets - doneSets} remaining</span>
          </div>
        </div>
  
        {/* Rest timer */}
        {isResting && (
          <div
            className="mx-5 mb-4 rounded-[18px] p-4 flex items-center gap-4"
            style={{ background: "rgba(124,255,107,0.07)", border: "1px solid rgba(124,255,107,0.2)" }}
          >
            <Timer size={20} color={C.accent} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: C.fg }}>Rest Timer</p>
              <p className="text-[11px]" style={{ color: C.fg3 }}>Next set in...</p>
            </div>
            <p className="text-2xl font-bold font-mono" style={{ color: C.accent }}>{fmt(restTimer)}</p>
            <button
              onClick={() => setIsResting(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: C.accentDim }}
            >
              <X size={14} color={C.accent} />
            </button>
          </div>
        )}
  
        {/* Exercises */}
        <div className="px-5 flex flex-col gap-4">
          {workoutExercises.map((ex, exIdx) => (
            <div
              key={exIdx}
              className="rounded-[20px] p-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold" style={{ color: C.fg }}>{ex.name}</p>
                <span className="text-[11px]" style={{ color: C.fg3 }}>{ex.sets.length} sets</span>
              </div>
  
              {/* Set header */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-[10px] uppercase tracking-wide w-8 text-center" style={{ color: C.fg3 }}>Set</span>
                <span className="text-[10px] uppercase tracking-wide flex-1 text-center" style={{ color: C.fg3 }}>Weight</span>
                <span className="text-[10px] uppercase tracking-wide flex-1 text-center" style={{ color: C.fg3 }}>Reps</span>
                <div className="w-8" />
              </div>
  
              {ex.sets.map((set, setIdx) => {
                const key = `${exIdx}-${setIdx}`;
                const isDone = completed.has(key);
                return (
                  <div
                    key={setIdx}
                    className="flex items-center gap-2 py-2 px-1"
                    style={{ opacity: isDone ? 0.45 : 1, transition: "opacity 0.3s" }}
                  >
                    <span
                      className="text-xs w-8 text-center font-semibold"
                      style={{ color: isDone ? C.accent : C.fg3 }}
                    >
                      {setIdx + 1}
                    </span>
                    <span className="text-sm font-bold flex-1 text-center" style={{ color: C.fg }}>
                      {set.weight} kg
                    </span>
                    <span className="text-sm font-bold flex-1 text-center" style={{ color: C.fg }}>
                      {set.reps}
                    </span>
                    <button
                      onClick={() => toggleSet(exIdx, setIdx)}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: isDone ? C.accentDim : C.card2,
                        border: `1.5px solid ${isDone ? C.accent : C.border}`,
                      }}
                    >
                      {isDone
                        ? <Check size={13} color={C.accent} strokeWidth={2.5} />
                        : <Circle size={13} color={C.fg3} />
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
  
        {/* Finish */}
        <div className="px-5 mt-6">
          <button
            onClick={() => setDone(true)}
            className="w-full py-4 rounded-[18px] font-bold text-base"
            style={{ background: C.accent, color: C.bg, boxShadow: `0 8px 32px rgba(124,255,107,0.25)` }}
          >
            Finish Workout
          </button>
        </div>
      </div>
    );
  }
}