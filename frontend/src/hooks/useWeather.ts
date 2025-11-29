import { useState, useEffect, useCallback } from "react";
import { WeatherLog } from "@/types/weather";

const API_URL = "http://localhost:3000/weather";

interface WeatherInsight {
  analysis_text: string;
  trend: string;
  average_last_10: string;
}

export function useWeather() {
  const [data, setData] = useState<WeatherLog[]>([]);
  const [insight, setInsight] = useState<WeatherInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Falha na comunicação com a API");
      const json = await response.json();
      setData(json);

      const responseInsight = await fetch(`${API_URL}/insights`);
      const jsonInsight = await responseInsight.json();
      setInsight(jsonInsight);
    } catch (err) {
      setError("Não foi possível atualizar os dados.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const intervalId = setInterval(fetchWeather, 30000); 
    return () => clearInterval(intervalId);
  }, [fetchWeather]);

  const downloadCsv = () => {
    window.open(`${API_URL}/export/csv`, '_blank');
  };

  return {
    history: data,
    current: data[0] || null,
    insight,
    loading,
    error,
    refresh: fetchWeather,
    downloadCsv,
  };
}