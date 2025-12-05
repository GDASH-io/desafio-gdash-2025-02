import React from "react";
import type { IWeatherLog } from "../interfaces/weather.interface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface WeatherLogTableProps {
  logs: IWeatherLog[];
}

const WeatherLogTable: React.FC<WeatherLogTableProps> = ({ logs }) => {
  return (
    <div className="rounded-md border bg-white shadow-sm mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Local</TableHead>
            <TableHead>Temp (°C)</TableHead>
            <TableHead>Vento (km/h)</TableHead>
            <TableHead>Condição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log._id}>
              <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
              <TableCell>{log.location_name}</TableCell>
              <TableCell>{log.temperature_c.toFixed(1)}</TableCell>
              <TableCell>{log.wind_speed_kmh.toFixed(1)}</TableCell>
              <TableCell>{log.condition}</TableCell>
            </TableRow>
          ))}
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                Nenhum registro de clima encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WeatherLogTable;
