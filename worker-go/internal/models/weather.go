package models

import (
	"encoding/json"
	"fmt"
	"time"
)

type Location struct {
	Latitude  string `json:"latitude"`
	Longitude string `json:"longitude"`
	City      string `json:"city"`
	State     string `json:"state"`
}

type Weather struct {
	Temperature       float64 `json:"temperature"`
	TemperatureUnit   string  `json:"temperature_unit"`
	Humidity          float64 `json:"humidity"`
	HumidityUnit      string  `json:"humidity_unit"`
	WindSpeed         float64 `json:"wind_speed"`
	WindSpeedUnit     string  `json:"wind_speed_unit"`
	Condition         string  `json:"condition"`
	WeatherCode       int     `json:"weather_code"`
	Precipitation     float64 `json:"precipitation"`
	PrecipitationUnit string  `json:"precipitation_unit"`
	RainProbability   int     `json:"rain_probability"`
}

type WeatherData struct {
	Timestamp string    `json:"timestamp"`
	Location  Location  `json:"location"`
	Weather   Weather   `json:"weather"`
	
	ReceivedAt  time.Time `json:"received_at,omitempty"`
	ProcessedAt time.Time `json:"processed_at,omitempty"`
}

func UnmarshalWeatherData(data []byte) (*WeatherData, error) {
	var weatherData WeatherData
	
	err := json.Unmarshal(data, &weatherData)
	if err != nil {
		return nil, fmt.Errorf("erro ao deserializar JSON: %w", err)
	}
	
	weatherData.ReceivedAt = time.Now()
	
	return &weatherData, nil
}

func (w *WeatherData) ToJSON() ([]byte, error) {
	return json.Marshal(w)
}

func (w *WeatherData) String() string {
	return fmt.Sprintf(
		"Temp: %.1f%s | Umidade: %.0f%s | Vento: %.1f%s | %s | Local: %s, %s",
		w.Weather.Temperature, w.Weather.TemperatureUnit,
		w.Weather.Humidity, w.Weather.HumidityUnit,
		w.Weather.WindSpeed, w.Weather.WindSpeedUnit,
		w.Weather.Condition,
		w.Location.City, w.Location.State,
	)
}

func (w *WeatherData) IsValid() error {
	if w.Weather.Temperature < -100 || w.Weather.Temperature > 100 {
		return fmt.Errorf("temperatura fora do intervalo válido: %.2f", w.Weather.Temperature)
	}
	
	if w.Weather.Humidity < 0 || w.Weather.Humidity > 100 {
		return fmt.Errorf("umidade fora do intervalo válido: %.2f", w.Weather.Humidity)
	}
	
	if w.Weather.WindSpeed < 0 || w.Weather.WindSpeed > 500 {
		return fmt.Errorf("velocidade do vento inválida: %.2f", w.Weather.WindSpeed)
	}
	
	if w.Weather.Precipitation < 0 || w.Weather.Precipitation > 500 {
		return fmt.Errorf("precipitação inválida: %.2f", w.Weather.Precipitation)
	}
	
	if w.Weather.RainProbability < 0 || w.Weather.RainProbability > 100 {
		return fmt.Errorf("probabilidade de chuva inválida: %d", w.Weather.RainProbability)
	}
	
	if w.Weather.Condition == "" {
		return fmt.Errorf("condição climática vazia")
	}
	
	if w.Timestamp == "" {
		return fmt.Errorf("timestamp vazio")
	}
	
	return nil
}

func (w *WeatherData) Normalize() {
	w.Weather.Temperature = round(w.Weather.Temperature, 2)
	w.Weather.Humidity = round(w.Weather.Humidity, 2)
	w.Weather.WindSpeed = round(w.Weather.WindSpeed, 2)
	w.Weather.Precipitation = round(w.Weather.Precipitation, 2)
	
	w.ProcessedAt = time.Now()
}

func round(val float64, precision int) float64 {
	ratio := float64(1)
	for i := 0; i < precision; i++ {
		ratio *= 10
	}
	return float64(int(val*ratio+0.5)) / ratio
}