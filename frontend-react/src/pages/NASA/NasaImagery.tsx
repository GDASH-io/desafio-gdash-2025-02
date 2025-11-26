import { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LineChart from '../../components/Chart/LineChart';
import api from '../../app/api';
import { AxiosError } from 'axios';

interface NasaImageryItem {
  date: string;
  lat: number;
  lon: number;
  imageUrl: string | null;
}

interface NasaImageryResponse {
  page: number;
  limit: number;
  total: number;
  nextPage: number | null;
  prevPage: number | null;
  items: NasaImageryItem[];
}

export default function NasaImagery() {
  const [data, setData] = useState<NasaImageryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<boolean[]>([]);
  const [historicalData, setHistoricalData] = useState<NasaImageryItem[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setImageLoadError([]);
    try {
      const response = await api.get('/nasa', {
        params: { page, limit },
      });
      setData(response.data);
      setImageLoadError(new Array(response.data.items.length).fill(false));
    } catch (err: unknown) {
      let errorMessage = 'Erro desconhecido ao carregar dados da NASA.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as AxiosError;
        if (axiosError.response?.data && typeof axiosError.response.data === 'object' && 'message' in axiosError.response.data) {
          errorMessage = String(axiosError.response.data.message);
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const fetchHistoricalData = useCallback(async () => {
    try {
      // Buscar dados dos últimos 30 dias para o gráfico
      const response = await api.get('/nasa', {
        params: { page: 1, limit: 30 },
      });
      if (response.data && response.data.items) {
        setHistoricalData(response.data.items);
      }
    } catch (err) {
      console.error('Erro ao buscar dados históricos:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchHistoricalData();
  }, [fetchData, fetchHistoricalData]);

  const handleImageError = (index: number) => {
    setImageLoadError((prev) => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  };

  // Preparar dados para gráfico de disponibilidade de imagens
  const availabilityChartData = historicalData.length > 0 ? {
    labels: historicalData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }).reverse(),
    datasets: [
      {
        label: 'Disponibilidade de Imagens',
        data: historicalData.map(item => item.imageUrl ? 1 : 0).reverse(),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

  const availabilityRate = historicalData.length > 0
    ? (historicalData.filter(item => item.imageUrl).length / historicalData.length * 100).toFixed(1)
    : '0';

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🛰️ NASA Earth Imagery</h1>
            <p className="text-muted-foreground">
              Imagens de satélite da região de Coronel Fabriciano, MG
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Imagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Últimos 365 dias</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Disponibilidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{availabilityRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Coordenadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {data?.items[0]?.lat.toFixed(4) || '-19.5194'}, {data?.items[0]?.lon.toFixed(4) || '-42.6289'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Coronel Fabriciano, MG</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Disponibilidade */}
        {availabilityChartData && (
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidade de Imagens (Últimos 30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <LineChart data={availabilityChartData} />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                1 = Imagem disponível | 0 = Imagem não disponível
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Controles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Página</label>
                <Input
                  type="number"
                  min="1"
                  value={page}
                  onChange={(e) => setPage(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Itens por página</label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={limit}
                  onChange={(e) => setLimit(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">Carregando...</div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-destructive-foreground bg-destructive p-4 rounded-md">
                {error}
                <Button onClick={fetchData} className="ml-4" variant="secondary">
                  Tentar novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : data && data.items.length > 0 ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Imagens de Satélite</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {data.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Data</p>
                          <p className="font-medium text-lg">{new Date(item.date).toLocaleDateString('pt-BR', { 
                            weekday: 'long', 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          })}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Coordenadas</p>
                          <p className="font-medium">
                            {item.lat.toFixed(4)}, {item.lon.toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className="font-medium">
                            {item.imageUrl && !imageLoadError[index] ? (
                              <span className="text-green-600">✓ Imagem disponível</span>
                            ) : (
                              <span className="text-red-600">✗ Imagem não disponível</span>
                            )}
                          </p>
                        </div>
                      </div>
                      {item.imageUrl && !imageLoadError[index] ? (
                        <div className="mt-4">
                          <div className="relative rounded-lg overflow-hidden border shadow-lg">
                            <img
                              src={item.imageUrl}
                              alt={`Satellite imagery for ${item.date}`}
                              className="w-full h-auto"
                              onError={() => handleImageError(index)}
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <a
                              href={item.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm font-medium"
                            >
                              Ver imagem em tamanho completo →
                            </a>
                            <span className="text-xs text-muted-foreground">
                              Fonte: NASA Worldview
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-4 bg-muted rounded-lg text-center text-muted-foreground">
                          Não foi possível carregar a imagem para esta data.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Página {data.page} de {Math.ceil(data.total / data.limit)} | Total: {data.total} itens
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(data.prevPage || 1)}
                      disabled={!data.prevPage}
                    >
                      ← Anterior
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage(data.nextPage || 1)}
                      disabled={!data.nextPage}
                    >
                      Próxima →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
