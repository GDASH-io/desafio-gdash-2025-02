import { motion, AnimatePresence } from "framer-motion";
import { Wind, Droplets, RefreshCw, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface WeatherLog {
  _id: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  insight: string;
  createdAt: string;
}

interface WeatherDisplayProps {
  logs: WeatherLog[];
  loading: boolean;
  onRefresh: () => void;
}

export function WeatherDisplay({ logs, loading, onRefresh }: WeatherDisplayProps) {
  const latest = logs[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-950 text-white p-6 md:p-12 font-sans overflow-hidden">
      {/* Efeito de luz de fundo radial sutil */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Glow atrás do card principal (flutuação) */}
      <div className="fixed -z-10 top-1/3 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl opacity-40"></div>
      
      {/* Cabeçalho Animado */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-4"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">GDASH</span> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 font-bold ml-2">Weather AI</span>
          </h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <Cpu size={16} className="text-emerald-500 animate-pulse" />
            Sistema de Monitoramento Inteligente
          </p>
        </div>
        
        <Button 
          onClick={onRefresh} 
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Sincronizando...' : 'Atualizar Dados'}
        </Button>
      </motion.div>

      {/* Grid Principal */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Painel de Destaque (Esquerda) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          {latest ? (
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <Card className="relative bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-black/50 border border-white/15 backdrop-blur-xl overflow-hidden rounded-3xl shadow-2xl">
                <CardContent className="flex flex-col items-center space-y-6 py-10 px-8">
                  {/* Temperatura Grande */}
                  <span className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-emerald-300 tracking-tighter drop-shadow-lg">
                    {latest.temperature.toFixed(0)}°
                  </span>
                  
                  {/* Umidade e Vento em linha */}
                  <div className="w-full flex justify-around text-center px-4 py-5 bg-gradient-to-r from-slate-700/20 to-slate-600/20 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div className="flex-1">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Droplets size={22} className="text-cyan-400" />
                        <span className="text-3xl font-black text-white">{latest.humidity}%</span>
                      </div>
                      <p className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Umidade</p>
                    </div>
                    <div className="w-px bg-gradient-to-b from-transparent via-white/10 to-transparent mx-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Wind size={22} className="text-emerald-300" />
                        <span className="text-3xl font-black text-white">{latest.windSpeed}</span>
                      </div>
                      <p className="text-xs text-slate-300 uppercase tracking-wider font-semibold">km/h</p>
                    </div>
                  </div>
                  
                  {/* Insight da IA em destaque - Integrado */}
                  <div className="p-4 bg-gradient-to-br from-emerald-950/30 to-transparent border-b border-emerald-500/40 rounded-xl w-full backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3 text-emerald-200 text-xs font-bold uppercase tracking-widest">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-lg"
                      >
                        ✨
                      </motion.div>
                      <span>Análise IA Gemini</span>
                    </div>
                    <p className="text-emerald-100 italic text-sm leading-relaxed font-light text-emerald-100/90">
                      "{latest.insight}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-3xl bg-slate-800/30 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-lg mb-2">📭 Aguardando dados...</p>
                <p className="text-sm">A temperatura aparecerá aqui</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Lista de Histórico (Direita) - Uma coluna */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-emerald-300">Histórico Recente</h3>
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-200 bg-emerald-950/50 font-semibold px-3 py-1 rounded-full">
              {logs.length} Registros
            </Badge>
          </div>

          {logs.length === 0 ? (
            <div className="h-96 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-3xl bg-slate-800/30 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-lg mb-2">📭 Aguardando dados...</p>
                <p className="text-sm">Novos registros aparecem aqui a cada 60 segundos</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[640px] overflow-y-auto scrollbar-thin-transparent pr-2">
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
                    <Card className={`rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 group ${
                      index === 0 
                        ? 'bg-gradient-to-br from-emerald-950/50 to-slate-900/50 border border-emerald-500/60 hover:border-emerald-500/80' 
                        : 'bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-0 hover:from-slate-700/50 hover:to-slate-800/50 hover:border-emerald-500/40'
                    }`}>
                      <CardHeader className="pb-2 pt-3 px-4">
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary" className="bg-slate-950/70 text-slate-300 group-hover:text-emerald-300 transition-colors text-xs rounded-lg border border-slate-600/50">
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
                            <Wind size={16} className="text-emerald-300" />
                            <span className="text-white">{log.windSpeed} km/h</span>
                          </div>
                        </div>
                        <p className="text-xs text-emerald-100/75 line-clamp-2 group-hover:line-clamp-3 transition-all">
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
    </div>
  );
}