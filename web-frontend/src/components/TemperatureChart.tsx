import React from "react";
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
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeatherData {
  timestamp: string | Date;
  temperature: number;
}

interface TemperatureChartProps {
  data: WeatherData[];
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  const chartData = {
    labels: data.map((d) =>
      new Date(d.timestamp).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })
    ),
    datasets: [
      {
        label: "Temperatura (°C)",
        data: data.map((d) => d.temperature),
        borderColor: "rgb(37, 99, 235)",
        backgroundColor: "rgba(37, 99, 235, 0.4)",
        tension: 0.3, 
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mt-6">
      <h3 className="font-semibold mb-2 text-gray-700">
        Temperatura ao longo do tempo
      </h3>
      <Line data={chartData} />
    </div>
  );
}
