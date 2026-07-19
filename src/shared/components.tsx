import { ArrowLeft } from "lucide-react";
import { C, T } from "./ui";

type TextProps = {
  children: React.ReactNode;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Typography components wrapping the `T` scale, so screens use consistent
 * roles (Title, Heading, Body, Eyebrow, Caption…) instead of ad-hoc pixel
 * sizes. Default colors follow the intended hierarchy but can be overridden.
 */
export function Display({ children, color = C.fg, className, style }: TextProps) {
  return (
    <p className={className} style={{ ...T.display, color, ...style }}>
      {children}
    </p>
  );
}

export function Title({ children, color = C.fg, className, style }: TextProps) {
  return (
    <h2 className={className} style={{ ...T.title, color, ...style }}>
      {children}
    </h2>
  );
}

export function Heading({ children, color = C.fg, className, style }: TextProps) {
  return (
    <h3 className={className} style={{ ...T.heading, color, ...style }}>
      {children}
    </h3>
  );
}

export function Body({ children, color = C.fg2, className, style }: TextProps) {
  return (
    <p className={className} style={{ ...T.body, color, ...style }}>
      {children}
    </p>
  );
}

export function Eyebrow({ children, color = C.fg3, className, style }: TextProps) {
  return (
    <p className={className} style={{ ...T.eyebrow, color, ...style }}>
      {children}
    </p>
  );
}

export function Caption({ children, color = C.fg3, className, style }: TextProps) {
  return (
    <p className={className} style={{ ...T.caption, color, ...style }}>
      {children}
    </p>
  );
}

export function ProgressRing({
  value,
  max,
  size = 80,
  stroke = 6,
  color = C.accent,
  trackColor = C.border,
  children,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value / max, 0), 1);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${pct * circ} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>

      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

export function MacroBar({
  label,
  current,
  goal,
  color,
  unit = "g",
}: {
  label: string;
  current: number;
  goal: number;
  color: string;
  unit?: string;
}) {
  const pct = Math.min((current / goal) * 100, 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium" style={{ color: C.fg2 }}>
          {label}
        </span>

        <span className="text-xs font-semibold" style={{ color: C.fg }}>
          {current}
          <span style={{ color: C.fg3 }}>
            /{goal}
            {unit}
          </span>
        </span>
      </div>

      <div
        style={{
          height: 3,
          background: C.border,
          borderRadius: 99,
        }}
      >
        <div
          style={{
            height: "100%",
            transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)", width: `${pct}%`,
            background: color,
            borderRadius: 99,
            
          }}
        />
      </div>
    </div>
  );
}

export function Badge({
  children,
  color = C.accentDim,
  textColor = C.accent,
}: {
  children: React.ReactNode;
  color?: string;
  textColor?: string;
}) {
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={{
        background: color,
        color: textColor,
      }}
    >
      {children}
    </span>
  );
}

export function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
      style={{
        background: active ? C.accent : C.card2,
        color: active ? C.bg : C.fg2,
        border: `1px solid ${active ? C.accent : C.border}`,
      }}
    >
      {children}
    </button>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex justify-between items-center mb-3">
      <h3
        className="text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: C.fg2 }}
      >
        {title}
      </h3>

      {action && (
        <button
          className="text-xs font-semibold"
          style={{ color: C.accent }}
          onClick={onAction}
        >
          {action}
        </button>
      )}
    </div>
  );
}

export function SubScreenHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-5 pt-5 pb-4">
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          background: C.card2,
          border: `1px solid ${C.border}`,
        }}
      >
        <ArrowLeft size={16} color={C.fg} />
      </button>

      <h2
        className="text-xl font-bold"
        style={{ color: C.fg }}
      >
        {title}
      </h2>
    </div>
  );
}