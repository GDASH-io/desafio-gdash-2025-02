package models

type WeatherData struct {
	Timestamp string   `json:"timestamp"`
	Location  Location `json:"location"`
	Current   Current  `json:"current"`
	Metadata  Metadata `json:"metadata"`
}

type Location struct {
	City      string  `json:"city"`
	State     string  `json:"state"`
	Country   string  `json:"country"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type Current struct {
	Temperature      float64 `json:"temperature"`
	FeelsLike        float64 `json:"feels_like"`
	Humidity         int     `json:"humidity"`
	WindSpeed        float64 `json:"wind_speed"`
	WindDirection    int     `json:"wind_direction"`
	Pressure         float64 `json:"pressure"`
	UVIndex          int     `json:"uv_index"`
	Visibility       int     `json:"visibility"`
	Condition        string  `json:"condition"`
	RainProbability  int     `json:"rain_probability"`
	CloudCover       int     `json:"cloud_cover"`
}

type Metadata struct {
	Source           string `json:"source"`
	CollectorVersion string `json:"collector_version"`
}

type NestJSPayload struct {
	Timestamp       string  `json:"timestamp"`
	City            string  `json:"city"`
	State           string  `json:"state"`
	Country         string  `json:"country"`
	Latitude        float64 `json:"latitude"`
	Longitude       float64 `json:"longitude"`
	Temperature     float64 `json:"temperature"`
	FeelsLike       float64 `json:"feelsLike"`
	Humidity        int     `json:"humidity"`
	WindSpeed       float64 `json:"windSpeed"`
	WindDirection   int     `json:"windDirection"`
	Pressure        float64 `json:"pressure"`
	UVIndex         int     `json:"uvIndex"`
	Visibility      int     `json:"visibility"`
	Condition       string  `json:"condition"`
	RainProbability int     `json:"rainProbability"`
	CloudCover      int     `json:"cloudCover"`
	Source          string  `json:"source"`
}

func (w *WeatherData) ToNestJSPayload() *NestJSPayload {
	return &NestJSPayload{
		Timestamp:       w.Timestamp,
		City:            w.Location.City,
		State:           w.Location.State,
		Country:         w.Location.Country,
		Latitude:        w.Location.Latitude,
		Longitude:       w.Location.Longitude,
		Temperature:     w.Current.Temperature,
		FeelsLike:       w.Current.FeelsLike,
		Humidity:        w.Current.Humidity,
		WindSpeed:       w.Current.WindSpeed,
		WindDirection:   w.Current.WindDirection,
		Pressure:        w.Current.Pressure,
		UVIndex:         w.Current.UVIndex,
		Visibility:      w.Current.Visibility,
		Condition:       w.Current.Condition,
		RainProbability: w.Current.RainProbability,
		CloudCover:      w.Current.CloudCover,
		Source:          w.Metadata.Source,
	}
}
