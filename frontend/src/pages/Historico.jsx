import { useEffect, useState } from "react";
import api from "@/lib/api";
import LogsTable from "@/components/LogsTable";

export default function Historico() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/weather/logs");
        setLogs(Array.isArray(res.data) ? res.data : res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Histórico completo</h2>
      <LogsTable logs={logs} />
    </div>
  );
}
