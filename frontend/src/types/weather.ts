export interface DayInfo {
	_id: string;
	dayNumber: number;
	weekday: string;
	month: string;
	year: number;
	hour: string;
}

export interface WeatherLogFull {
	_id: string;
	time: string;
	temperature: number;
	humidity: number;
	wind_speed: number;
	rain_probability: number;
	weather_code: string;
	sky_condition: string;

	dayNumber: number;
	weekday: string;
	month: string;
	year: number;
	hour: string;
}
