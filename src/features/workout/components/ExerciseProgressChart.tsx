import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { C } from "@/shared/ui";

type Point = {
  date: string;
  value: number;
};

type Props = {
  data: Point[];
};

/** Short "16 Jul" label from a YYYY-MM-DD key. */
function shortDate(dateKey: string) {
  const [, month, day] = dateKey.split("-").map(Number);
  if (!month || !day) return dateKey;

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${day} ${months[month - 1]}`;
}

export default function ExerciseProgressChart({ data }: Props) {
  if (data.length === 0) return null;

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="limeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.accent} stopOpacity={0.28} />
              <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tick={{ fill: C.fg3, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: C.fg3, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: C.card2,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              color: C.fg,
              fontSize: 13,
            }}
            labelStyle={{ color: C.fg2, fontSize: 11 }}
            labelFormatter={(label) => shortDate(String(label))}
            cursor={{ stroke: C.border, strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={C.accent}
            strokeWidth={2.5}
            fill="url(#limeFill)"
            dot={{ r: 3, fill: C.accent, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: C.accent, stroke: C.bg, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
