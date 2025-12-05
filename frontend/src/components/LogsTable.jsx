import Card from "./ui/Card";

export default function LogsTable({ logs }) {
  return (
    <Card>
      <h3 className="font-semibold mb-3">Últimos registros</h3>
      {logs.length === 0 ? (
        <p>Nenhum registro</p>
      ) : (
        <div className="max-h-60 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-800">
              <tr>
                <th className="text-left p-1">Data</th>
                <th className="text-left p-1">Local</th>
                <th className="text-right p-1">Temp (°C)</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id} className="border-t border-gray-700">
                  <td className="p-1">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="p-1">{l.location}</td>
                  <td className="p-1 text-right">{l.temperature}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
