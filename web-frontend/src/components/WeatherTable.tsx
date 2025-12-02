import React from "react";
import { formatDate } from "../utils";

interface WeatherTableProps {
  rows: {
    _id: string;
    timestamp: string;
    condition?: string;
    temperature: number;
    humidity: number;
    windspeed: number;
  }[];
}


export function WeatherTable({ rows }: WeatherTableProps) {

  return (
    <table className="w-full mt-6 bg-white shadow-md rounded-xl overflow-hidden">
      <thead className="bg-blue-600 text-white">
        <tr>
          <th className="p-3">Data</th>
          <th className="p-3">Condição</th>
          <th className="p-3">Temp (°C)</th>
          <th className="p-3">Umidade (%)</th>
          <th className="p-3">Vento (km/h)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r._id} className="text-center border-b">
            <td className="p-3">{formatDate(r.timestamp)}</td>
            <td className="p-3">{r.condition || "N/A"}</td>
            <td className="p-3">{r.temperature}</td>
            <td className="p-3">{r.humidity}</td>
            <td className="p-3">{r.windspeed}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
