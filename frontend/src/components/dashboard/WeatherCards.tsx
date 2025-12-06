import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Droplets, Wind, CloudSun } from 'lucide-react';

interface WeatherCardsProps {
  latestData?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
  };
}

export function WeatherCards({ latestData }: WeatherCardsProps) {
  const formatCondition = (condition: string): string => {
    const conditions: Record<string, string> = {
      clear: 'Limpo',
      mainly_clear: 'Limpo',
      partly_cloudy: 'Parcial',
      overcast: 'Nublado',
      foggy: 'Nevoeiro',
      drizzle: 'Garoa',
      rainy: 'Chuva',
      snowy: 'Neve',
      thunderstorm: 'Tempestade',
    };
    return conditions[condition] || condition;
  };

  const cards = [
    {
      title: 'Temperatura',
      value: latestData ? `${latestData.temperature}°C` : '--',
      icon: Thermometer,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Umidade',
      value: latestData ? `${latestData.humidity}%` : '--',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Vento',
      value: latestData ? `${latestData.windSpeed} km/h` : '--',
      icon: Wind,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
    },
    {
      title: 'Condição',
      value: latestData ? formatCondition(latestData.condition) : '--',
      icon: CloudSun,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}