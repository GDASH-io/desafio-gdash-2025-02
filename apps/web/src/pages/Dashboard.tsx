import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
  Moon,
  Snowflake,
  Droplets,
  Wind,
  RefreshCw,
  Users,
  LogOut,
  Bot,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  TrendingUp,
  Sunrise,
  Sunset,
  Thermometer,
  FileSpreadsheet,
  FileText,
  Download,
  Clock,
  Loader2,
} from 'lucide-react';
import api from '../lib/api';
import { authService } from '../lib/auth';

interface WeatherLog {
  _id: string;
  city: string;
  ts: string;
  temperature: number;
  windspeed: number;
  humidity: number;
}

interface WeatherAnalysis {
  comfortScore: number;
  comfortLevel: string;
  comfortEmoji: string;
  dayClassification: string;
  dayEmoji: string;
  tempTrend: 'subindo' | 'estável' | 'caindo';
  humidityTrend: 'subindo' | 'estável' | 'caindo';
  trendEmoji: string;
  stats: {
    avgTemp: number;
    maxTemp: number;
    minTemp: number;
    avgHumidity: number;
    avgWind: number;
    tempVariation: number;
  };
  feelsLike: number;
  uvIndex: string;
  alerts: Array<{
    type: 'danger' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    icon: string;
  }>;
  recommendations: string[];
}

interface InsightsResponse {
  insights: string;
  analysis: WeatherAnalysis | null;
  generatedAt: string;
  source: 'ai' | 'local';
}

// Função para obter ícone do clima
function getWeatherIcon(temp: number, humidity: number, hour: number) {
  const isNight = hour < 6 || hour >= 19;
  
  if (humidity > 80) {
    return <CloudRain className="w-10 h-10 text-blue-400" />;
  }
  if (humidity > 60 && temp < 25) {
    return isNight ? <Cloud className="w-10 h-10 text-gray-400" /> : <CloudSun className="w-10 h-10 text-yellow-400" />;
  }
  if (temp > 30) {
    return isNight ? <Moon className="w-10 h-10 text-yellow-200" /> : <Sun className="w-10 h-10 text-yellow-400" />;
  }
  if (temp > 20) {
    return isNight ? <Moon className="w-10 h-10 text-yellow-200" /> : <Sun className="w-10 h-10 text-yellow-400" />;
  }
  if (temp < 15) {
    return isNight ? <Snowflake className="w-10 h-10 text-blue-300" /> : <Cloud className="w-10 h-10 text-gray-400" />;
  }
  return isNight ? <Moon className="w-10 h-10 text-yellow-200" /> : <Sun className="w-10 h-10 text-yellow-400" />;
}

// Componente de ícone SVG do sol animado
function AnimatedSunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      {/* Raios */}
      <g className="animate-spin-slow" style={{ transformOrigin: '50px 50px', animation: 'spin 20s linear infinite' }}>
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="10"
            x2="50"
            y2="20"
            stroke="#FCD34D"
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${i * 45} 50 50)`}
          />
        ))}
      </g>
      {/* Sol */}
      <circle cx="50" cy="50" r="22" fill="#FBBF24" />
      <circle cx="50" cy="50" r="18" fill="#FCD34D" />
    </svg>
  );
}

// Componente de ícone SVG de nuvem animada (Nublado)
function AnimatedCloudyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(5px); }
          }
          @keyframes float-reverse {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-5px); }
          }
        `}
      </style>
      {/* Nuvem de fundo */}
      <g style={{ animation: 'float 4s ease-in-out infinite' }}>
        <ellipse cx="35" cy="55" rx="18" ry="14" fill="#94A3B8" />
        <ellipse cx="55" cy="48" rx="22" ry="18" fill="#94A3B8" />
        <ellipse cx="70" cy="58" rx="16" ry="12" fill="#94A3B8" />
        <rect x="25" y="52" width="55" height="16" fill="#94A3B8" />
      </g>
      {/* Nuvem principal */}
      <g style={{ animation: 'float-reverse 3s ease-in-out infinite' }}>
        <ellipse cx="30" cy="60" rx="20" ry="16" fill="#CBD5E1" />
        <ellipse cx="50" cy="50" rx="25" ry="20" fill="#CBD5E1" />
        <ellipse cx="72" cy="60" rx="18" ry="14" fill="#CBD5E1" />
        <rect x="20" y="56" width="60" height="18" fill="#CBD5E1" />
      </g>
    </svg>
  );
}

