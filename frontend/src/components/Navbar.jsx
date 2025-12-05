import { weatherIcon } from "@/lib/weather";

export default function Navbar({ onThemeToggle, city, weather }) {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-900 bg-opacity-60 rounded-xl mb-6 shadow-lg border border-gray-700">
      <h1 className="text-2xl font-bold">🌤️ Weather Dashboard</h1>

      <div className="flex items-center gap-4">

        {/* Cidade + clima */}
        <span className="text-gray-300 flex items-center gap-2">
          📍 {city ?? "Detectando..."}
          
          {/* Só mostra o ícone se tiver clima carregado */}
          {weather && (
            <>
              {weatherIcon(weather.code)}
              {weather.temp}°C
            </>
          )}
        </span>

        {/* Botão tema */}
        <button
          onClick={onThemeToggle}
          className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
        >
          Tema
        </button>
      </div>
    </header>
  );
}
