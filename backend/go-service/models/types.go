package models

type StreamConfig struct {
	GroupName string
	Consumer  string
	Streams   []string
	Count     int
	Block     int
}

type Coordinates struct {
	Longitude float64
	Latitude  float64
}

type DailyInfo struct {
	Days           []any `json:"days"`
	TempMin        []any `json:"tempMin"`
	TempMax        []any `json:"tempMax"`
	UvIndex        []any `json:"uvIndex"`
	SolarRadiation []any `json:"solarRadiation"`
}

type Weather struct {
	CityName            string      `json:"cityName"`
	Coordinates         Coordinates `json:"coordinates"`
	CloudCover          float64     `json:"cloudCover"`
	Precipitation       float64     `json:"precipitation"`
	Humidity            float64     `json:"humidity"`
	Temperature         float64     `json:"temperature"`
	WindSpeed           float64     `json:"windSpeed"`
	Time                string      `json:"time"`
	Date                string      `json:"date"`
	ApparentTemperature float64     `json:"apparentTemperature"`
	Rain                float64     `json:"rain"`
	IsDay               float64     `json:"isDay"`
	DailyInfo           *DailyInfo  `json:"dailyInfo,omitempty"`
}

type SignupInfo struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginInfo struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
