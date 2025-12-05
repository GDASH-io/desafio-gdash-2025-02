import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface WeatherLog {
  timestamp: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  condition: string;
}

interface Props {
  logs: WeatherLog[];
}

export default function WeatherTable({ logs }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data/Hora</TableHead>
          <TableHead>Temperatura</TableHead>
          <TableHead>Umidade</TableHead>
          <TableHead>Vento</TableHead>
          <TableHead>Condição</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log, idx) => (
          <TableRow key={idx}>
            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
            <TableCell>{log.temperature} °C</TableCell>
            <TableCell>{log.humidity} %</TableCell>
            <TableCell>{log.wind_speed} km/h</TableCell>
            <TableCell>{log.condition}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