// Componente de ícone SVG de chuva animada
function AnimatedRainyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <style>
        {`
          @keyframes rain-drop {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(25px); opacity: 0; }
          }
        `}
      </style>
      {/* Nuvem */}
      <g>
        <ellipse cx="30" cy="35" rx="18" ry="14" fill="#64748B" />
        <ellipse cx="50" cy="28" rx="22" ry="18" fill="#64748B" />
        <ellipse cx="70" cy="35" rx="16" ry="12" fill="#64748B" />
        <rect x="20" y="32" width="60" height="14" fill="#64748B" />
      </g>
      {/* Gotas de chuva */}
      {[
        { x: 25, delay: '0s' },
        { x: 40, delay: '0.3s' },
        { x: 55, delay: '0.6s' },
        { x: 70, delay: '0.2s' },
        { x: 32, delay: '0.5s' },
        { x: 62, delay: '0.4s' },
      ].map((drop, i) => (
        <line
          key={i}
          x1={drop.x}
          y1="52"
          x2={drop.x}
          y2="62"
          stroke="#60A5FA"
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            animation: `rain-drop 0.8s linear infinite`,
            animationDelay: drop.delay,
          }}
        />
      ))}
    </svg>
  );
}

// Componente de ícone SVG de trovoada animada
function AnimatedStormIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <style>
        {`
          @keyframes lightning {
            0%, 90%, 100% { opacity: 0; }
            92%, 94%, 96% { opacity: 1; }
            93%, 95% { opacity: 0.3; }
          }
          @keyframes storm-rain {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(20px); opacity: 0; }
          }
          @keyframes rumble {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-1px); }
            75% { transform: translateX(1px); }
          }
        `}
      </style>
      {/* Nuvem escura */}
      <g style={{ animation: 'rumble 0.3s ease-in-out infinite' }}>
        <ellipse cx="30" cy="30" rx="18" ry="14" fill="#475569" />
        <ellipse cx="50" cy="22" rx="24" ry="20" fill="#475569" />
        <ellipse cx="72" cy="30" rx="18" ry="14" fill="#475569" />
        <rect x="18" y="26" width="64" height="16" fill="#475569" />
      </g>
      {/* Raio */}
      <polygon
        points="50,42 42,58 48,58 44,78 58,52 50,52 56,42"
        fill="#FBBF24"
        style={{ animation: 'lightning 2s ease-in-out infinite' }}
      />
      {/* Gotas de chuva */}
      {[
        { x: 22, delay: '0s' },
        { x: 35, delay: '0.2s' },
        { x: 65, delay: '0.15s' },
        { x: 78, delay: '0.3s' },
      ].map((drop, i) => (
        <line
          key={i}
          x1={drop.x}
          y1="48"
          x2={drop.x}
          y2="56"
          stroke="#60A5FA"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            animation: `storm-rain 0.6s linear infinite`,
            animationDelay: drop.delay,
          }}
        />
      ))}
    </svg>
  );
}

// Componente de ícone SVG de lua animada (Noite)
function AnimatedMoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <style>
        {`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1); }
          }
          @keyframes moon-glow {
            0%, 100% { filter: drop-shadow(0 0 8px rgba(253, 230, 138, 0.5)); }
            50% { filter: drop-shadow(0 0 15px rgba(253, 230, 138, 0.8)); }
          }
        `}
      </style>
      {/* Estrelas */}
      {[
        { x: 20, y: 25, delay: '0s', size: 2 },
        { x: 75, y: 20, delay: '0.5s', size: 2.5 },
        { x: 85, y: 45, delay: '1s', size: 1.5 },
        { x: 15, y: 60, delay: '0.7s', size: 2 },
        { x: 30, y: 15, delay: '1.2s', size: 1.5 },
      ].map((star, i) => (
        <circle
          key={i}
          cx={star.x}
          cy={star.y}
          r={star.size}
          fill="#FDE68A"
          style={{
            animation: `twinkle 2s ease-in-out infinite`,
            animationDelay: star.delay,
          }}
        />
      ))}
      {/* Lua */}
      <g style={{ animation: 'moon-glow 3s ease-in-out infinite' }}>
        <circle cx="55" cy="50" r="25" fill="#FDE68A" />
        <circle cx="45" cy="50" r="22" fill="#1E293B" />
      </g>
    </svg>
  );
}

