import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import api from '../../app/api';

interface NasaImageryItem {
  date: string;
  lat: number;
  lon: number;
  imageUrl: string | null;
}

export default function NasaSatelliteView() {
  const [data, setData] = useState<NasaImageryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/nasa', {
          params: { page: 1, limit: 1 },
        });
        if (response.data?.items && response.data.items.length > 0) {
          setData(response.data.items[0]);
        }
      } catch (err: any) {
        console.error('Erro ao carregar imagem da NASA:', err);
        setError('Não foi possível carregar a imagem de satélite');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Atualizar a cada 30 minutos
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🛰️</span>
            Imagem de Satélite - NASA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Carregando imagem...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🛰️</span>
            Imagem de Satélite - NASA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            {error || 'Imagem não disponível'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🛰️</span>
          Imagem de Satélite - NASA
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Região de Coronel Fabriciano, MG - {new Date(data.date).toLocaleDateString('pt-BR')}
        </p>
      </CardHeader>
      <CardContent>
        {data.imageUrl ? (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
              <img
                src={data.imageUrl}
                alt={`Imagem de satélite ${data.date}`}
                className="w-full h-auto max-h-96 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'h-64 flex items-center justify-center bg-muted text-muted-foreground';
                  errorDiv.textContent = 'Imagem não disponível para esta data';
                  target.parentElement?.appendChild(errorDiv);
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Coordenadas</p>
                <p className="font-medium">{data.lat.toFixed(4)}, {data.lon.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium">{new Date(data.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <a
              href={data.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              Abrir imagem em tamanho completo →
            </a>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Imagem não disponível para esta data
          </div>
        )}
      </CardContent>
    </Card>
  );
}

