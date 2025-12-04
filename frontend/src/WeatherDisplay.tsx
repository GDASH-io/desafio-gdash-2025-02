import { motion, AnimatePresence } from "framer-motion";
import { Wind, Droplets, RefreshCw, Cpu, Cloud, Download, Gamepad2, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "./context/useAuth";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Label, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export interface WeatherLog {
  _id: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  insight: string;
  createdAt: string;
}

interface WeatherDisplayProps {
  logs?: WeatherLog[];
  loading?: boolean;
  onRefresh?: () => void;
  refreshError?: string;
}

export function WeatherDisplay({ logs: propLogs, loading: propLoading, onRefresh: propOnRefresh, refreshError: propRefreshError }: WeatherDisplayProps) {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<WeatherLog[]>(propLogs || []);
  const [loading, setLoading] = useState(propLoading || false);
  const [refreshError, setRefreshError] = useState(propRefreshError || '');
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(() => {
    // Recuperar lastRefreshTime do localStorage ao inicializar
    const stored = localStorage.getItem('lastWeatherRefreshTime');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [exportLoading, setExportLoading] = useState<'csv' | 'xlsx' | null>(null);

  const fetchWeather = async (isManual: boolean = false) => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;
    const REFRESH_COOLDOWN = 60000;

    if (isManual && lastRefreshTime > 0 && timeSinceLastRefresh < REFRESH_COOLDOWN) {
      const secondsRemaining = Math.ceil((REFRESH_COOLDOWN - timeSinceLastRefresh) / 1000);
      setRefreshError(`Aguarde ${secondsRemaining} segundo${secondsRemaining !== 1 ? 's' : ''}`);
      setTimeout(() => setRefreshError(''), 3000);
      return;
    }

    setRefreshError('');
    setLoading(true);
    try {
      const response = await fetch('/api/weather', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setLogs(data);
      setLastRefreshTime(now);
      // Persistir no localStorage
      localStorage.setItem('lastWeatherRefreshTime', now.toString());
    } catch (error) {
      console.error("❌ Erro ao buscar clima:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      setExportLoading(format);
      const response = await fetch(`/api/weather/export/${format}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) throw new Error('Erro ao exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `weather_data.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Erro ao exportar ${format}:`, error);
      setRefreshError(`Erro ao exportar ${format}`);
    } finally {
      setExportLoading(null);
    }
  };

  const onRefresh = propOnRefresh || (() => fetchWeather(true));
  const latest = logs[0];

  const rainData = latest ? [
    { name: 'Chance', value: latest.rainProbability },
    { name: 'Restante', value: 100 - latest.rainProbability },
  ] : [];

  const COLORS = ['#06b6d4', '#1e293b'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6 md:p-12 font-sans overflow-hidden">
      {/* Efeito de luz de fundo radial sutil */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl"></div>
      </div>

      {/* Glow atrás do card principal */}
      <div className="fixed -z-10 top-1/3 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-cyan-500/8 to-emerald-500/8 rounded-full blur-3xl opacity-30"></div>

      {/* Alert de Refresh Rate Limiting */}
      <AnimatePresence>
        {refreshError && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-slate-700/60 border border-amber-500/40 rounded-2xl px-6 py-4 backdrop-blur-xl shadow-xl max-w-sm w-full">
              <div className="flex items-center gap-3">
                <div className="text-xl">⏱️</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-300">{refreshError}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cabeçalho Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-4"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">GDASH</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 font-bold ml-2">Weather AI</span>
          </h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <Cpu size={16} className="text-emerald-400 animate-pulse" />
            Sistema de Monitoramento Inteligente
          </p>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          <Button
            onClick={() => navigate('/pokemon')}
            className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/50 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-yellow-500/20"
          >
            <Gamepad2 className="mr-2 h-4 w-4" />
            PokéAPI
          </Button>

          <Button
            onClick={onRefresh}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-emerald-600/50 disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Sincronizando...' : 'Atualizar Dados'}
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('csv')}
              disabled={exportLoading !== null}
              className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-blue-600/50 disabled:opacity-50"
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button
              onClick={() => handleExport('xlsx')}
              disabled={exportLoading !== null}
              className="bg-purple-600 hover:bg-purple-700 text-white border border-purple-500 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-purple-600/50 disabled:opacity-50"
            >
              <Download className="mr-2 h-4 w-4" />
              XLSX
            </Button>
            <Button
              onClick={logout}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white border border-red-500 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-red-600/50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Grid Principal */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* Painel de Destaque (Esquerda) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          {latest ? (
            <>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-15 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
                <Card className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 backdrop-blur-sm overflow-hidden rounded-3xl shadow-lg">
                  <CardContent className="flex flex-col items-center space-y-6 py-10 px-8">
                    {/* Temperatura Grande */}
                    <span className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-emerald-300 tracking-tighter drop-shadow-sm">
                      {latest.temperature.toFixed(0)}°
                    </span>

                    {/* Umidade, Vento e Chuva em linha */}
                    <div className="w-full flex justify-around text-center px-4 py-5 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-2xl border border-slate-600/50 backdrop-blur-sm">
                      <div className="flex-1">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Droplets size={22} className="text-cyan-400" />
                          <span className="text-3xl font-black text-white">{latest.humidity}%</span>
                        </div>
                        <p className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Umidade</p>
                      </div>
                      <div className="w-px bg-gradient-to-b from-transparent via-slate-500/50 to-transparent mx-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Wind size={22} className="text-emerald-400" />
                          <span className="text-3xl font-black text-white">{latest.windSpeed}</span>
                        </div>
                        <p className="text-xs text-slate-300 uppercase tracking-wider font-semibold">km/h</p>
                      </div>
                      <div className="w-px bg-gradient-to-b from-transparent via-slate-500/50 to-transparent mx-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Cloud size={22} className="text-blue-400" />
                          <span className="text-3xl font-black text-white">{latest.rainProbability}%</span>
                        </div>
                        <p className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Chuva</p>
                      </div>
                    </div>

                    {/* Insight da IA em destaque - Integrado */}
                    <div className="p-4 bg-gradient-to-br from-emerald-900/30 to-transparent border-b border-emerald-500/40 rounded-xl w-full backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3 text-emerald-300 text-xs font-bold uppercase tracking-widest">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-lg"
                        >
                          ✨
                        </motion.div>
                        <span>Análise IA Gemini</span>
                      </div>
                      <p className="text-emerald-100 italic text-sm leading-relaxed font-light">
                        "{latest.insight}"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de Chuva */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-15 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
                <Card className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 backdrop-blur-sm overflow-hidden rounded-3xl shadow-lg h-64">
                  <CardHeader className="pb-0 pt-4 px-6">
                    <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                      <Cloud size={20} />
                      Probabilidade de Chuva
                    </h3>
                  </CardHeader>
                  <CardContent className="h-full flex items-center justify-center pb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={rainData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {rainData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                          <Label
                            value={`${latest.rainProbability}%`}
                            position="center"
                            fill="#22d3ee"
                            style={{
                              fontSize: '24px',
                              fontWeight: 'bold',
                              fontFamily: 'sans-serif'
                            }}
                          />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="h-96 flex items-center justify-center text-slate-400 border border-dashed border-slate-600 rounded-3xl bg-slate-800/50 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-lg mb-2">📭 Aguardando dados...</p>
                <p className="text-sm">A temperatura aparecerá aqui</p>
              </div>
            </div>
          )}

          {/* Gráfico de Tendência de Temperatura */}
          {logs.length > 0 && (
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-xl opacity-15 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
              <Card className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 backdrop-blur-sm overflow-hidden rounded-3xl shadow-lg h-80">
                <CardHeader className="pb-0 pt-4 px-6">
                  <h3 className="text-lg font-semibold text-orange-300 flex items-center gap-2">
                    <span className="text-xl">📈</span>
                    Tendência de Temperatura
                  </h3>
                </CardHeader>
                <CardContent className="h-full pb-10 px-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[...logs].reverse()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis
                        dataKey="createdAt"
                        tickFormatter={(time: string) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        stroke="#94a3b8"
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        tick={{ fontSize: 12 }}
                        domain={['auto', 'auto']}
                        tickFormatter={(val: number) => `${val}°`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px', color: '#f1f5f9' }}
                        itemStyle={{ color: '#fdba74' }}
                        labelFormatter={(label: string) => new Date(label).toLocaleTimeString()}
                        formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperatura']}
                      />
                      <Area
                        type="monotone"
                        dataKey="temperature"
                        stroke="#f97316"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTemp)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Lista de Histórico (Direita) - Uma coluna */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-emerald-400">Histórico Recente</h3>
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-300 bg-emerald-900/40 font-semibold px-3 py-1 rounded-full">
              {logs.length} Registros
            </Badge>
          </div>

          {logs.length === 0 ? (
            <div className="h-96 flex items-center justify-center text-slate-400 border border-dashed border-slate-600 rounded-3xl bg-slate-800/50 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-lg mb-2">📭 Aguardando dados...</p>
                <p className="text-sm">Novos registros aparecem aqui a cada 60 segundos</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[800px] overflow-y-auto scrollbar-thin-transparent pr-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {logs.slice(0, 12).map((log, index) => (
                  <motion.div
                    key={log._id}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`rounded-2xl shadow-md backdrop-blur-sm transition-all duration-300 group ${index === 0
                      ? 'bg-gradient-to-br from-emerald-900/40 to-slate-800/40 border border-emerald-500/60 hover:border-emerald-500/80'
                      : 'bg-gradient-to-br from-slate-700/40 to-slate-800/40 border-0 hover:from-slate-700/50 hover:to-slate-800/50 hover:border hover:border-emerald-500/40'
                      }`}>
                      <CardHeader className="pb-2 pt-3 px-4">
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary" className="bg-slate-700/70 text-slate-300 group-hover:text-emerald-300 transition-colors text-xs rounded-lg border border-slate-600/50">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </Badge>
                          <span className="text-xl font-black text-white">{log.temperature}°</span>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-3">
                        <div className="flex gap-4 text-sm font-semibold mb-2">
                          <div className="flex items-center gap-1.5">
                            <Droplets size={16} className="text-cyan-400" />
                            <span className="text-white">{log.humidity}%</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Wind size={16} className="text-emerald-400" />
                            <span className="text-white">{log.windSpeed} km/h</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Cloud size={16} className="text-blue-400" />
                            <span className="text-white">{log.rainProbability}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-emerald-200/75 line-clamp-2 group-hover:line-clamp-3 transition-all">
                          💡 {log.insight}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}