import { useEffect, useState } from 'react';
import axios from 'axios';
import { parseISO, format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Cloud, Droplet, Wind, Sun, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';

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

interface WeatherRecommendation {
  mood: string;
  suggestions: string[];
  description: string;
}

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface Genre {
  id: number;
  name: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Minha função para pegar o ícone certo do clima baseado no código.
const getWeatherIcon = (weathercode: number, isDay: boolean = true) => {
  switch (weathercode) {
    case 0: // Céu limpo
      return isDay ? <Sun size={48} className="text-primary" /> : <Cloud size={48} className="text-muted-foreground" />;
    case 1: // Mainly clear
    case 2: // Partly cloudy
    case 3: // Overcast
      return <Cloud size={48} className="text-muted-foreground" />;
    case 45: // Fog
    case 48: // Depositing rime fog
      return <Cloud size={48} className="text-muted-foreground" />;
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
      return <CloudRain size={48} className="text-primary" />;
    case 71: // Snow fall: Slight
    case 73: // Snow fall: Moderate
    case 75: // Snow fall: Heavy intensity
    case 77: // Snow grains
      return <CloudSnow size={48} className="text-muted-foreground" />;
    case 80: // Rain showers: Slight
    case 81: // Rain showers: Moderate
    case 82: // Rain showers: Violent
      return <CloudRain size={48} className="text-primary" />;
    case 85: // Snow showers: Slight
    case 86: // Snow showers: Heavy
      return <CloudSnow size={48} className="text-muted-foreground" />;
    case 95: // Thunderstorm: Slight or moderate
    case 96: // Thunderstorm with slight hail
    case 99: // Thunderstorm with heavy hail
      return <CloudLightning size={48} className="text-primary" />;
    default:
      return <Cloud size={48} className="text-muted-foreground" />;
  }
};

// Este é o meu componente principal do painel de clima e recomendações de filmes.
export function WeatherDashboard() {
  // Estados para guardar os dados do clima atual, previsão horária e diária, filmes recomendados e a recomendação da IA.
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [movieRecommendations, setMovieRecommendations] = useState<Movie[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<WeatherRecommendation | null>(null);
  // Estados para controlar o carregamento, erros e a localização do usuário.
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  // Estado para armazenar os gêneros de filmes disponíveis.
  const [genres, setGenres] = useState<Genre[]>([]);

  // Efeito que busca os dados do clima e os gêneros dos filmes quando a localização do usuário muda.
  useEffect(() => {
    fetchWeatherData();
    fetchGenres();
  }, [userLocation]); // Re-executa se a localização mudar

  // Função assíncrona para buscar todos os gêneros de filmes do TMDB.
  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tmdb/genres`);
      setGenres(response.data.genres);
    } catch (err) {
      console.error("Erro ao buscar gêneros:", err);
    }
  };

  // Minha função que pega os IDs dos gêneros e retorna os nomes correspondentes.
  const getGenreNames = (genreIds: number[]) => {
    if (!genres.length || !genreIds) return [];
    return genreIds.map(id => genres.find(genre => genre.id === id)?.name).filter(Boolean);
  };

  // Minha função para definir a cor da nota do filme (verde, amarelo ou vermelho).
  const getRatingColor = (voteAverage: number) => {
    if (voteAverage >= 7) return "bg-green-500";
    if (voteAverage >= 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Função principal para buscar todos os dados de clima e recomendações de filmes.
  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {

      // Tento pegar a localização atual do usuário. Se não conseguir, aviso.
      if (!userLocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
          },
          (err) => {
            setError('Permissão de localização negada ou falha ao obter localização.');
            console.error('Erro ao obter localização:', err);
            setLoading(false);
          }
        );
        return; // Saio e executo de novo quando a localização estiver pronta
      }

      // Busco a previsão do tempo para a localização atual do usuário.
      const forecastResponse = await axios.get(`${API_BASE_URL}/api/weather/forecast?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`);
      const forecastData = forecastResponse.data;

      // Extraio o clima atual dos dados da previsão.
      setCurrentWeather({
        temperature: forecastData.current_weather.temperature,
        windspeed: forecastData.current_weather.windspeed,
        weathercode: forecastData.current_weather.weathercode,
        is_day: forecastData.current_weather.is_day,
        humidity: forecastData.hourly?.relativehumidity_2m?.[0] ?? null, // Umidade da hora atual, se disponível
        precipitation_probability: forecastData.hourly?.precipitation_probability?.[0] ?? null, // Probabilidade de chuva da hora atual, se disponível
      });

      // Extraio a previsão horária e diária dos dados.
      setHourlyForecast(forecastData.hourly.time.map((time: string, index: number) => ({
        time: time,
        temperature_2m: forecastData.hourly.temperature_2m[index],
        weathercode: forecastData.hourly.weathercode[index],
        precipitation_probability: forecastData.hourly.precipitation_probability[index],
      })));

      setDailyForecast(forecastData.daily.time.map((time: string, index: number) => ({
        time: time,
        weathercode: forecastData.daily.weathercode[index],
        temperature_2m_max: forecastData.daily.temperature_2m_max[index],
        temperature_2m_min: forecastData.daily.temperature_2m_min[index],
      })));

      // Preparo os dados do clima atual para enviar para a minha API de IA.
      const currentWeatherDataForAI = {
        temperature: forecastData.current_weather.temperature,
        weathercode: forecastData.current_weather.weathercode,
        precipitation_probability: forecastData.hourly?.precipitation_probability?.[0] ?? null, // Probabilidade de chuva da hora atual, se disponível
      };

      // Busco a recomendação da minha IA com base no clima atual.
      const aiResponse = await axios.post<WeatherRecommendation>(`${API_BASE_URL}/api/ai/recommendations`, currentWeatherDataForAI);
      setAiRecommendation(aiResponse.data);

      // Se a IA sugerir algum gênero, busco filmes com base nesses gêneros.
      if (aiResponse.data.suggestions.length > 0) {
        const genreNames = aiResponse.data.suggestions.join(',');
        const moviesResponse = await axios.get(`${API_BASE_URL}/api/tmdb/by-genres?genres=${genreNames}`);
        setMovieRecommendations(moviesResponse.data.results.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          genre_ids: movie.genre_ids,
        })));
      }

    } catch (err) {
      setError('Falha ao buscar dados de clima ou recomendações.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Se estiver carregando, mostro uma mensagem.
  if (loading) return <p>Carregando dados de clima...</p>;
  // Se tiver um erro, mostro a mensagem de erro.
  if (error) return <p className="text-red-500">Erro: {error}</p>;

  // Se não conseguir dados do clima, mostro uma mensagem.
  if (!currentWeather) return <p className="text-foreground">Não foi possível obter dados de clima.</p>;

  // Calculo a hora atual e filtro a previsão horária para as próximas 24 horas.
  const currentHour = new Date().getHours();
  const next24HoursForecast = hourlyForecast.filter((_, index) => index >= currentHour && index < currentHour + 24);

  // Aqui começa o layout principal do meu painel.
  return (
    <div className="w-full max-w-full mx-auto p-4 space-y-6">
      <h2 className="text-4xl font-bold text-foreground text-center mb-8">Painel de Clima e Recomendações</h2>

      {/* Esta seção mostra o clima atual e o humor sugerido pela IA. */}
      {currentWeather && aiRecommendation && (
        <div className="flex flex-col items-center justify-center p-4 border-b border-border last:border-b-0">
          <div className="flex items-center space-x-4 mb-4">
            {getWeatherIcon(currentWeather.weathercode, currentWeather.is_day === 1)}
            <p className="text-6xl font-extrabold">{currentWeather.temperature}°C</p>
          </div>
          <div className="text-center mb-4">
            <p className="text-2xl font-semibold">Mood: {aiRecommendation?.mood}</p>
            <p className="text-lg text-muted-foreground">{aiRecommendation?.description}</p>
          </div>
          <div className="flex justify-around w-full text-foreground border-t border-border pt-4">
            <div className="flex items-center space-x-1">
              <Droplet size={20} className="text-blue-400" /><span className="text-lg">{currentWeather.humidity ?? 'N/A'}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wind size={20} className="text-gray-400" /><span className="text-lg">{currentWeather.windspeed} km/h</span>
            </div>
            {currentWeather.precipitation_probability !== null && (
              <div className="flex items-center space-x-1">
                <CloudRain size={20} className="text-blue-400" /><span className="text-lg">{currentWeather.precipitation_probability}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Esta é a minha seção de previsão do tempo por horas, que dá para rolar para os lados. */}
      {hourlyForecast.length > 0 && (
        <div className="p-4 border-b border-border last:border-b-0">
          <h3 className="text-xl font-semibold mb-3 text-foreground">Previsão Horária</h3>
          <div className="flex overflow-x-auto space-x-4 pb-2">
            {next24HoursForecast.map((hour, index) => (
              <div key={index} className="flex flex-col items-center flex-shrink-0 w-20">
                <p className="text-sm text-muted-foreground">{format(parseISO(hour.time), 'HH:mm')}</p>
                {getWeatherIcon(hour.weathercode)}
                <p className="font-semibold text-lg text-foreground">{hour.temperature_2m}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Esta seção mostra a previsão para os próximos dias, também com rolagem lateral. */}
      {dailyForecast.length > 0 && (
        <div className="p-4 border-b border-border last:border-b-0">
          <h3 className="text-xl font-semibold mb-3 text-foreground">Previsão Diária</h3>
          {/* A div para a previsão diária agora permite rolagem horizontal */}
          <div className="flex overflow-x-auto space-x-4 pb-2">
            {dailyForecast.map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-shrink-0 w-24 text-center p-2 border border-border rounded-md bg-background">
                <p className="text-sm font-semibold text-foreground">{format(parseISO(day.time), 'dd/MM')}</p>
                {getWeatherIcon(day.weathercode)}
                <p className="text-md font-bold text-foreground">{day.temperature_2m_max}°C / {day.temperature_2m_min}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Esta é a minha área de filmes sugeridos, com cards grandes e todas as informações importantes. */}
      {movieRecommendations.length > 0 && (
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-3 text-foreground">Filmes Sugeridos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movieRecommendations.map((movie) => (
              <Link to={`/movies/${movie.id}`} key={movie.id} className="block h-full">
                <div className="bg-background border border-border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-auto object-cover aspect-[2/3]"
                  />
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h2 className="font-bold text-xl text-foreground mb-2 line-clamp-2 min-h-[3rem]">{movie.title}</h2>
                      <div className="flex flex-wrap gap-1 mb-2 min-h-[2rem]">
                        {getGenreNames(movie.genre_ids).map((genreName) => (
                          <span key={genreName} className="px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary-foreground">
                            {genreName}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1 mt-auto">
                        Ano: {format(parseISO(movie.release_date), 'yyyy')}
                      </p>
                      <div className="flex items-center mb-2">
                        <span className={`px-3 py-1 rounded-full text-white font-semibold ${getRatingColor(movie.vote_average)}`}>
                          ⭐ {movie.vote_average.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors duration-200">
                        Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
