import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RainData {
  timestamp: string | Date;
  rain_probability?: number;
}

interface RainProbabilityChartProps {
  data: RainData[];
}

export function RainProbabilityChart({ data }: RainProbabilityChartProps) {
  const chartData = {
    labels: data.map((d) => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Probabilidade de Chuva (%)",
        data: data.map((d) => d.rain_probability || 0),
        borderColor: "rgb(2,132,199)",
        backgroundColor: "rgba(2,132,199,0.3)",
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mt-6">
      <h3 className="font-semibold mb-2 text-gray-700">Probabilidade de Chuva</h3>
      <Line data={chartData} />
    </div>
  );
}