// Componente de ícone SVG de parcialmente nublado animado
function AnimatedPartlyCloudyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <style>
        {`
          @keyframes cloud-drift {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(3px); }
          }
          @keyframes sun-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
      {/* Sol atrás */}
      <g style={{ animation: 'sun-pulse 3s ease-in-out infinite' }}>
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="30"
            y1="15"
            x2="30"
            y2="22"
            stroke="#FCD34D"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${i * 45} 30 35)`}
          />
        ))}
        <circle cx="30" cy="35" r="14" fill="#FBBF24" />
      </g>
      {/* Nuvem na frente */}
      <g style={{ animation: 'cloud-drift 4s ease-in-out infinite' }}>
        <ellipse cx="45" cy="60" rx="20" ry="14" fill="#E2E8F0" />
        <ellipse cx="65" cy="52" rx="22" ry="16" fill="#E2E8F0" />
        <ellipse cx="82" cy="60" rx="14" ry="10" fill="#E2E8F0" />
        <rect x="35" y="56" width="55" height="14" fill="#E2E8F0" />
      </g>
    </svg>
  );
}

// Função para determinar o ícone animado baseado nas condições climáticas
function getAnimatedWeatherIcon(temp: number, humidity: number, windspeed: number, hour: number) {
  const isNight = hour < 6 || hour >= 19;
  
  // Trovoada: umidade muito alta + vento forte
  if (humidity > 85 && windspeed > 30) {
    return <AnimatedStormIcon className="w-32 h-32" />;
  }
  
  // Chuva: umidade alta
  if (humidity > 80) {
    return <AnimatedRainyIcon className="w-32 h-32" />;
  }
  
  // Noite
  if (isNight) {
    if (humidity > 60) {
      return <AnimatedCloudyIcon className="w-32 h-32" />;
    }
    return <AnimatedMoonIcon className="w-32 h-32" />;
  }
  
  // Nublado: umidade média-alta ou temperatura mais baixa
  if (humidity > 65 || temp < 20) {
    return <AnimatedCloudyIcon className="w-32 h-32" />;
  }
  
  // Parcialmente nublado
  if (humidity > 50 && humidity <= 65) {
    return <AnimatedPartlyCloudyIcon className="w-32 h-32" />;
  }
  
  // Sol: tempo bom
  return <AnimatedSunIcon className="w-32 h-32" />;
}

// Função para obter a descrição do clima
function getWeatherDescription(temp: number, humidity: number, windspeed: number, hour: number): string {
  const isNight = hour < 6 || hour >= 19;
  
  if (humidity > 85 && windspeed > 30) {
    return 'Tempestade';
  }
  if (humidity > 80) {
    return 'Chuvoso';
  }
  if (isNight) {
    return humidity > 60 ? 'Noite Nublada' : 'Noite Clara';
  }
  if (humidity > 65 || temp < 20) {
    return 'Nublado';
  }
  if (humidity > 50 && humidity <= 65) {
    return 'Parcialmente Nublado';
  }
  if (temp > 30) {
    return 'Muito Quente';
  }
  return 'Ensolarado';
}

