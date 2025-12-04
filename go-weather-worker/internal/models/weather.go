package models

// WeatherData representa os dados climáticos recebidos do Python
type WeatherData struct {
	Timestamp   string   `json:"timestamp"`
	CollectedAt string   `json:"collected_at"`
	Location    Location `json:"location"`
	Temperature *float64 `json:"temperature"` // Ponteiro permite nil
	Humidity    *float64 `json:"humidity"`
	WindSpeed   *float64 `json:"wind_speed"`
	Precipitation *float64 `json:"precipitation"`
	WeatherCode *int     `json:"weather_code"`
	Condition   string   `json:"condition"`
}

// Location representa as coordenadas geográficas
type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// Validate verifica se os dados são válidos
func (w *WeatherData) Validate() bool {
	// Validações básicas
	if w.Location.Latitude == 0 && w.Location.Longitude == 0 {
		return false
	}
	if w.Timestamp == "" {
		return false
	}
	return true
}

// ToAPIPayload converte para o formato esperado pela API NestJS
func (w *WeatherData) ToAPIPayload() map[string]interface{} {
	return map[string]interface{}{
		"timestamp":     w.Timestamp,
		"collected_at":  w.CollectedAt,
		"latitude":      w.Location.Latitude,
		"longitude":     w.Location.Longitude,
		"temperature":   w.Temperature,
		"humidity":      w.Humidity,
		"wind_speed":    w.WindSpeed,
		"precipitation": w.Precipitation,
		"weather_code":  w.WeatherCode,
		"condition":     w.Condition,
	}
}
