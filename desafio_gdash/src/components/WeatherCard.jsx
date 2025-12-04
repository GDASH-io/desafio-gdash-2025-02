import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Droplets, Wind, Gauge } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WeatherCard = ({ data }) => {
  if (!data) {
    return (
      <Card className="col-span-full">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Carregando dados climáticos...</p>
        </CardContent>
      </Card>
    );
  }

  const getWeatherIcon = (condition) => {
    const icons = {
      ensolarado: '☀️',
      parcialmente_nublado: '⛅',
      nublado: '☁️',
      chuva: '🌧️',
      pancadas_leves: '🌦️',
      tempestade: '⛈️',
      neve: '❄️',
      neblina: '🌫️',
    };
    return icons[condition] || '🌤️';
  };

  const getConditionText = (condition) => {
    const translations = {
      ensolarado: 'Ensolarado',
      parcialmente_nublado: 'Parcialmente Nublado',
      nublado: 'Nublado',
      chuva: 'Chuva',
      pancadas_leves: 'Pancadas Leves',
      tempestade: 'Tempestade',
      neve: 'Neve',
      neblina: 'Neblina',
    };
    return translations[condition] || condition;
  };

  return (
    <Card className="col-span-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Condições Atuais</span>
          <span className="text-5xl">{getWeatherIcon(data.condition)}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {data.collected_at &&
            format(new Date(data.collected_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Temperatura */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <Gauge className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Temperatura</p>
              <p className="text-3xl font-bold">{data.temperature}°C</p>
            </div>
          </div>

          {/* Umidade */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Umidade</p>
              <p className="text-3xl font-bold">{data.humidity}%</p>
            </div>
          </div>

          {/* Vento */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Wind className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vento</p>
              <p className="text-3xl font-bold">{data.wind_speed} km/h</p>
            </div>
          </div>

          {/* Condição */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Cloud className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Condição</p>
              <p className="text-lg font-semibold">{getConditionText(data.condition)}</p>
            </div>
          </div>
        </div>

        {data.precipitation !== undefined && data.precipitation > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm">
              💧 Precipitação: <span className="font-semibold">{data.precipitation} mm</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
