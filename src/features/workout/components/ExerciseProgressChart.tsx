import {
    LineChart,
    Line,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
  } from "recharts";
  
  type Point = {
    date: string;
    value: number;
  };
  
  type Props = {
    data: Point[];
  };
  
  export default function ExerciseProgressChart({ data }: Props) {
    if (data.length === 0) return null;
  
    return (
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#7CFF6B"
              strokeWidth={3}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }