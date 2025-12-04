import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Activity, TrendingUp, Clock } from 'lucide-react';

const Statistics = ({ stats, recentData }) => {
  if (!stats) {
    return null;
  }

  // Calcular médias das últimas 24h
  const calculateAverage = (field) => {
    if (!recentData || recentData.length === 0) return 0;
    const sum = recentData.reduce((acc, item) => acc + (item[field] || 0), 0);
    return (sum / recentData.length).toFixed(3);
  };

  // Calcular tendência
  const calculateTrend = (field) => {
    if (!recentData || recentData.length < 2) return 0;
    const recent = recentData.slice(0, 5);
    const older = recentData.slice(-5);
    const recentAvg = recent.reduce((acc, item) => acc + (item[field] || 0), 0) / recent.length;
    const olderAvg = older.reduce((acc, item) => acc + (item[field] || 0), 0) / older.length;
    return recentAvg - olderAvg;
  };

  const avgTemp = calculateAverage('temperature');
  const avgHumidity = calculateAverage('humidity');
  const tempTrend = calculateTrend('temperature');

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_records}</div>
          <p className="text-xs text-muted-foreground">Coletados até agora</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Temperatura Média (24h)</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgTemp}°C</div>
          <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Umidade Média (24h)</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgHumidity}%</div>
          <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tendência</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${tempTrend > 0 ? 'text-red-500' : 'text-blue-500'}`}>
            {tempTrend > 0 ? '+' : ''}
            {tempTrend.toFixed(1)}°C
          </div>
          <p className="text-xs text-muted-foreground">
            {tempTrend > 0 ? 'Aquecendo' : 'Esfriando'}
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-full lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status da Coleta</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div
              className={`h-3 w-3 rounded-full ${stats.collection_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
            ></div>
            <span className="text-sm font-medium">
              {stats.collection_active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Coleta a cada 5 minutos</p>
        </CardContent>
      </Card>
    </>
  );
};

export default Statistics;
