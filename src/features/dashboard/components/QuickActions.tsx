import type { ReactNode } from "react";
import {
  Dumbbell,
  Utensils,
  Scale,
  TrendingUp,
} from "lucide-react";

import { C, type Screen } from "@/shared/ui";

type Props = {
  onNavigate: (screen: Screen) => void;
};

export default function QuickActions({ onNavigate }: Props) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-5">
      <QuickAction
        icon={<Dumbbell size={20} />}
        label="Workout"
        onClick={() => onNavigate("workout")}
      />

      <QuickAction
        icon={<Utensils size={20} />}
        label="Meals"
        onClick={() => onNavigate("nutrition")}
      />

      <QuickAction
        icon={<Scale size={20} />}
        label="Check-in"
        onClick={() => onNavigate("check-in")}
      />

      <QuickAction
        icon={<TrendingUp size={20} />}
        label="Progress"
        onClick={() => onNavigate("progress")}
      />
    </div>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-[20px] py-4 flex flex-col items-center gap-2 card-lit"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
      }}
    >
      <div style={{ color: C.accent }}>{icon}</div>

      <span className="text-[11px] font-medium" style={{ color: C.fg }}>
        {label}
      </span>
    </button>
  );
}