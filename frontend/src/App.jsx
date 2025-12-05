import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Dashboard from "@/pages/Dashboard";
import Historico from "@/pages/Historico";
import Insights from "@/pages/Insights";
import { detectUserCity } from "@/lib/location";
import { getCurrentWeather } from "@/lib/weather";

export default function App() {
  const [route, setRoute] = useState("dashboard");
  const [city, setCity] = useState(null);
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  // Detectar localização
  useEffect(() => {
    detectUserCity()
      .then((data) => {
        setCity(data.city);
        const c = { lat: data.latitude, lon: data.longitude };
        setCoords(c);

        // Buscar clima atual
        getCurrentWeather(c.lat, c.lon).then(setWeather);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <Navbar onThemeToggle={toggleTheme} city={city} weather={weather} />

      <nav className="mb-6 flex gap-3">
        <button onClick={() => setRoute("dashboard")} className="px-3 py-1 rounded bg-gray-700">Dashboard</button>
        <button onClick={() => setRoute("historico")} className="px-3 py-1 rounded bg-gray-700">Histórico</button>
        <button onClick={() => setRoute("insights")} className="px-3 py-1 rounded bg-gray-700">Insights</button>
      </nav>

      <main>
        {route === "dashboard" && <Dashboard city={city} coords={coords} weather={weather} />}
        {route === "historico" && <Historico city={city} />}
        {route === "insights" && <Insights city={city} coords={coords} weather={weather} />}
      </main>
    </div>
  );
}
