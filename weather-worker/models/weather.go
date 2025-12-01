package models

type WeatherData struct {
	Timestamp                string   `json:"timestamp"`
	Location                 Location `json:"location"`
	Temperature              *float64 `json:"temperature"`
	Humidity                 *float64 `json:"humidity"`
	WindSpeed                *float64 `json:"windSpeed"`
	WeatherCode              *int     `json:"weatherCode"`
	Condition                string   `json:"condition"`
	PrecipitationProbability *float64 `json:"precipitationProbability"`
}

type Location struct {
	Name string  `json:"name"`
	Lat  float64 `json:"lat"`
	Lon  float64 `json:"lon"`
}
