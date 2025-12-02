package domain

type WeatherData struct {
	// Ajustado aqui para ler o JSON plano que vem do Python
	LocationLat float64 `json:"location_lat"`
	LocationLon float64 `json:"location_lon"`

	Temperature   float64 `json:"temperature"`
	Humidity      float64 `json:"humidity"`
	WindSpeed     float64 `json:"wind_speed"`
	ConditionCode int     `json:"condition_code"`
	CollectedAt   string  `json:"collected_at"`
}