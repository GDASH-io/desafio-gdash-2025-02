package domain

import (
	"encoding/json"
	"fmt"
	"time"
)

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	City      string  `json:"city"`
}

type WeatherData struct {
	Timestamp           string   `json:"timestamp"`
	Location            Location `json:"location"`
	Temperature         float64  `json:"temperature"`
	ApparentTemperature float64  `json:"apparent_temperature"`
	Humidity            float64  `json:"humidity"`
	Pressure            float64  `json:"pressure"`
	WindSpeed           float64  `json:"wind_speed"`
	WindDirection       int      `json:"wind_direction"`
	Precipitation       float64  `json:"precipitation"`
	CloudCover          float64  `json:"cloud_cover"`
	WeatherCode         int      `json:"weather_code"`
}

func (w *WeatherData) Validate() error {
	if w.Timestamp == "" {
		return fmt.Errorf("timestamp is empty")
	}

	if _, err := time.Parse(time.RFC3339, w.Timestamp); err != nil {
		return fmt.Errorf("invalid timestamp format: %w", err)
	}

	if w.Location.City == "" {
		return fmt.Errorf("location city is empty")
	}

	if w.Location.Latitude < -90 || w.Location.Latitude > 90 {
		return fmt.Errorf("invalid latitude: %f", w.Location.Latitude)
	}

	if w.Location.Longitude < -180 || w.Location.Longitude > 180 {
		return fmt.Errorf("invalid longitude: %f", w.Location.Longitude)
	}

	return nil
}

func ParseWeatherData(data []byte) (*WeatherData, error) {
	var weather WeatherData
	if err := json.Unmarshal(data, &weather); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %w", err)
	}

	if err := weather.Validate(); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	return &weather, nil
}

func (w *WeatherData) ToJSON() ([]byte, error) {
	data, err := json.Marshal(w)
	if err != nil {
		return nil, fmt.Errorf("failed to encode json: %w", err)
	}

	return data, nil
}
