import { useEffect, useState } from "react";
import type { WeatherLogPublic, ListLogsPublic } from "../../services/weatherService";
import weatherService from "../../services/weatherService";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface Props {}

export function WeatherTable(_: Props) {
  const [items, setItems] = useState<WeatherLogPublic[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const load = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const resp: ListLogsPublic = await weatherService.listLogs({ page, limit, from, to });
      setItems(resp?.data ?? []);
      setTotal(resp?.total ?? 0);
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registros de Clima</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-600">De</label>
            <Input type="datetime-local" value={from || ""} onChange={(e) => setFrom(e.target.value || undefined)} />
          </div>
          <div>
            <label className="text-xs text-gray-600">Até</label>
            <Input type="datetime-local" value={to || ""} onChange={(e) => setTo(e.target.value || undefined)} />
          </div>
          <div>
            <label className="text-xs text-gray-600">Limite</label>
            <Input type="number" value={limit} onChange={(e) => setLimit(parseInt(e.target.value || "10", 10))} />
          </div>
          <div className="flex items-end">
            <Button onClick={() => { setPage(1); load(); }}>Aplicar Filtros</Button>
          </div>
        </div>

        {loading && <div className="text-sm text-gray-500">Carregando…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Data/Hora</th>
                  <th className="px-3 py-2 text-left">Local</th>
                  <th className="px-3 py-2 text-left">Temp (°C)</th>
                  <th className="px-3 py-2 text-left">Umidade (%)</th>
                  <th className="px-3 py-2 text-left">Vento (km/h)</th>
                  <th className="px-3 py-2 text-left">Chuva (mm)</th>
                  <th className="px-3 py-2 text-left">Condição</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="px-3 py-2">{
                      (() => {
                        const d = new Date(r.timestamp);
                        const datePart = new Intl.DateTimeFormat('pt-BR', { year:'numeric', month:'2-digit', day:'2-digit', timeZone:'UTC' }).format(d);
                        const timePart = new Intl.DateTimeFormat('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false, timeZone:'UTC' }).format(d);
                        return `${datePart} ${timePart} UTC`;
                      })()
                    }</td>
                    <td className="px-3 py-2">{r.location.latitude.toFixed(3)}, {r.location.longitude.toFixed(3)}</td>
                    <td className="px-3 py-2">{r.temperature2m.toFixed(1)}</td>
                    <td className="px-3 py-2">{r.relativeHumidity2m.toFixed(0)}</td>
                    <td className="px-3 py-2">{r.windSpeed10m.toFixed(1)}</td>
                    <td className="px-3 py-2">{r.precipitation.toFixed(1)}</td>
                    <td className="px-3 py-2">{r.weatherCode}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>Sem dados no período.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-600">Total: {total}</div>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
            <div className="text-sm">Página {page} de {totalPages}</div>
            <Button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Próxima</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
