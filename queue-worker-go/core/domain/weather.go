package domain

type WeatherDocument struct {
	Time             string  `json:"time"`
	Type             string  `json:"type"`
	UserId 			 string  `json:"userId"`
	Temperature      float64 `json:"temperature"`
	TempMax          float64 `json:"temp_max"`
	TempMin          float64 `json:"temp_min"`
	Humidity         float64 `json:"humidity"`
	WindSpeed        float64 `json:"wind_speed"`
	RainProbability  float64 `json:"rain_probability"`
	WeatherCode      int     `json:"weather_code"`
	SkyCondition     string  `json:"sky_condition"`
}