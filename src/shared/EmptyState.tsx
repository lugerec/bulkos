import type { LucideIcon } from "lucide-react";

import { C, T } from "./ui";

type Props = {
  icon: LucideIcon;
  /** Names the space, e.g. "No workouts yet". */
  title: string;
  /** One line explaining what will appear here. */
  body: string;
  /** Optional call to action — a verb, e.g. "Start a workout". */
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Empty state for screens with no data yet. An empty screen should invite
 * action rather than just report absence, so this pairs a plain-language
 * explanation with an optional verb-first CTA.
 */
export default function EmptyState({
  icon: Icon,
  title,
  body,
  actionLabel,
  onAction,
}: Props) {
  return (
    <div
      className="rounded-[20px] px-5 py-8 flex flex-col items-center text-center"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{ background: C.card2 }}
      >
        <Icon size={22} color={C.fg3} />
      </div>

      <p style={{ ...T.heading, color: C.fg }}>{title}</p>

      <p className="mt-1.5 max-w-[260px]" style={{ ...T.body, color: C.fg3 }}>
        {body}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2.5 rounded-[14px]"
          style={{ ...T.bodyStrong, background: C.accent, color: C.onAccent }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
