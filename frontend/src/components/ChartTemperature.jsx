import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

export default function ChartTemperature({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <h3 className="mb-3 font-semibold">Temperatura (próximas horas)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <Line dataKey="temp" stroke="#7c3aed" strokeWidth={3} />
          <CartesianGrid stroke="#2b2b2b" strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
