import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { C, T } from "@/shared/ui";
import {
  checkHealthAuthorization,
  isHealthAvailable,
  requestHealthAuthorization,
} from "@/services/healthService";

type Status = "checking" | "unavailable" | "connected" | "disconnected";

/**
 * Settings card to connect Apple Health. Shows availability, current grant
 * state, and a Connect button that triggers the iOS permission sheet.
 */
export default function HealthConnectCard() {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!(await isHealthAvailable())) {
        if (!cancelled) setStatus("unavailable");
        return;
      }

      const authorized = await checkHealthAuthorization();
      if (!cancelled) setStatus(authorized ? "connected" : "disconnected");
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const connect = async () => {
    setBusy(true);
    try {
      const ok = await requestHealthAuthorization();
      setStatus(ok ? "connected" : "disconnected");
    } finally {
      setBusy(false);
    }
  };

  // Don't show the card at all where Health can't exist (e.g. web preview).
  if (status === "unavailable") return null;

  return (
    <div
      className="rounded-[20px] p-4 mb-4 card-lit"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(248,113,113,0.14)", color: "#F87171" }}
        >
          <Heart size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <p style={{ ...T.bodyStrong, color: C.fg }}>Apple Health</p>
          <p className="mt-0.5" style={{ ...T.caption, color: C.fg3 }}>
            {status === "connected"
              ? "Syncing workouts, weight and activity."
              : "Sync workouts and weight, read your steps and activity."}
          </p>
        </div>

        {status === "connected" ? (
          <span
            className="px-3 py-1.5 rounded-full flex-shrink-0"
            style={{
              ...T.caption,
              fontWeight: 700,
              background: C.accentDim,
              color: C.accentInk,
            }}
          >
            Connected
          </span>
        ) : (
          <button
            onClick={connect}
            disabled={busy || status === "checking"}
            className="px-4 py-2 rounded-full flex-shrink-0 font-bold"
            style={{
              ...T.caption,
              fontWeight: 700,
              background: C.accent,
              color: "#0A0A0B",
              opacity: busy || status === "checking" ? 0.6 : 1,
            }}
          >
            {busy ? "Connecting…" : "Connect"}
          </button>
        )}
      </div>
    </div>
  );
}
