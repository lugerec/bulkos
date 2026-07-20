import { C, T } from "@/shared/ui";

type Props = {
  proteinRemaining: number;
  proteinProgress: number;
  heroMessage: string;
};

/** Ink colors for content sitting on the solid lime hero surface. */
const INK = "#0A0A0B";
const INK_SOFT = "rgba(10,10,11,0.62)";
const INK_TRACK = "rgba(10,10,11,0.16)";

/**
 * Dashboard hero: a solid accent surface with dark ink — the app's signature
 * card. Label → big number → progress → one-line message.
 */
export default function TodayGoalCard({
  proteinRemaining,
  proteinProgress,
  heroMessage,
}: Props) {
  return (
    <div
      className="rounded-[24px] p-5 mb-4"
      style={{
        background: C.accent,
        boxShadow: "0 12px 40px rgba(204,242,50,0.18)",
      }}
    >
      <p className="mb-3" style={{ ...T.eyebrow, color: INK_SOFT }}>
        Today's goal
      </p>

      <p style={{ ...T.display, color: INK }}>
        {Math.round(proteinRemaining)}
        <span className="ml-1.5" style={{ ...T.bodyStrong, color: INK_SOFT }}>
          g protein left
        </span>
      </p>

      <div
        className="mt-4"
        style={{
          height: 8,
          background: INK_TRACK,
          borderRadius: 99,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(proteinProgress * 100, 100)}%`,
            transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            background: INK,
            borderRadius: 99,
          }}
        />
      </div>

      <p className="mt-3" style={{ ...T.label, color: INK, fontWeight: 600 }}>
        {heroMessage}
      </p>
    </div>
  );
}
