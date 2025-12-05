package main

type Weather struct {
    Temperature     *float64 `json:"temperature"`
    Humidity        *float64 `json:"humidity"`
    WindSpeed       *float64 `json:"wind_speed"`
    Condition       *int     `json:"condition"`         // weathercode
    RainProbability *float64 `json:"rain_probability"`  // precipitação (mm)
    Timestamp       *string  `json:"timestamp"`
}

func (w Weather) IsValid() bool {
    return w.Temperature != nil && w.WindSpeed != nil && w.Timestamp != nil
}
