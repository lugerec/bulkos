import { C, T } from "@/shared/ui";

type Props = {
  proteinRemaining: number;
  proteinProgress: number;
  heroMessage: string;
};

export default function TodayGoalCard({
  proteinRemaining,
  proteinProgress,
  heroMessage,
}: Props) {
  return (
    <div
      className="rounded-[20px] p-5 mb-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(163,230,53,0.16), rgba(96,165,250,0.08))",
        border: "1px solid rgba(163,230,53,0.22)",
      }}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-2"
        style={{ color: C.accent }}
      >
        Today's Goal
      </p>

      <p className="text-sm mb-1" style={{ color: C.fg3 }}>
        Protein remaining
      </p>

      <p
        className="mb-4"
        style={{ ...T.display, color: C.fg }}
      >
        {Math.round(proteinRemaining)}
        <span className="ml-1" style={{ ...T.body, color: C.fg3 }}>
          g
        </span>
      </p>

      <div
        style={{
          height: 6,
          background: C.border,
          borderRadius: 99,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(proteinProgress * 100, 100)}%`,
            background: C.accent,
            borderRadius: 99,
          }}
        />
      </div>

      <p className="text-sm font-semibold" style={{ color: C.fg }}>
        {heroMessage}
      </p>
    </div>
  );
}