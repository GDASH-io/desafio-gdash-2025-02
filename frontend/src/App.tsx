import { useEffect, useState } from 'react';
import { WeatherDisplay, type WeatherLog } from './WeatherDisplay';

function App() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/weather');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('✅ Dados atualizados:', data);
      setLogs(data);
    } catch (error) {
      console.error("❌ Erro ao buscar clima:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    
    const interval = setInterval(fetchWeather, 60000); // 60 segundos, sincronizado com producer
    return () => clearInterval(interval);
  }, []);

  return (
    <WeatherDisplay 
      logs={logs} 
      loading={loading} 
      onRefresh={fetchWeather} 
    />
  );
}

export default App;