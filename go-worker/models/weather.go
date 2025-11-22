package models

import "time"

type WeatherData struct {
	Temperature *float64 `json:"temperature"`
	Humidity    *float64 `json:"humidity"`
	Description string   `json:"description,omitempty"`
	City        string   `json:"city,omitempty"`
	Timestamp   string   `json:"timestamp,omitempty"`

	WindSpeed         *float64 `json:"wind_speed,omitempty"`
	WeatherDescription string  `json:"weather_description,omitempty"`
	RainProbability   *float64 `json:"rain_probability,omitempty"`
	FetchedAt         string   `json:"fetched_at,omitempty"`
}

func (w *WeatherData) Validate() error {
	if w.Temperature == nil {
		return &ValidationError{Field: "temperature", Message: "temperature é obrigatório"}
	}

	if w.Humidity == nil {
		return &ValidationError{Field: "humidity", Message: "humidity é obrigatório"}
	}

	description := w.Description
	if description == "" {
		description = w.WeatherDescription
	}
	if description == "" {
		return &ValidationError{Field: "description", Message: "description não pode ser vazio (deve ter 'description' ou 'weather_description')"}
	}

	return nil
}

func (w *WeatherData) ToAPIFormat() map[string]interface{} {
	normalized := make(map[string]interface{})

	normalized["temperature"] = *w.Temperature
	normalized["humidity"] = *w.Humidity

	if w.WeatherDescription != "" {
		normalized["weather_description"] = w.WeatherDescription
	} else {
		normalized["weather_description"] = w.Description
	}

	if w.WindSpeed != nil {
		normalized["wind_speed"] = *w.WindSpeed
	} else {
		normalized["wind_speed"] = 0.0
	}

	if w.RainProbability != nil {
		normalized["rain_probability"] = *w.RainProbability
	} else {
		normalized["rain_probability"] = 0.0
	}

	timestamp := w.FetchedAt
	if timestamp == "" {
		timestamp = w.Timestamp
	}
	if timestamp == "" {
		timestamp = time.Now().UTC().Format(time.RFC3339)
	}
	normalized["fetched_at"] = timestamp

	return normalized
}

type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}
