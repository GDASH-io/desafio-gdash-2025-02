import Card from "./ui/Card";

export default function WeatherCard({ weather }) {
  if (!weather) return null;
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-2">Clima Atual</h3>
      <p>Temperatura: <strong>{weather.temperature}°C</strong></p>
      <p>Vento: <strong>{weather.windspeed} km/h</strong></p>
    </Card>
  );
}
