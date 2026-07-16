import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    Tooltip,
  } from "recharts";
  import { ArrowDownRight, ArrowUpRight } from "lucide-react";
  
  import { C } from "@/shared/ui";
  
  type Props = {
    currentWeight?: number;
    weightChange: number;
    chartData: any[];
    chartMetric: "weight" | "bodyFat" | "waist";
    setChartMetric: (
      metric: "weight" | "bodyFat" | "waist"
    ) => void;
  };
  
  function formatChange(value: number, unit: string) {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)} ${unit}`;
  }
  
  export default function BodyweightChartCard({
    currentWeight,
    weightChange,
    chartData,
    chartMetric,
    setChartMetric,
  }: Props) {
    return (
      <div
        className="rounded-[20px] p-4 mb-5"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
        }}
      >
        <div className="flex justify-between items-end mb-4">
          <div>
            <p
              className="text-[11px] uppercase tracking-wider font-semibold"
              style={{ color: C.fg2 }}
            >
              Bodyweight
            </p>
  
            <p
              className="text-2xl font-extrabold mt-0.5 leading-none"
              style={{ color: C.fg }}
            >
              {currentWeight ?? "--"}
              <span
                className="text-sm font-medium ml-1"
                style={{ color: C.fg3 }}
              >
                kg
              </span>
            </p>
          </div>
  
          <div className="flex items-center gap-1">
            {weightChange >= 0 ? (
              <ArrowUpRight size={14} color={C.accent} />
            ) : (
              <ArrowDownRight size={14} color={C.red} />
            )}
  
            <span
              className="text-sm font-bold"
              style={{
                color: weightChange >= 0 ? C.accent : C.red,
              }}
            >
              {formatChange(weightChange, "kg")}
            </span>
          </div>
        </div>
  
        <div className="flex gap-2 mb-4">
          {[
            { key: "weight", label: "Weight" },
            { key: "bodyFat", label: "Body Fat" },
            { key: "waist", label: "Waist" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setChartMetric(item.key as any)}
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background:
                  chartMetric === item.key
                    ? C.accent
                    : C.card2,
                color:
                  chartMetric === item.key
                    ? C.bg
                    : C.fg3,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
  
        <div style={{ height: 120 }}>
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p style={{ color: C.fg3 }}>
                No check-ins yet
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="wGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={C.accent}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor={C.accent}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
  
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: C.fg3,
                    fontSize: 10,
                  }}
                />
  
                <Tooltip
                  contentStyle={{
                    background: C.card2,
                    border: `1px solid ${C.border}`,
                  }}
                />
  
                <Area
                  type="monotone"
                  dataKey={chartMetric}
                  stroke={C.accent}
                  fill="url(#wGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }