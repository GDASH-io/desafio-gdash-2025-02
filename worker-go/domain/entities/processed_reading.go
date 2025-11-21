package entities

import "time"

// ProcessedReading representa uma leitura climática processada com métricas PV
type ProcessedReading struct {
	MsgID                string    `json:"msg_id"`
	Source               string    `json:"source"`
	City                 string    `json:"city"`
	Timestamp            time.Time `json:"timestamp"`
	TemperatureC         float64   `json:"temperature_c"`
	RelativeHumidity     int       `json:"relative_humidity"`
	PrecipitationMM      float64   `json:"precipitation_mm"`
	WindSpeedMS          float64   `json:"wind_speed_m_s"`
	CloudsPercent        int       `json:"clouds_percent"`
	WeatherCode          int       `json:"weather_code"`
	EstimatedIrradianceW float64   `json:"estimated_irradiance_w_m2"`
	TempEffectFactor     float64   `json:"temp_effect_factor"`
	SoilingRisk          string    `json:"soiling_risk"`
	WindDeratingFlag     bool      `json:"wind_derating_flag"`
	PVDeratingPct        float64   `json:"pv_derating_pct"`
	ProcessedAt          time.Time `json:"processed_at"`
}

// RawReading representa uma leitura raw recebida do Kafka
type RawReading struct {
	Source          string                 `json:"source"`
	City            string                 `json:"city"`
	Coords          map[string]interface{} `json:"coords"`
	FetchedAt       string                 `json:"fetched_at"`
	Interval        string                 `json:"interval"`
	Payload         []ReadingPayload       `json:"payload"`
}

// ReadingPayload representa um item do payload de leitura
type ReadingPayload struct {
	Timestamp        string  `json:"timestamp"`
	TemperatureC     float64 `json:"temperature_c"`
	RelativeHumidity int     `json:"relative_humidity"`
	PrecipitationMM  float64 `json:"precipitation_mm"`
	WindSpeedMS      float64 `json:"wind_speed_m_s"`
	CloudsPercent    int     `json:"clouds_percent"`
	WeatherCode      int     `json:"weather_code"`
	PressureHpa      *float64 `json:"pressure_hpa,omitempty"`
	UvIndex          *float64 `json:"uv_index,omitempty"`
	VisibilityM      *int     `json:"visibility_m,omitempty"`
}

