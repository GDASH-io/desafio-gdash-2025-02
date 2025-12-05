import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Wind, Droplets, Thermometer, Activity, LogOut } from 'lucide-react'; 

// Definição do tipo de dado que vem da API
interface WeatherLog {
  _id: string;
  city: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  createdAt: string;
}

function Dashboard() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [insight, setInsight] = useState('Analisando dados...');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate(); 

  // Função para buscar dados
  const fetchLogs = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:3000/weather/logs', {
        headers: {
          Authorization: `Bearer ${token}` 
        }
      });
      setLogs(response.data);
    } catch (error) {
      console.error("Erro ao buscar logs", error);
      setLoading(false);
    }
  };

  // Função para buscar insights
  const fetchInsights = async (token: string) => {
    try {
        const response = await axios.get('http://localhost:3000/weather/insights', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setInsight(response.data.insight);
    } catch (error) {
        console.error('Erro ao buscar insights', error);
    }
  };

  // Função para Exportar CSV
  const handleExport = async () => {
      try {
          const token = localStorage.getItem('access_token');
          if (!token) {
              navigate('/login');
              return;
          }
          
          const response = await axios.get('http://localhost:3000/weather/export.csv', {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
              responseType: 'blob',
          });

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'dados_clima.csv');
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
      } catch (error) {
          console.error('Erro ao exportar dados:', error);
          alert('Falha ao exportar. Tente logar novamente.');
      }
  };
  
  // LOGOUT MANUAL
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  // Roda ao iniciar e a cada 30 segundos
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          console.log('Token expirado ou inválido. Deslogando...');
          localStorage.removeItem('access_token');
          navigate('/login'); 
        }
        return Promise.reject(error);
      }
    );
    
    // Inicia a busca
    const token = localStorage.getItem('access_token');
    if (token) {
        fetchLogs(token).then(() => setLoading(false));
        fetchInsights(token);
        
        const interval = setInterval(() => {
            fetchLogs(token);
            fetchInsights(token);
        }, 3600000); // 1 hora
        
        // Função de limpeza do useEffect (roda ao desmontar)
        return () => {
            axios.interceptors.response.eject(interceptor);
            clearInterval(interval);
        };
    } else {
        setLoading(false);
        navigate('/login');
    }
  }, [navigate]); 

  // Se estiver carregando, mostra uma tela simples
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-blue-900">Carregando Dashboard...</div>
      </div>
    );
  }

  // Se não houver logs após o carregamento
  if (logs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-xl font-semibold text-red-500 mb-4">Aguardando dados de clima...</p>
          <p className="text-gray-600">O coletor Python está enviando dados. Os primeiros logs devem aparecer em breve.</p>
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">GDASH Weather</h1>
            <p className="text-gray-600">Monitoramento em Tempo Real & Insights IA</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-md"
            >
              Exportar CSV
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shadow-md"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </header>

        {/* LAYOUT DE CARTÕES */}
        {logs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 items-stretch">
            
            {/* Card de Temperatura*/}
            <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 flex flex-col justify-center items-center text-center">
                <div className="p-2 bg-blue-100 rounded-full mb-2">
                    <Thermometer className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Temp</p>
                  <p className="text-2xl font-bold text-gray-800">{logs[0].temperature}°C</p>
                </div>
            </div>

            {/* Card de Humidade*/}
            <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-md border-l-4 border-cyan-500 flex flex-col justify-center items-center text-center">
                <div className="p-2 bg-cyan-100 rounded-full mb-2">
                    <Droplets className="text-cyan-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Humidade</p>
                  <p className="text-2xl font-bold text-gray-800">{logs[0].humidity}%</p>
                </div>
            </div>

            {/* Card de Insight IA */}
            <div className="md:col-span-8 bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg shadow-md border-l-4 border-purple-600 flex flex-col h-64 md:h-auto relative"> 
              {/* Header do Insight */}
              <div className="flex items-center gap-3 mb-3 border-b border-purple-100 pb-2">
                <Activity className="text-purple-600 w-6 h-6" />
                <h3 className="text-md text-purple-800 font-bold uppercase tracking-wide">Análise Inteligente</h3>
              </div>
              
              {/* Conteúdo com Scroll Automático */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
                    {insight}
                </p>
              </div>
            </div>

          </div>
        )}


        {/* Tabela de Histórico */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-700">Histórico de Coleta</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-4">Data/Hora</th>
                  <th className="p-4">Temp (°C)</th>
                  <th className="p-4">Umidade (%)</th>
                  <th className="p-4">Vento (km/h)</th>
                  <th className="p-4">Condição</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="p-4">{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
                    <td className="p-4 font-medium text-blue-600">{log.temperature}°C</td>
                    <td className="p-4">{log.humidity}%</td>
                    <td className="p-4">{log.wind_speed}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-700">
                        {log.condition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;