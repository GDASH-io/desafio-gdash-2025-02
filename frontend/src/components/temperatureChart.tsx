import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import type { TemperatureChartProps } from "../interfaces/charts.interface";

const TemperatureChart: React.FC<TemperatureChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-[#28364F] mb-4">
        Tendência Média (Últimos 7 Dias)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            angle={-15}
            textAnchor="end"
            height={50}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("pt-BR", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <YAxis
            stroke="#6b7280"
            domain={["dataMin - 1", "dataMax + 1"]}
            label={
              <Label
                value="Temp (°C)"
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: "middle", fill: "#6b7280" }}
              />
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            formatter={(value: number) => [`${value} °C`, "Média Diária"]}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#50E3D2"
            strokeWidth={3}
            dot={{ fill: "#28364F", r: 4 }}
            activeDot={{ r: 8, fill: "#50E3D2" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TemperatureChart;
