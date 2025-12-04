import React from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export function ForecastChart({ logs }: { logs?: any[] }) {	
  if (!logs || logs.length === 0) {
    return (
      <div className="w-full max-w-6xl h-80 flex items-center justify-center text-white/70">
        Loading forecast...
      </div>
    );
  }

  const chartData = logs.map((log) => {
    const d = new Date(log.time);
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return {
      day: weekdays[d.getDay()],
      temperature: log.temperature,
      humidity: log.humidity,
      windSpeed: log.wind_speed
    };
  });

  return (
    <div className="mt-12 w-full max-w-6xl h-80 bg-gradient-to-t from-blue-800/50 to-indigo-900/50 backdrop-blur-xl border border-white/20 rounded-3xl shadow-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
          <XAxis dataKey="day" stroke="white" />
          <YAxis yAxisId="left" stroke="white" />
          <YAxis yAxisId="right" orientation="right" stroke="white" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white"
            }}
          />
          <Legend wrapperStyle={{ color: "white" }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            stroke="#FFD700"
            strokeWidth={3}
            dot={{ r: 6, fill: "#FFD700" }}
            activeDot={{ r: 8 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="windSpeed"
            stroke="#00BFFF"
            strokeWidth={2}
            dot={false}
          />
          <Bar
            yAxisId="right"
            dataKey="humidity"
            fill="rgba(135,206,235,0.5)"
            barSize={20}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
