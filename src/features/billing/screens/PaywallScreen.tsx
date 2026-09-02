import { useState } from "react";
import { ArrowLeft, Check, Snowflake, BarChart3, Sparkles } from "lucide-react";

import { C } from "@/shared/ui";
import { useEntitlementStore } from "@/store/entitlementStore";
import {
  getBillingStatus,
  purchasePro,
  restorePurchases,
} from "@/services/billingService";

const PERKS = [
  {
    icon: Snowflake,
    title: "3 streak freezes",
    body: "Bank up to three instead of one, so a bad week doesn't wipe your streak.",
  },
  {
    icon: BarChart3,
    title: "Full history & analytics",
    body: "Every session you've ever logged, with the deeper progress charts.",
  },
  {
    icon: Sparkles,
    title: "Smarter generated sessions",
    body: "Fatigue-aware programming that adapts to how your last weeks actually went.",
  },
];

export default function PaywallScreen({ onBack }: { onBack: () => void }) {
  const isPro = useEntitlementStore((s) => s.isPro);
  const setPro = useEntitlementStore((s) => s.setPro);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const billing = getBillingStatus();

  const handlePurchase = async () => {
    setBusy(true);
    setMessage(null);

    const result = await purchasePro();

    setBusy(false);
    if (result.status === "purchased") return;
    if (result.status === "cancelled") return;

    setMessage(
      billing.available
        ? "Couldn't complete the purchase. Please try again."
        : "Purchases aren't set up yet — coming soon."
    );
  };

  const handleRestore = async () => {
    setBusy(true);
    const result = await restorePurchases();
    setBusy(false);

    setMessage(
      result.status === "purchased"
        ? "Purchase restored."
        : "Nothing to restore."
    );
  };

  return (
    <div className="px-5 pb-10" style={{ paddingTop: 8 }}>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-extrabold" style={{ color: C.fg }}>
          BulkOS Pro
        </h1>
      </div>

      {isPro ? (
        <div
          className="rounded-[20px] p-5 mb-6 flex items-center gap-3"
          style={{ background: C.accentDim, border: `1px solid ${C.accent}` }}
        >
          <Check size={20} color={C.accent} />
          <p className="text-sm font-bold" style={{ color: C.fg }}>
            You're on Pro — thanks for supporting BulkOS.
          </p>
        </div>
      ) : (
        <p className="text-sm mb-6" style={{ color: C.fg2 }}>
          Tracking your lifts and food stays free, always. Pro adds the extras.
        </p>
      )}

      <div className="flex flex-col gap-3 mb-6">
        {PERKS.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="flex gap-3 rounded-[16px] p-4"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: C.accentDim }}
            >
              <Icon size={17} color={C.accent} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold" style={{ color: C.fg }}>
                {title}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: C.fg3 }}>
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!isPro && (
        <>
          <button
            onClick={handlePurchase}
            disabled={busy}
            className="w-full py-4 rounded-[20px] font-bold text-base card-lit disabled:opacity-60"
            style={{ background: C.accent, color: C.onAccent }}
          >
            {busy ? "Please wait…" : "Get Pro"}
          </button>

          <button
            onClick={handleRestore}
            disabled={busy}
            className="w-full py-3 mt-2 text-xs font-semibold"
            style={{ color: C.fg3 }}
          >
            Restore purchase
          </button>
        </>
      )}

      {message && (
        <p className="text-[11px] text-center mt-2" style={{ color: C.fg2 }}>
          {message}
        </p>
      )}

      {import.meta.env.DEV && (
        <button
          onClick={() => setPro(!isPro)}
          className="w-full py-2.5 mt-6 rounded-[12px] text-[11px] font-semibold"
          style={{
            background: "transparent",
            border: `1px dashed ${C.border}`,
            color: C.fg3,
          }}
        >
          Dev: {isPro ? "turn Pro off" : "turn Pro on"}
        </button>
      )}

      {!billing.available && !isPro && (
        <p className="text-[11px] text-center mt-4" style={{ color: C.fg3 }}>
          {billing.reason === "notNative"
            ? "Purchases are only available in the app."
            : "Purchases are being set up — nothing is charged yet."}
        </p>
      )}
    </div>
  );
}
