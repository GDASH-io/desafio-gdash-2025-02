import { useEffect, useState } from 'react';
import axios from 'axios';
import { parseISO, format } from 'date-fns';
import { Cloud, Droplet, Wind, Sun, CloudRain, CloudSnow, CloudLightning, ClipboardList, Smile, Bell, Film, Shirt, Activity, Heart } from 'lucide-react';
import DaySummaryCard from '../components/ai/DaySummaryCard';
import MoodInsights from '../components/ai/MoodInsights';
import SmartAlerts from '../components/ai/SmartAlerts';
import MovieRecommendations from '../components/ai/MovieRecommendations';
import WeatherHistory from '../components/ai/WeatherHistory';
import ExpandableCard from '../components/ui/expandable-card';
import CitySelector from '../components/weather/CitySelector';

interface HourlyForecast {
  time: string;
  temperature_2m: number;
  weathercode: number;
  precipitation_probability: number;
}

interface DailyForecast {
  time: string;
  weathercode: number;
  temperature_2m_max: number;
  temperature_2m_min: number;
}

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface AiInsightsData {
  weatherForecast: any;
  explainedWeather: string;
  healthAlerts: string[];
  smartAlerts: string[];
  activityRecommendations: string[];
  clothingSuggestions: string;
  detailedClothingSuggestions?: string[];
  daySummary: string;
  moodInsights: string;
  movieCriteria: {
    tema: string;
    generos_sugeridos: string[];
    tons: string[];
    popularidade_minima?: number;
    vote_average_min?: number;
    year_range?: {
      min?: number;
      max?: number;
    };
    description: string;
  };
  apparentTemperatureExplanation?: string;
  apparent_temperature?: number;
  uvIndexAlert?: {
    level: string;
    color: string;
    message: string;
  };
  uv_index?: number;
  healthAndWellnessConditions?: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const getWeatherIcon = (weathercode: number, isDay: boolean = true, size: number = 24) => {
  switch (weathercode) {
    case 0:
      return isDay ? <Sun size={size} style={{ color: 'var(--weather-sun)' }} /> : <Cloud size={size} style={{ color: 'var(--weather-cloudy)' }} />;
    case 1:
    case 2:
    case 3:
      return <Cloud size={size} style={{ color: 'var(--weather-cloudy)' }} />;
    case 45:
    case 48:
      return <Cloud size={size} style={{ color: 'var(--weather-cloudy)' }} />;
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      return <CloudRain size={size} style={{ color: 'var(--weather-rain)' }} />;
    case 71:
    case 73:
    case 75:
    case 77:
      return <CloudSnow size={size} style={{ color: 'var(--weather-cloudy)' }} />;
    case 80:
    case 81:
    case 82:
      return <CloudRain size={size} style={{ color: 'var(--weather-rain)' }} />;
    case 85:
    case 86:
      return <CloudSnow size={size} style={{ color: 'var(--weather-cloudy)' }} />;
    case 95:
    case 96:
    case 99:
      return <CloudLightning size={size} style={{ color: 'var(--weather-storm)' }} />;
    default:
      return <Cloud size={48} style={{ color: 'var(--weather-cloudy)' }} />;
  }
};

export function WeatherDashboard() {
  console.log('WeatherDashboard: Componente renderizado');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [movieRecommendations, setMovieRecommendations] = useState<Movie[]>([]);
  const [aiInsights, setAiInsights] = useState<AiInsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [genresLoaded, setGenresLoaded] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    const savedLocation = localStorage.getItem('current_location');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        if (location.city) {
          setSelectedCity(location.city);
          setUserLocation(null);
        } else if (location.latitude && location.longitude) {
          setUserLocation({ latitude: location.latitude, longitude: location.longitude });
          setSelectedCity(null);
        }
      } catch (err) {
        console.error('Erro ao carregar localização do localStorage:', err);
      }
    }
  }, []); 

  useEffect(() => {
    console.log('WeatherDashboard: useEffect (buscarGêneros) disparado');
    const buscarGêneros = async () => {
      console.log('buscarGêneros: Iniciado');
      try {
        await axios.get(`${API_BASE_URL}/api/tmdb/genres`);
        console.log('buscarGêneros: Gêneros buscados com sucesso, definindo genresLoaded como true');
        setGenresLoaded(true);
      } catch (err) {
        console.error('buscarGêneros: Erro ao buscar gêneros:', err);
        setGenresLoaded(true);
      }
    };
    buscarGêneros();
  }, []);

  useEffect(() => {
    if (genresLoaded && (userLocation || selectedCity)) {
      console.log('WeatherDashboard: Chamando buscarDadosClima...');
      fetchWeatherData();
    } else if (!userLocation && !selectedCity) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Geolocalização: Sucesso. Localização do usuário definida.');
          const location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
          setUserLocation(location);
          if (!selectedCity) {
            localStorage.setItem('current_location', JSON.stringify(location));
          }
        },
        (err) => {
          console.warn('Geolocalização: Permissão de localização negada ou falha ao obter localização. Usando localização padrão (Salvador, Brasil).', err);
          setUserLocation({ latitude: -12.9714, longitude: -38.5014 });
          setLoading(false);
        }
      );
    }
  }, [userLocation, selectedCity, genresLoaded]);

  const fetchWeatherData = async () => {
    console.log('buscarDadosClima: Iniciado');
    setLoading(true);
    setError(null);
    
    const usarCidade = selectedCity !== null;
    const parametroLocalizacao = usarCidade 
      ? `city=${encodeURIComponent(selectedCity!)}`
      : `latitude=${userLocation!.latitude}&longitude=${userLocation!.longitude}`;
    
    if (!userLocation && !selectedCity) {
      console.log('buscarDadosClima: Localização do usuário e cidade selecionada são nulas, retornando.');
      setLoading(false);
      return;
    }
    
    try {
      console.log('buscarDadosClima: Buscando previsão do tempo...');
      await axios.get(`${API_BASE_URL}/api/weather/forecast?${parametroLocalizacao}`);

      console.log('buscarDadosClima: Buscando insights da IA...');
      const respostaInsights = await axios.get<AiInsightsData>(`${API_BASE_URL}/api/weather/ai-insights?${parametroLocalizacao}`);
      setAiInsights(respostaInsights.data);
      console.log('buscarDadosClima: Insights da IA recebidos:', respostaInsights.data);

      console.log('buscarDadosClima: Definindo clima atual...');
      setCurrentWeather({
        temperature: respostaInsights.data.weatherForecast.current_weather.temperature,
        windspeed: respostaInsights.data.weatherForecast.current_weather.windspeed,
        weathercode: respostaInsights.data.weatherForecast.current_weather.weathercode,
        is_day: respostaInsights.data.weatherForecast.current_weather.is_day,
        humidity: respostaInsights.data.weatherForecast.hourly?.relativehumidity_2m?.[0] ?? null,
        precipitation_probability: respostaInsights.data.weatherForecast.hourly?.precipitation_probability?.[0] ?? null,
        apparent_temperature: respostaInsights.data.apparent_temperature ?? null,
        uv_index: respostaInsights.data.uv_index ?? null,
      });

      console.log('buscarDadosClima: Definindo previsão horária...');
      setHourlyForecast(respostaInsights.data.weatherForecast.hourly.time.map((time: string, index: number) => ({
        time: time,
        temperature_2m: respostaInsights.data.weatherForecast.hourly.temperature_2m[index],
        weathercode: respostaInsights.data.weatherForecast.hourly.weathercode[index],
        precipitation_probability: respostaInsights.data.weatherForecast.hourly.precipitation_probability[index],
      })));

      console.log('buscarDadosClima: Definindo previsão diária...');
      setDailyForecast(respostaInsights.data.weatherForecast.daily.time.map((time: string, index: number) => ({
        time: time,
        weathercode: respostaInsights.data.weatherForecast.daily.weathercode[index],
        temperature_2m_max: respostaInsights.data.weatherForecast.daily.temperature_2m_max[index],
        temperature_2m_min: respostaInsights.data.weatherForecast.daily.temperature_2m_min[index],
      })));

      console.log('buscarDadosClima: Verificando critérios de filmes...', respostaInsights.data.movieCriteria);
      if (respostaInsights.data.movieCriteria && respostaInsights.data.movieCriteria.generos_sugeridos.length > 0) {
        const locationParam = selectedCity 
          ? `city=${encodeURIComponent(selectedCity)}`
          : userLocation 
          ? `latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`
          : '';
        
        console.log('buscarDadosClima: Buscando filmes com critérios da IA...');
        const respostaFilmes = await axios.get(`${API_BASE_URL}/api/weather/movies-by-criteria?${locationParam}`);
        if (Array.isArray(respostaFilmes.data.movies)) {
          console.log('buscarDadosClima: Filmes recebidos:', respostaFilmes.data.movies.length);
          setMovieRecommendations(respostaFilmes.data.movies.map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            genre_ids: movie.genre_ids,
          })));
        } else {
          console.warn('buscarDadosClima: API retornou "movies" inesperado ou nulo.', respostaFilmes.data);
          setMovieRecommendations([]);
        }
      } else {
        console.log('buscarDadosClima: Nenhum critério de filme, definindo recomendações de filmes como array vazio.');
        setMovieRecommendations([]);
      }

    } catch (err) {
      setError('Falha ao buscar dados de clima ou recomendações.');
      console.error('buscarDadosClima: Erro:', err);
    } finally {
      console.log('buscarDadosClima: Finalizado, definindo loading como false');
      setLoading(false);
    }
  };

  console.log('WeatherDashboard: Renderizando. Carregando:', loading, 'Gêneros carregados:', genresLoaded, 'Localização:', userLocation, 'Erro:', error);
  
  if (loading || !genresLoaded) return <p>Carregando dados de clima e gêneros...</p>;
  
  if (error) return <p className="text-red-500">Erro: {error}</p>;

  if (!currentWeather || !aiInsights) return <p className="text-foreground">Não foi possível obter dados de clima ou insights de IA.</p>;

  const currentHour = new Date().getHours();
  const next24HoursForecast = hourlyForecast.filter((_, index) => index >= currentHour && index < currentHour + 24);

  return (
    <div className="w-full max-w-[1000px] mx-auto p-4 space-y-4">
      <div className="flex flex-col items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold text-[#E5E7EB] text-center">Painel de Clima e Recomendações</h2>
        <div className="w-full flex justify-center">
          <CitySelector 
            selectedCity={selectedCity} 
            onCityChange={(city) => {
              setSelectedCity(city);
              setUserLocation(null);
              localStorage.setItem('current_location', JSON.stringify({ city }));
            }} 
          />
        </div>
      </div>

      {currentWeather && aiInsights && (
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                {getWeatherIcon(currentWeather.weathercode, currentWeather.is_day === 1, 32)}
                <p className="text-3xl font-semibold text-[#E5E7EB]">{currentWeather.temperature}°C</p>
              </div>
              {aiInsights.apparent_temperature && aiInsights.apparent_temperature !== currentWeather.temperature && (
                <>
                  <span className="text-[#9CA3AF]">·</span>
                  <span className="text-sm font-medium text-[#00D9FF]">Sensação {aiInsights.apparent_temperature}°C</span>
                </>
              )}
            </div>
          </div>

          <div className="text-center mb-3">
            <p className="text-sm font-light text-[#9CA3AF]">
              Tema: <span className="text-[#E5E7EB] font-medium">{aiInsights?.movieCriteria.tema}</span> — {aiInsights?.movieCriteria.description}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-[#E5E7EB] text-sm">
            <div className="flex items-center space-x-1">
              <Droplet size={14} style={{ color: 'var(--weather-rain)' }} />
              <span className="font-light">{currentWeather.humidity ?? 'N/A'}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wind size={14} style={{ color: 'var(--weather-wind)' }} />
              <span className="font-light">{currentWeather.windspeed} km/h</span>
            </div>
            {currentWeather.precipitation_probability !== null && (
              <div className="flex items-center space-x-1">
                <CloudRain size={14} style={{ color: 'var(--weather-rain)' }} />
                <span className="font-light">{currentWeather.precipitation_probability}%</span>
              </div>
            )}
            {aiInsights.uv_index !== undefined && (
              <div className="flex items-center space-x-1">
                <Sun size={14} style={{ 
                  color: aiInsights.uvIndexAlert?.color === 'green' ? '#22c55e' : 
                         aiInsights.uvIndexAlert?.color === 'yellow' ? '#eab308' : 
                         aiInsights.uvIndexAlert?.color === 'orange' ? '#f97316' : '#ef4444'
                }} />
                <span className="font-light">UV {aiInsights.uv_index}</span>
                <span className="text-xs font-light" style={{
                  color: aiInsights.uvIndexAlert?.color === 'green' ? '#22c55e' : 
                         aiInsights.uvIndexAlert?.color === 'yellow' ? '#eab308' : 
                         aiInsights.uvIndexAlert?.color === 'orange' ? '#f97316' : '#ef4444'
                }}>({aiInsights.uvIndexAlert?.level})</span>
              </div>
            )}
          </div>
        </div>
      )}

      {hourlyForecast.length > 0 && (
        <div className="py-3 border-b border-white/5">
          <h3 className="text-xs font-medium text-[#9CA3AF] mb-2 uppercase tracking-wide">Previsão Horária</h3>
          <div className="flex overflow-x-auto space-x-4 pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {next24HoursForecast.map((hour, index) => (
              <div key={index} className="flex flex-col items-center flex-shrink-0 min-w-[60px] text-center">
                <p className="text-xs font-light text-[#9CA3AF] mb-1">{format(parseISO(hour.time), 'HH:mm')}</p>
                {getWeatherIcon(hour.weathercode, currentWeather?.is_day === 1, 20)}
                <p className="text-sm font-medium text-[#E5E7EB] mt-1">{Math.round(hour.temperature_2m)}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {dailyForecast.length > 0 && (
        <div className="py-3 border-b border-white/5">
          <h3 className="text-xs font-medium text-[#9CA3AF] mb-2 uppercase tracking-wide">Previsão Diária</h3>
          <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {dailyForecast.map((day, index) => {
              const isRainy = day.weathercode >= 51 && day.weathercode <= 82;
              return (
                <div 
                  key={index} 
                  className="flex flex-col items-center flex-shrink-0 w-[70px] text-center p-2 rounded-lg"
                  style={{
                    backgroundColor: isRainy ? 'rgba(41, 169, 244, 0.1)' : 'transparent',
                    border: isRainy ? '1px solid rgba(41, 169, 244, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <p className="text-xs font-medium text-[#E5E7EB] mb-1">{format(parseISO(day.time), 'dd/MM')}</p>
                  {getWeatherIcon(day.weathercode, true, 18)}
                  <p className="text-xs font-light text-[#E5E7EB] mt-1">{Math.round(day.temperature_2m_max)}° / {Math.round(day.temperature_2m_min)}°</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {aiInsights && (
        <div className="ai-insights-section space-y-2 mt-3">
          <div className="speech-bubble p-3 rounded-xl mb-2">
            <p className="text-sm font-light text-[#E5E7EB]">{aiInsights.explainedWeather}</p>
          </div>

          <ExpandableCard title="Resumo Inteligente do Dia" icon={ClipboardList}>
            <DaySummaryCard summary={aiInsights.daySummary} />
          </ExpandableCard>

          <ExpandableCard title="Alertas Inteligentes" icon={Bell}>
            <SmartAlerts healthAlerts={aiInsights.healthAlerts} smartAlerts={aiInsights.smartAlerts} />
          </ExpandableCard>

          {aiInsights.uvIndexAlert && (
            <ExpandableCard title="Índice UV – Alerta Inteligente" icon={Sun}>
              <div className="space-y-2">
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium inline-block`} style={{
                  backgroundColor: aiInsights.uvIndexAlert.color === 'green' ? '#22c55e20' : 
                                   aiInsights.uvIndexAlert.color === 'yellow' ? '#eab30820' : 
                                   aiInsights.uvIndexAlert.color === 'orange' ? '#f9731620' : '#ef444420',
                  color: aiInsights.uvIndexAlert.color === 'green' ? '#22c55e' : 
                         aiInsights.uvIndexAlert.color === 'yellow' ? '#eab308' : 
                         aiInsights.uvIndexAlert.color === 'orange' ? '#f97316' : '#ef4444'
                }}>
                  UV {aiInsights.uv_index} - {aiInsights.uvIndexAlert.level}
                </div>
                <p className="text-sm font-light text-[#E5E7EB]">{aiInsights.uvIndexAlert.message}</p>
              </div>
            </ExpandableCard>
          )}

          {aiInsights.healthAndWellnessConditions && aiInsights.healthAndWellnessConditions.length > 0 && (
            <ExpandableCard title="Condições de Saúde / Bem-Estar" icon={Heart}>
              <ul className="space-y-2">
                {aiInsights.healthAndWellnessConditions.map((condition, index) => (
                  <li key={index} className="text-sm font-light text-[#E5E7EB]">
                    {condition}
                  </li>
                ))}
              </ul>
            </ExpandableCard>
          )}

          {aiInsights.detailedClothingSuggestions && aiInsights.detailedClothingSuggestions.length > 0 && (
            <ExpandableCard title="Roupas Recomendadas" icon={Shirt}>
              <ul className="space-y-1.5">
                {aiInsights.detailedClothingSuggestions.map((item, index) => (
                  <li key={index} className="text-sm font-light text-[#E5E7EB]">
                    {item}
                  </li>
                ))}
              </ul>
            </ExpandableCard>
          )}

          {aiInsights.activityRecommendations && aiInsights.activityRecommendations.length > 0 && (
            <ExpandableCard title="Atividades Recomendadas para o Dia" icon={Activity}>
              <ul className="space-y-1.5">
                {aiInsights.activityRecommendations.slice(0, 6).map((activity, index) => (
                  <li key={index} className="text-sm font-light text-[#E5E7EB]">
                    • {activity}
                  </li>
                ))}
              </ul>
            </ExpandableCard>
          )}

          <ExpandableCard title="Insights de Humor" icon={Smile}>
            <MoodInsights insights={aiInsights.moodInsights} />
          </ExpandableCard>

          <ExpandableCard title="Recomendações de Filmes" icon={Film}>
            <MovieRecommendations
              mood={aiInsights.movieCriteria.tema}
              suggestions={aiInsights.movieCriteria.generos_sugeridos}
              description={aiInsights.movieCriteria.description}
              movies={movieRecommendations}
            />
          </ExpandableCard>

          <ExpandableCard title="Histórico de Clima + Insights da IA" icon={ClipboardList}>
            <WeatherHistory 
              city={selectedCity}
              latitude={!selectedCity ? userLocation?.latitude : undefined} 
              longitude={!selectedCity ? userLocation?.longitude : undefined} 
            />
          </ExpandableCard>
        </div>
      )}
    </div>
  );
}
