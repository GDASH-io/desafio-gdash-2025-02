export const getWeatherIcon = (code: number) => {
  if (code === 0) return "☀️";
  if (code <= 3) return "🌤️";
  if (code <= 48) return "☁️";
  if (code <= 67 || code <= 82) return "🌧️";
  if (code <= 86) return "❄️";
  return "🌫️";
};

export const getWeatherLabel = (code: number) => {
  if (code === 0) return "Ensolarado";
  if (code <= 3) return "Parcialmente nublado";
  if (code <= 48) return "Nublado";
  if (code <= 67 || code <= 82) return "Chuvoso";
  if (code <= 86) return "Nevando";
  return "Neblina";
};