// Função para obter ícone do alerta
function getAlertIcon(type: string) {
  switch (type) {
    case 'danger':
      return <AlertTriangle className="w-4 h-4" />;
    case 'warning':
      return <AlertCircle className="w-4 h-4" />;
    case 'success':
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
}

export default function Dashboard() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightsData, setInsightsData] = useState<InsightsResponse | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Atualiza o relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadLogs();
  }, [navigate]);

  const loadLogs = async () => {
    try {
      const { data } = await api.get<WeatherLog[]>('/weather/logs');
      setLogs(data);
      loadInsights();
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    setLoadingInsights(true);
    try {
      const { data } = await api.get<InsightsResponse>('/weather/insights');
      setInsightsData(data);
    } catch (err) {
      console.error('Erro ao carregar insights:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const { data } = await api.get('/weather/export.csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'weather-logs.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erro ao exportar CSV:', err);
    }
  };

  const handleExportXLSX = async () => {
    try {
      const { data } = await api.get('/weather/export.xlsx', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'weather-logs.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erro ao exportar XLSX:', err);
    }
  };

  // Dados para o gráfico
  const chartData = useMemo(() => {
    return [...logs].reverse().slice(-12).map((log) => ({
      time: new Date(log.ts).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      temp: log.temperature,
      humidity: log.humidity,
    }));
  }, [logs]);

  // Previsão por hora (últimos registros)
  const hourlyForecast = useMemo(() => {
    return logs.slice(0, 5).map((log) => {
      const date = new Date(log.ts);
      return {
        time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        temp: log.temperature,
        wind: log.windspeed,
        humidity: log.humidity,
        hour: date.getHours(),
      };
    });
  }, [logs]);

  // Dados atuais
  const current = logs[0];
  const analysis = insightsData?.analysis;

  // Formatar data atual
  const formatDate = (date: Date) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
          <p className="text-gray-600 font-medium">Carregando dados climáticos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 p-6">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sun className="w-6 h-6 text-gray-800" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Weather Dashboard</h1>
              <p className="text-sm text-gray-500">GDASH Challenge 2025</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={loadLogs}
              className="px-4 py-2 bg-gray-700 text-white rounded-full text-sm font-medium hover:bg-gray-600 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
            <button
              onClick={() => navigate('/users')}
              className="px-4 py-2 bg-gray-700 text-white rounded-full text-sm font-medium hover:bg-gray-600 transition flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Usuários
            </button>
            <button
              onClick={authService.logout}
              className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* City & Time Card */}
          <div className="bg-gray-700 rounded-3xl p-8 text-white flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-6">{current?.city || 'Penápolis'}</h1>
            <div className="text-7xl font-light tracking-tight mb-2">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-gray-400 text-lg">{formatDate(currentTime)}</p>
          </div>

          {/* Main Weather Card */}
          <div className="lg:col-span-2 bg-gray-700 rounded-3xl p-8 text-white">
            <div className="grid grid-cols-3 gap-6 h-full">
              {/* Temperature */}
              <div className="flex flex-col justify-center">
                <div className="text-6xl font-light text-yellow-400 mb-1">
                  {current?.temperature.toFixed(0) || '--'}°C
                </div>
                <p className="text-gray-400">
                  Sensação: <span className="text-yellow-400">{analysis?.feelsLike?.toFixed(0) || current?.temperature.toFixed(0) || '--'}°C</span>
                </p>
                <div className="mt-4 space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Sunrise className="w-4 h-4 text-orange-400" />
                    <span>Nascer do sol</span>
                    <span className="text-white">06:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sunset className="w-4 h-4 text-orange-500" />
                    <span>Pôr do sol</span>
                    <span className="text-white">18:30</span>
                  </div>
                </div>
              </div>

              {/* Weather Icon - Dinâmico baseado nas condições */}
              <div className="flex flex-col items-center justify-center">
                {current ? 
                  getAnimatedWeatherIcon(
                    current.temperature, 
                    current.humidity, 
                    current.windspeed, 
                    new Date(current.ts).getHours()
                  ) : 
                  <AnimatedSunIcon className="w-32 h-32" />
                }
                <p className="text-xl font-medium mt-2">
                  {current ? 
                    getWeatherDescription(
                      current.temperature, 
                      current.humidity, 
                      current.windspeed, 
                      new Date(current.ts).getHours()
                    ) : 
                    'Aguardando...'
                  }
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Humidity */}
                <div className="bg-gray-800/50 rounded-2xl p-4 text-center">
                  <Droplets className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{current?.humidity.toFixed(0) || '--'}%</div>
                  <div className="text-xs text-gray-400">Umidade</div>
                </div>
                {/* Wind */}
                <div className="bg-gray-800/50 rounded-2xl p-4 text-center">
                  <Wind className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{current?.windspeed.toFixed(0) || '--'}<span className="text-sm">km/h</span></div>
                  <div className="text-xs text-gray-400">Vento</div>
                </div>
                {/* Comfort */}
                <div className="bg-gray-800/50 rounded-2xl p-4 text-center">
                  <Thermometer className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{analysis?.comfortScore || '--'}</div>
                  <div className="text-xs text-gray-400">Conforto</div>
                </div>
                {/* UV */}
                <div className="bg-gray-800/50 rounded-2xl p-4 text-center">
                  <Sun className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <div className="text-xl font-bold">{analysis?.uvIndex?.split(' ')[0] || 'Médio'}</div>
                  <div className="text-xs text-gray-400">UV</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Insights & Forecast */}
          <div className="bg-gray-700 rounded-3xl p-6 text-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-yellow-400" />
              <span>Análise IA</span>
              {loadingInsights && <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />}
            </h2>
            <div className="space-y-3 text-sm">
              {analysis?.alerts?.slice(0, 3).map((alert, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl ${
                    alert.type === 'danger' ? 'bg-red-500/20 text-red-300' :
                    alert.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                    alert.type === 'success' ? 'bg-green-500/20 text-green-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {getAlertIcon(alert.type)}
                    <span>{alert.title}</span>
                  </div>
                  <p className="text-xs opacity-80 mt-1">{alert.message}</p>
                </div>
              ))}
              {(!analysis?.alerts || analysis.alerts.length === 0) && (
                <div className="p-3 rounded-xl bg-green-500/20 text-green-300">
                  <div className="flex items-center gap-2 font-medium">
                    <Sparkles className="w-4 h-4" />
                    <span>Clima Agradável</span>
                  </div>
                  <p className="text-xs opacity-80 mt-1">Condições favoráveis para atividades ao ar livre.</p>
                </div>
              )}
              
              {/* Recommendations */}
              {analysis?.recommendations && analysis.recommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <p className="text-gray-400 text-xs mb-2">Recomendações:</p>
                  {analysis.recommendations.slice(0, 2).map((rec, i) => (
                    <p key={i} className="text-xs text-gray-300">{rec}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hourly Forecast */}
          <div className="lg:col-span-2 bg-gray-700 rounded-3xl p-6 text-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Registros Recentes
            </h2>
            <div className="grid grid-cols-5 gap-3">
              {hourlyForecast.map((item, i) => (
                <div key={i} className="bg-gray-800 rounded-2xl p-4 text-center">
                  <p className="text-lg font-bold text-yellow-400">{item.time}</p>
                  <div className="my-3 flex justify-center">
                    {getWeatherIcon(item.temp, item.humidity, item.hour)}
                  </div>
                  <p className="text-2xl font-bold">{item.temp.toFixed(0)}°C</p>
                  <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-400">
                    <Wind className="w-3 h-3" />
                    <span>{item.wind.toFixed(0)}km/h</span>
                  </div>
                </div>
              ))}
              {hourlyForecast.length === 0 && (
                <div className="col-span-5 text-center py-8 text-gray-400">
                  Aguardando dados...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Temperature Chart */}
          <div className="bg-gray-700 rounded-3xl p-6 text-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              Temperatura ao Longo do Tempo
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" vertical={false} />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} unit="°C" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#FBBF24"
                  strokeWidth={3}
                  dot={{ fill: '#FBBF24', strokeWidth: 0 }}
                  name="Temperatura"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Export & Stats */}
          <div className="bg-gray-700 rounded-3xl p-6 text-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-yellow-400" />
              Estatísticas & Exportação
            </h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-green-400">{analysis?.stats?.maxTemp?.toFixed(1) || '--'}°</p>
                <p className="text-xs text-gray-400">Máxima</p>
              </div>
              <div className="bg-gray-800 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-yellow-400">{analysis?.stats?.avgTemp?.toFixed(1) || '--'}°</p>
                <p className="text-xs text-gray-400">Média</p>
              </div>
              <div className="bg-gray-800 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-400">{analysis?.stats?.minTemp?.toFixed(1) || '--'}°</p>
                <p className="text-xs text-gray-400">Mínima</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Exportar CSV
              </button>
              <button
                onClick={handleExportXLSX}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Exportar Excel
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-gray-700 rounded-3xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-400" />
              Histórico Completo
            </h2>
            <span className="text-sm text-gray-400">{logs.length} registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="py-3 px-4 text-left text-gray-400 font-medium">Data/Hora</th>
                  <th className="py-3 px-4 text-left text-gray-400 font-medium">Cidade</th>
                  <th className="py-3 px-4 text-right text-gray-400 font-medium">Temp</th>
                  <th className="py-3 px-4 text-right text-gray-400 font-medium">Umidade</th>
                  <th className="py-3 px-4 text-right text-gray-400 font-medium">Vento</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 10).map((log) => (
                  <tr key={log._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="py-3 px-4">{new Date(log.ts).toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-4">{log.city}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-yellow-400 font-medium">{log.temperature.toFixed(1)}°C</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-blue-400 font-medium">{log.humidity.toFixed(0)}%</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-gray-300">{log.windspeed.toFixed(1)} km/h</span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Weather Dashboard • GDASH Challenge 2025 • Penápolis, SP</p>
        </footer>
      </main>
    </div>
  );
}
