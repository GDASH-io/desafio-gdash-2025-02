import { useEffect, useState, type FormEvent } from 'react';
import { WeatherChart } from './WeatherChart';

import dashboardLogo from './assets/logo.png';
import loginLogo from './assets/logo2.png';

interface WeatherData {
  _id: string;
  temp: number;
  humidity: number;
  wind_speed: number;
  collected_at: string;
  insight?: string;
  is_day?: number;
}

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

interface DashboardProps {
  onLogout: () => void;
}

const API_BASE_URL = 'http://localhost:3000';

function LoginScreen({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) throw new Error('Authentication failed');
      
      const data = await response.json();
      onLoginSuccess(data.access_token);
    } catch (err) {
      console.error(err);
      setError('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm border border-gray-100 p-2">
             <img src={loginLogo} alt="GDASH Logo" className="object-contain w-full h-full"/>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Bem-vindo</h1>
          <p className="text-gray-500 text-sm">Portal de Gestão GDASH</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-600 mb-2 text-xs font-bold uppercase tracking-wider">Email Corporativo</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3.5 text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition placeholder:text-gray-400" 
              placeholder="admin@gdash.io" 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2 text-xs font-bold uppercase tracking-wider">Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3.5 text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition placeholder:text-gray-400" 
              placeholder="••••••" 
              required 
            />
          </div>
          {error && <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3.5 rounded-lg transition duration-200 disabled:opacity-50 shadow-lg shadow-brand-primary/20"
          >
            {loading ? 'Acessando...' : 'Entrar na Plataforma'}
          </button>
        </form>
      </div>
    </div>
  );
}

function InsightSlider({ text }: { text: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [msgList, setMsgList] = useState<string[]>([]);

  useEffect(() => {
    const newMessages = text.split(/[.!]\s+/).filter(Boolean).map(msg => msg.replace(/[.!]$/, "") + ".");
    
    if (msgList.length === 0) { 
      setMsgList(newMessages); 
      setCurrentIndex(0); 
      return; 
    }
    
    if (JSON.stringify(newMessages) !== JSON.stringify(msgList)) {
        setFade(false);
        const timer = setTimeout(() => { 
            setMsgList(newMessages); 
            setCurrentIndex(0); 
            setFade(true); 
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [text, msgList]);

  useEffect(() => {
    if (msgList.length <= 1) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => { 
          setCurrentIndex((prev) => (prev + 1) % msgList.length); 
          setFade(true); 
      }, 500);
    }, 15000);
    return () => clearInterval(interval);
  }, [msgList]);

  return (
    <div className="h-16 flex items-center">
      <p className={`text-2xl text-white font-medium leading-snug transition-all duration-500 ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        "{msgList[currentIndex] || "Aguardando análise..."}"
      </p>
    </div>
  );
}

function Dashboard({ onLogout }: DashboardProps) {
  const [weatherList, setWeatherList] = useState<WeatherData[]>([]);
  const [latest, setLatest] = useState<WeatherData | null>(null);
  const [limit, setLimit] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCustomFilter, setIsCustomFilter] = useState(false);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => {
        if (!isCustomFilter) fetchData(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [limit, isCustomFilter, startDate, endDate]);

  const fetchData = (forceUpdate = false) => {
    let url = `${API_BASE_URL}/weather?limit=${limit}`;
    
    // Fix: Send local time string (appending seconds) to match Backend storage
    if (isCustomFilter && startDate && endDate) {
        url = `${API_BASE_URL}/weather?start=${startDate}:00&end=${endDate}:59&limit=0`;
    }

    fetch(url)
    .then(response => response.json())
    .then(data => {
        setWeatherList(data);
        if (data.length > 0) setLatest(data[0]);
    })
    .catch(error => { 
        console.error("Error fetching data:", error); 
    })
  };

  const handleQuickFilter = (val: number) => { 
      setIsCustomFilter(false); 
      setLimit(val); 
      setStartDate(''); 
      setEndDate(''); 
  };

  const handleDateFilter = () => { 
      if (startDate && endDate) { 
          setIsCustomFilter(true); 
          fetchData(true); 
      } 
  };
  
  const FilterButton = ({ label, val }: { label: string, val: number }) => (
    <button 
        onClick={() => handleQuickFilter(val)} 
        className={`px-4 py-2 text-xs font-bold transition-all border-r border-gray-200 last:border-r-0 first:rounded-l-lg last:rounded-r-lg ${!isCustomFilter && limit === val ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-8 flex flex-col xl:flex-row justify-between items-center gap-6 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4 w-full xl:w-auto justify-center xl:justify-start">
            <img src={dashboardLogo} alt="GDASH Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">GDASH <span className="text-brand-primary">Analytics</span></h1>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto justify-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <FilterButton label="15m" val={90} />
                <FilterButton label="1h" val={360} />
                <FilterButton label="6h" val={2160} />
                <FilterButton label="Todos" val={0} />
             </div>
             <div className="flex items-center gap-2 mx-2">
                <input 
                    type="datetime-local" 
                    className="bg-gray-50 border border-gray-300 text-gray-600 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition w-36 cursor-pointer hover:bg-white" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="text-gray-400 text-xs font-bold">➜</span>
                <input 
                    type="datetime-local" 
                    className="bg-gray-50 border border-gray-300 text-gray-600 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition w-36 cursor-pointer hover:bg-white" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <button 
                    onClick={handleDateFilter} 
                    className={`p-2 rounded-lg transition border ${isCustomFilter ? 'bg-brand-primary text-white border-brand-primary shadow-md' : 'bg-gray-100 text-gray-400 border-gray-200 hover:text-gray-600 hover:bg-white'}`} 
                    title="Filtrar por data"
                >
                    🔍
                </button>
             </div>
             <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <a href={`${API_BASE_URL}/weather/export/csv`} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-800 text-xs font-bold rounded-lg transition flex items-center gap-2 shadow-sm">📄 CSV</a>
                <a href={`${API_BASE_URL}/weather/export/xlsx`} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-brand-primary hover:text-green-700 text-xs font-bold rounded-lg transition flex items-center gap-2 shadow-sm">📊 Excel</a>
                <button onClick={onLogout} className="ml-2 px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 text-xs font-bold rounded-lg transition uppercase tracking-wider">SAIR</button>
             </div>
          </div>
        </header>

        {latest && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className={`md:col-span-3 p-8 rounded-xl shadow-lg relative overflow-hidden transition-all duration-500 text-white
                    ${latest.is_day === 1 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-400' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                    }`}>
                    
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-white/80">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        {isCustomFilter ? "Análise Histórica" : (latest.is_day === 1 ? "Insights para o Dia" : "Insights para a Noite")}
                    </h2>
                    <InsightSlider text={latest.insight || "Processando dados meteorológicos..."} />
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center relative">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Temperatura</span>
                    <div className={`text-6xl font-bold tracking-tighter ${latest.is_day === 1 ? 'text-gray-800' : 'text-indigo-600'}`}>
                        {latest.temp}°
                    </div>
                    <div className="mt-4 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium flex items-center gap-2 border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                        Juiz de Fora, MG
                    </div>
                </div>
            </div>
        )}

        <div className="transition-all duration-500 opacity-100">
            {weatherList.length > 0 ? <WeatherChart data={weatherList} /> : <div className="h-40 text-center text-gray-400 pt-10">Sem dados para o período...</div>}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-8">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-gray-800 font-bold text-sm tracking-wide">REGISTROS DETALHADOS</h3>
                  <span className="text-gray-500 text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">{weatherList.length} LOGS</span>
              </div>
              <div className="overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10 border-b border-gray-200">
                    <tr>
                        <th className="p-4">Horário</th>
                        <th className="p-4">Temp</th>
                        <th className="p-4">Umidade</th>
                        <th className="p-4">Vento</th>
                        <th className="p-4">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm font-mono text-gray-600">
                    {weatherList.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition duration-150 group cursor-default">
                        <td className="p-4 text-gray-500">{new Date(item.collected_at).toLocaleTimeString()}</td>
                        <td className="p-4 font-bold text-gray-800 group-hover:text-brand-primary transition">{item.temp}°C</td>
                        <td className="p-4 text-blue-500">{item.humidity}%</td>
                        <td className="p-4 text-purple-500">{item.wind_speed} km/h</td>
                        <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border 
                                ${item.is_day === 1 
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'}
                            `}>
                                {item.is_day === 1 ? '☀️' : '🌑'}
                                <span className="w-px h-3 bg-current opacity-20 mx-1"></span>
                                {item.temp >= 30 ? 'MUITO QUENTE' : 
                                 item.temp >= 25 ? 'QUENTE' : 
                                 item.temp <= 15 ? 'FRIO' : 
                                 item.wind_speed > 20 ? 'VENTOSO' : 'AGRADÁVEL'}
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
    </div>
  );
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return token ? <Dashboard onLogout={handleLogout} /> : <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}

export default App;