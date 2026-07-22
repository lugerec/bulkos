import { useEffect, useState } from "react";
import { Watch } from "lucide-react";

import { C, T } from "@/shared/ui";
import { Capacitor } from "@capacitor/core";
import { getWatchStatus, type WatchStatus } from "@/services/watchService";

type State =
  | { kind: "hidden" }
  | { kind: "checking" }
  | { kind: "noPlugin" }
  | { kind: "status"; status: WatchStatus };

/**
 * Settings card for the Apple Watch link. Doubles as a diagnostic: it says
 * outright when the native bridge isn't in this build (stale install), when
 * no watch is paired, or when the watch app isn't installed.
 */
export default function WatchStatusCard() {
  const [state, setState] = useState<State>(
    Capacitor.getPlatform() === "ios" ? { kind: "checking" } : { kind: "hidden" }
  );

  useEffect(() => {
    if (state.kind !== "checking") return;

    let cancelled = false;

    (async () => {
      const status = await getWatchStatus();
      if (cancelled) return;

      setState(status ? { kind: "status", status } : { kind: "noPlugin" });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.kind === "hidden") return null;

  const line = (() => {
    switch (state.kind) {
      case "checking":
        return "Checking…";
      case "noPlugin":
        return "Bridge missing in this build — rebuild the iPhone app in Xcode.";
      case "status": {
        const { supported, paired, appInstalled } = state.status;
        if (!supported) return "Not supported on this device.";
        if (!paired) return "No Apple Watch paired with this iPhone.";
        if (!appInstalled)
          return "Watch paired — install BulkOS on the watch (run the Watch App scheme in Xcode).";
        return "Connected — workouts sync to your watch.";
      }
    }
  })();

  const ok =
    state.kind === "status" &&
    state.status.paired &&
    state.status.appInstalled;

  return (
    <div
      className="rounded-[20px] p-4 mb-4 card-lit"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ background: C.accentDim, color: C.accentInk }}
        >
          <Watch size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <p style={{ ...T.bodyStrong, color: C.fg }}>Apple Watch</p>
          <p className="mt-0.5" style={{ ...T.caption, color: C.fg3 }}>
            {line}
          </p>
        </div>

        {ok && (
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
        )}
      </div>
    </div>
  );
}
