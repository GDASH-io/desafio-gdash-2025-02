import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { CitySelector } from '@/components/CitySelector';
import { useNavigate } from 'react-router-dom';
import { StatCard, InsightBanner, WeatherTable } from '@/components/DashboardComponents';
import { Thermometer, Droplets, Wind, CloudSun, Download, FileSpreadsheet, User, Search } from 'lucide-react';

interface WeatherLog {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  timestamp: number;
}

const Dashboard = () => {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStartTime, setUpdateStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentCity, setCurrentCity] = useState<string>('');
  const navigate = useNavigate();

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      const logsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/weather/logs`, config);
      setLogs(logsRes.data);

      const insightsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/weather/insights`, config);
      setInsights(insightsRes.data);
      
      // Also fetch current config to ensure city name is up to date
      const configRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/config`, config);
      if (configRes.data && configRes.data.city) {
        setCurrentCity(configRes.data.city);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // specific logic to get user location on first load
    const initializeLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const token = localStorage.getItem('token');
            try {
              await axios.put(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/config`,
                {
                  city: "Current Location", 
                  latitude: latitude.toString(),
                  longitude: longitude.toString(),
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              fetchData();
            } catch (error) {
              console.error('Failed to update location config:', error);
            }
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }
    };

    initializeLocation();
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Update elapsed time while updating
  useEffect(() => {
    if (isUpdating && updateStartTime) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - updateStartTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isUpdating, updateStartTime]);

  const handleExport = (type: 'csv' | 'xlsx') => {
    const token = localStorage.getItem('token');
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/weather/export/${type}?token=${token}`, '_blank');
  };

  const handleCitySelect = async (city: any) => {
    const token = localStorage.getItem('token');
    try {
      setIsUpdating(true);
      setUpdateStartTime(Date.now());
      setElapsedTime(0);
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/config`,
        {
          city: city.name,
          latitude: city.latitude.toString(),
          longitude: city.longitude.toString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCurrentCity(city.name);
      
      // Poll for new data from the selected city
      let attempts = 0;
      const maxAttempts = 24; // 2 minutes (24 * 5 seconds)
      const pollInterval = setInterval(async () => {
        attempts++;
        await fetchData();
        
        // Check if we have data from the new city
        const logsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/weather/logs`, 
          { headers: { Authorization: `Bearer ${token}` } });
        
        if (logsRes.data.length > 0 && logsRes.data[0].city === city.name) {
          // New data arrived!
          clearInterval(pollInterval);
          setIsUpdating(false);
        } else if (attempts >= maxAttempts) {
          // Timeout after 2 minutes
          clearInterval(pollInterval);
          setIsUpdating(false);
        }
      }, 5000); // Check every 5 seconds
      
    } catch (error) {
      console.error('Failed to update city config:', error);
      setIsUpdating(false);
    }
  };

  const latest = logs[0] || {};

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <CloudSun className="text-blue-500" /> Weather Dashboard
          </h1>
          {currentCity && (
            <p className="text-slate-400 mt-1">
              Monitoring: <span className="font-semibold text-blue-400">{currentCity}</span>
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <CitySelector onCitySelect={handleCitySelect} />
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate('/explore')} title="Explore API" className="bg-slate-900 border-slate-800 hover:bg-slate-800">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate('/users')} title="Manage Users" className="bg-slate-900 border-slate-800 hover:bg-slate-800">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleExport('csv')} title="Export CSV" className="bg-slate-900 border-slate-800 hover:bg-slate-800">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleExport('xlsx')} title="Export XLSX" className="bg-slate-900 border-slate-800 hover:bg-slate-800">
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading Banner */}
      {isUpdating && (
        <div className="mb-6 bg-gradient-to-r from-blue-900/50 to-blue-800/30 border border-blue-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="flex-1">
              <p className="text-blue-300 font-semibold">Atualizando dados da cidade...</p>
              <p className="text-sm text-blue-400/80 mt-1">
                Aguardando coleta de novos dados meteorológicos. Tempo decorrido: {elapsedTime}s
              </p>
              <div className="mt-2 w-full bg-blue-950/50 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((elapsedTime / 120) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insight */}
      <InsightBanner 
        insight={insights?.insight} 
        averageTemp={insights?.averageTemp} 
        loading={isUpdating}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Temperature" 
          value={`${latest.temperature?.toFixed(1)}°C`} 
          icon={Thermometer} 
          description="Feels like 2° higher"
          loading={isUpdating}
        />
        <StatCard 
          title="Humidity" 
          value={`${latest.humidity}%`} 
          icon={Droplets} 
          description="Dew point 18°C"
          loading={isUpdating}
        />
        <StatCard 
          title="Wind Speed" 
          value={`${latest.windSpeed} km/h`} 
          icon={Wind} 
          description="Direction NW"
          loading={isUpdating}
        />
        <StatCard 
          title="Condition" 
          value={latest.condition} 
          icon={CloudSun} 
          description="Updated just now"
          loading={isUpdating}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-slate-900 border-slate-800 text-slate-100 relative">
          <CardHeader>
            <CardTitle>Temperature Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isUpdating && (
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div className="h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...logs].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(unix) => new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    stroke="#94a3b8"
                  />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    labelFormatter={(unix) => new Date(unix * 1000).toLocaleString()} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 relative">
          <CardHeader>
            <CardTitle>Humidity & Wind</CardTitle>
          </CardHeader>
          <CardContent>
            {isUpdating && (
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div className="h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...logs].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(unix) => new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    stroke="#94a3b8"
                  />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    labelFormatter={(unix) => new Date(unix * 1000).toLocaleString()} 
                  />
                  <Legend />
                  <Bar dataKey="humidity" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="windSpeed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Data Table */}
      <WeatherTable logs={logs} loading={isUpdating} />
    </div>
  );
};

export default Dashboard;
