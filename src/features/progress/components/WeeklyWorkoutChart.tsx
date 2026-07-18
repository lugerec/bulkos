import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
  } from "recharts";
  
  import { C } from "@/shared/ui";
  
  type ChartPoint = {
    day: string;
    volume: number;
    workouts: number;
  };
  
  type Props = {
    data: ChartPoint[];
  };
  
  export default function WeeklyWorkoutChart({ data }: Props) {
    const hasData = data.some((point) => point.volume > 0);
  
    return (
      <div
        className="rounded-[20px] p-4 mb-4"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-bold" style={{ color: C.fg }}>
              Weekly Volume
            </p>
  
            <p className="text-[11px] mt-1" style={{ color: C.fg3 }}>
              Training volume from the last 7 days
            </p>
          </div>
        </div>
  
        {hasData ? (
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 8,
                  right: 4,
                  left: 4,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="weeklyVolumeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={C.accent}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor={C.accent}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
  
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: C.fg3,
                    fontSize: 10,
                  }}
                />
  
                <Tooltip
                  cursor={{
                    stroke: C.border,
                    strokeDasharray: "4 4",
                  }}
                  contentStyle={{
                    background: C.card2,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    color: C.fg,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()} kg`,
                    "Volume",
                  ]}
                />
  
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke={C.accent}
                  strokeWidth={2.5}
                  fill="url(#weeklyVolumeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            className="flex items-center justify-center text-center"
            style={{ height: 150 }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: C.fg }}>
                No training data yet
              </p>
  
              <p className="text-xs mt-1" style={{ color: C.fg3 }}>
                Complete a workout to start the chart.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }