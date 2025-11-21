import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../app/api';

interface WeatherLog {
  _id: string;
  timestamp: string;
  city: string;
  temperature_c: number;
  relative_humidity: number;
  wind_speed_m_s: number;
  estimated_irradiance_w_m2?: number;
  pv_derating_pct?: number;
  precipitation_mm: number;
  clouds_percent: number;
}

export default function RecordsTable() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (fromDate) params.start = fromDate;
      if (toDate) params.end = toDate;

      const response = await api.get('/weather/logs', { params });
      // A resposta pode vir como array direto ou como objeto com data
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setLogs(data);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      console.error('Erro ao carregar registros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, fromDate, toDate]);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const params: any = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const response = await api.get(`/weather/export.${format}`, {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `weather-logs.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error(`Erro ao exportar ${format}:`, err);
      alert(`Erro ao exportar ${format.toUpperCase()}`);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Registros Climáticos</h1>
            <p className="text-muted-foreground">Histórico de dados coletados</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')}>
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('xlsx')}>
              Exportar XLSX
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">De</label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Até</label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                    setPage(1);
                  }}
                >
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum registro encontrado</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Data/Hora</th>
                        <th className="text-left p-2">Temp (°C)</th>
                        <th className="text-left p-2">Umidade (%)</th>
                        <th className="text-left p-2">Vento (m/s)</th>
                        <th className="text-left p-2">Irradiância (W/m²)</th>
                        <th className="text-left p-2">PV Derating (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log._id} className="border-b">
                          <td className="p-2">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </td>
                          <td className="p-2">{log.temperature_c.toFixed(1)}</td>
                          <td className="p-2">{log.relative_humidity.toFixed(0)}</td>
                          <td className="p-2">{log.wind_speed_m_s.toFixed(1)}</td>
                          <td className="p-2">
                            {log.estimated_irradiance_w_m2?.toFixed(0) || 'N/A'}
                          </td>
                          <td className="p-2">{log.pv_derating_pct?.toFixed(1) || '0'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


