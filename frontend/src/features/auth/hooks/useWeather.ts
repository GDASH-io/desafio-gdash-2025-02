import { useEffect, useState } from "react";

type WeatherType = "snow" | "rain";

export function useWeather() {
	const [weather, setWeather] = useState<WeatherType>("snow");

	useEffect(() => {
		const interval = setInterval(() => {
			setWeather(prev => (prev === "snow" ? "rain" : "snow"));
		}, 60000);
		return () => clearInterval(interval);
	}, []);

	return weather;
}
