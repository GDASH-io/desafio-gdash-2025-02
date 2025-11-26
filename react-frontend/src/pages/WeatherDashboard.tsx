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
  weatherForecast: any; // Manter flexível ou definir uma interface mais detalhada se necessário
  explainedWeather: string;
  healthAlerts: string[];
  smartAlerts: string[];
  activityRecommendations: string[];
  clothingSuggestions: string;
  detailedClothingSuggestions?: string[];
  daySummary: string;
  moodInsights: string;
  movieRecommendations: {
    mood: string;
    suggestions: string[];
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

// Minha função para pegar o ícone certo do clima baseado no código.
const getWeatherIcon = (weathercode: number, isDay: boolean = true, size: number = 24) => {
  switch (weathercode) {
    case 0: // Céu limpo
      return isDay ? <Sun size={size} style={{ color: 'var(--weather-sun)' }} /> : <Cloud size={size} style={{ color: 'var(--weather-cloudy)' }} />;
    case 1: // Mainly clear
    case 2: // Partly cloudy
    case 3: // Overcast
      return <Cloud size={size} style={{ color: 'var(--weather-cloudy)' }} />;
    case 45: // Fog
    case 48: // Depositing rime fog
      return <Cloud size={size} style={{ color: 'var(--weather-cloudy)' }} />;
    case 51: // Drizzle: Light
    case 53: // Drizzle: Moderate
    case 55: // Drizzle: Dense intensity
    case 56: // Freezing Drizzle: Light
    case 57: // Freezing Drizzle: Dense intensity
    case 61: // Rain: Slight
    case 63: // Rain: Moderate
    case 65: // Rain: Heavy intensity
    case 66: // Freezing Rain: Light
    case 67: // Freezing Rain: Heavy intensity
      return <CloudRain size={size} style={{ color: 'var(--weather-rain)' }} />;
    case 71: // Snow fall: Slight
    case 73: // Snow fall: Moderate
    case 75: // Snow fall: Heavy intensity
    case 77: // Snow grains
      return <CloudSnow size={size} style={{ color: 'var(--weather-cloudy)' }} />;
    case 80: // Rain showers: Slight
    case 81: // Rain showers: Moderate
    case 82: // Rain showers: Violent
      return <CloudRain size={size} style={{ color: 'var(--weather-rain)' }} />;
    case 85: // Snow showers: Slight
    case 86: // Snow showers: Heavy
      return <CloudSnow size={size} style={{ color: 'var(--weather-cloudy)' }} />;
    case 95: // Thunderstorm: Slight or moderate
    case 96: // Thunderstorm with slight hail
    case 99: // Thunderstorm with heavy hail
      return <CloudLightning size={size} style={{ color: 'var(--weather-storm)' }} />;
    default:
      return <Cloud size={48} style={{ color: 'var(--weather-cloudy)' }} />;
  }
};

// Este é o meu componente principal do painel de clima e recomendações de filmes.
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

  useEffect(() => {
    console.log('WeatherDashboard: useEffect (fetchGenres) disparado');
    const fetchGenres = async () => {
      console.log('fetchGenres: Iniciado');
      try {
        await axios.get(`${API_BASE_URL}/api/tmdb/genres`);
        console.log('fetchGenres: Gêneros buscados com sucesso, setando genresLoaded para true');
        setGenresLoaded(true);
      } catch (err) {
        console.error("fetchGenres: Erro ao buscar gêneros:", err);
        setGenresLoaded(true); // Ainda assim marcar como carregado para não bloquear outros processos
      }
    };
    fetchGenres();
  }, []); // Array de dependências vazio para executar apenas uma vez

  // Efeito que busca os dados do clima e as recomendações quando a localização do usuário e os gêneros mudam.
  useEffect(() => {
    console.log('WeatherDashboard: useEffect (fetchWeatherData) disparado. userLocation:', userLocation, 'genresLoaded:', genresLoaded);
    if (userLocation && genresLoaded) {
      console.log('WeatherDashboard: Chamando fetchWeatherData...');
      fetchWeatherData();
    } else if (!userLocation) {
      // Tenta obter a localização se ainda não estiver definida
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Geolocation: Sucesso. userLocation definido.');
          setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        },
        (err) => {
          console.warn('Geolocation: Permissão de localização negada ou falha ao obter localização. Usando localização padrão.', err);
          // Fallback para uma localização padrão (Salvador, Brasil)
          setUserLocation({ latitude: -12.9714, longitude: -38.5014 });
          setLoading(false); // Definir como falso para permitir que o dashboard tente carregar com a localização padrão
        }
      );
    }
  }, [userLocation, genresLoaded]); // Re-executa se a localização ou o status de carregamento de gêneros mudar

  // Minha função que pega os IDs dos gêneros e retorna os nomes correspondentes.
  // const getGenreNames = (genreIds: number[]) => { ... }; // Removida

  // Minha função para definir a cor da nota do filme (verde, amarelo ou vermelho).
  // const getRatingColor = (voteAverage: number) => { ... }; // Removida

  // Função principal para buscar todos os dados de clima e recomendações de filmes.
  const fetchWeatherData = async () => {
    console.log('fetchWeatherData: Iniciado');
    setLoading(true);
    setError(null);
    if (!userLocation) {
      console.log('fetchWeatherData: userLocation é null, retornando.');
      setLoading(false); // Garantir que loading seja falso se não houver localização
      return;
    }
    try {
      console.log('fetchWeatherData: Buscando previsão do tempo...');
      // Busco a previsão do tempo para a localização atual do usuário.
      await axios.get(`${API_BASE_URL}/api/weather/forecast?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`);

      console.log('fetchWeatherData: Buscando insights da IA...');
      // Busco os insights da minha IA com base no clima atual.
      const aiInsightsResponse = await axios.get<AiInsightsData>(`${API_BASE_URL}/api/weather/ai-insights?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`);
      setAiInsights(aiInsightsResponse.data);
      console.log('fetchWeatherData: Insights da IA recebidos:', aiInsightsResponse.data);

      console.log('fetchWeatherData: Setando clima atual...');
      // Extraio o clima atual dos dados da previsão (agora de aiInsightsResponse.data.weatherForecast).
      setCurrentWeather({
        temperature: aiInsightsResponse.data.weatherForecast.current_weather.temperature,
        windspeed: aiInsightsResponse.data.weatherForecast.current_weather.windspeed,
        weathercode: aiInsightsResponse.data.weatherForecast.current_weather.weathercode,
        is_day: aiInsightsResponse.data.weatherForecast.current_weather.is_day,
        humidity: aiInsightsResponse.data.weatherForecast.hourly?.relativehumidity_2m?.[0] ?? null,
        precipitation_probability: aiInsightsResponse.data.weatherForecast.hourly?.precipitation_probability?.[0] ?? null,
        apparent_temperature: aiInsightsResponse.data.apparent_temperature ?? null,
        uv_index: aiInsightsResponse.data.uv_index ?? null,
      });

      console.log('fetchWeatherData: Setando previsão horária...');
      // Extraio a previsão horária e diária dos dados (agora de aiInsightsResponse.data.weatherForecast).
      setHourlyForecast(aiInsightsResponse.data.weatherForecast.hourly.time.map((time: string, index: number) => ({
        time: time,
        temperature_2m: aiInsightsResponse.data.weatherForecast.hourly.temperature_2m[index],
        weathercode: aiInsightsResponse.data.weatherForecast.hourly.weathercode[index],
        precipitation_probability: aiInsightsResponse.data.weatherForecast.hourly.precipitation_probability[index],
      })));

      console.log('fetchWeatherData: Setando previsão diária...');
      setDailyForecast(aiInsightsResponse.data.weatherForecast.daily.time.map((time: string, index: number) => ({
        time: time,
        weathercode: aiInsightsResponse.data.weatherForecast.daily.weathercode[index],
        temperature_2m_max: aiInsightsResponse.data.weatherForecast.daily.temperature_2m_max[index],
        temperature_2m_min: aiInsightsResponse.data.weatherForecast.daily.temperature_2m_min[index],
      })));

      // Se a IA sugerir algum gênero, busco filmes com base nesses gêneros.
      console.log('fetchWeatherData: Verificando sugestões de filmes...', aiInsightsResponse.data.movieRecommendations.suggestions);
      if (aiInsightsResponse.data.movieRecommendations.suggestions.length > 0) {
        const genreNames = aiInsightsResponse.data.movieRecommendations.suggestions.join(',');
        console.log('fetchWeatherData: Buscando filmes para gêneros:', genreNames);
        const moviesResponse = await axios.get(`${API_BASE_URL}/api/tmdb/by-genres?genres=${genreNames}`);
        if (Array.isArray(moviesResponse.data.results)) {
          console.log('fetchWeatherData: Filmes recebidos:', moviesResponse.data.results.length);
          setMovieRecommendations(moviesResponse.data.results.map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            genre_ids: movie.genre_ids,
          })));
        } else {
          console.warn("fetchWeatherData: API TMDB retornou 'results' inesperado ou nulo.", moviesResponse.data);
          setMovieRecommendations([]);
        }
      } else {
        console.log('fetchWeatherData: Nenhuma sugestão de gênero, setando movieRecommendations como array vazio.');
        setMovieRecommendations([]);
      }

    } catch (err) {
      setError('fetchWeatherData: Falha ao buscar dados de clima ou recomendações.');
      console.error(err);
    } finally {
      console.log('fetchWeatherData: Finalizado, setando loading para false');
      setLoading(false);
    }
  };

  console.log('WeatherDashboard: Renderizando. loading:', loading, 'genresLoaded:', genresLoaded, 'userLocation:', userLocation, 'error:', error);
  // Se estiver carregando, mostro uma mensagem.
  if (loading || !genresLoaded) return <p>Carregando dados de clima e gêneros...</p>;
  // Se tiver um erro, mostro a mensagem de erro.
  if (error) return <p className="text-red-500">Erro: {error}</p>;

  // Se não conseguir dados do clima, mostro uma mensagem.
  if (!currentWeather || !aiInsights) return <p className="text-foreground">Não foi possível obter dados de clima ou insights de IA.</p>;

  // Calculo a hora atual e filtro a previsão horária para as próximas 24 horas.
  const currentHour = new Date().getHours();
  const next24HoursForecast = hourlyForecast.filter((_, index) => index >= currentHour && index < currentHour + 24);

  // Aqui começa o layout principal do meu painel.
  return (
    <div className="w-full max-w-[1000px] mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-semibold text-[#E5E7EB] text-center mb-4">Painel de Clima e Recomendações</h2>

      {/* Esta seção mostra o clima atual e o humor sugerido pela IA. */}
      {currentWeather && aiInsights && (
        <div className="p-4 border-b border-white/5">
          {/* Linha principal: Ícone + Temperatura + Sensação Térmica */}
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

          {/* Mood em uma linha só */}
          <div className="text-center mb-3">
            <p className="text-sm font-light text-[#9CA3AF]">
              Mood: <span className="text-[#E5E7EB] font-medium">{aiInsights?.movieRecommendations.mood}</span> — {aiInsights?.movieRecommendations.description}
            </p>
          </div>

          {/* Indicadores em uma linha compacta */}
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

      {/* Previsão Horária e Diária movidas para logo abaixo do painel principal */}
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

      {/* Insights de IA agora envolvidos em ExpandableCard */}
      {aiInsights && (
        <div className="ai-insights-section space-y-2 mt-3">
          <div className="speech-bubble p-3 rounded-xl mb-2">
            <p className="text-sm font-light text-[#E5E7EB]">{aiInsights.explainedWeather}</p>
          </div>

          <ExpandableCard title="Resumo Inteligente do Dia" icon={ClipboardList}>
            <DaySummaryCard summary={aiInsights.daySummary} />
          </ExpandableCard>

          <ExpandableCard title="Insights de Humor" icon={Smile}>
            <MoodInsights insights={aiInsights.moodInsights} />
          </ExpandableCard>

          <ExpandableCard title="Alertas Inteligentes" icon={Bell}>
            <SmartAlerts healthAlerts={aiInsights.healthAlerts} smartAlerts={aiInsights.smartAlerts} />
          </ExpandableCard>

          {aiInsights.uvIndexAlert && (
            <ExpandableCard title="Índice UV - Alerta Inteligente" icon={Sun}>
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

          <ExpandableCard title="Recomendações de Filmes" icon={Film}>
            <MovieRecommendations
              mood={aiInsights.movieRecommendations.mood}
              suggestions={aiInsights.movieRecommendations.suggestions}
              description={aiInsights.movieRecommendations.description}
              movies={movieRecommendations}
            />
          </ExpandableCard>

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
                {aiInsights.activityRecommendations.map((activity, index) => (
                  <li key={index} className="text-sm font-light text-[#E5E7EB]">
                    • {activity}
                  </li>
                ))}
              </ul>
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

          <ExpandableCard title="Histórico de Clima + Insights da IA" icon={ClipboardList}>
            <WeatherHistory />
          </ExpandableCard>
        </div>
      )}
    </div>
  );
}
