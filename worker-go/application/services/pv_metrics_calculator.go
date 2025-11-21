package services

import (
	"math"
	"time"
	"github.com/gdash/worker-go/domain/entities"
	"github.com/google/uuid"
)

// PVMetricsCalculator calcula métricas de energia solar (PV)
type PVMetricsCalculator struct{}

// NewPVMetricsCalculator cria um novo calculador de métricas PV
func NewPVMetricsCalculator() *PVMetricsCalculator {
	return &PVMetricsCalculator{}
}

// Calculate calcula todas as métricas PV para uma leitura
func (c *PVMetricsCalculator) Calculate(raw entities.ReadingPayload, source, city string, timestamp time.Time) *entities.ProcessedReading {
	// Calcular métricas
	estimatedIrradiance := c.calculateEstimatedIrradiance(raw.CloudsPercent, raw.WeatherCode)
	tempEffectFactor := c.calculateTempEffectFactor(raw.TemperatureC)
	soilingRisk := c.calculateSoilingRisk(raw.PrecipitationMM)
	windDeratingFlag := c.calculateWindDeratingFlag(raw.WindSpeedMS)
	pvDeratingPct := c.calculatePVDerating(tempEffectFactor, soilingRisk, windDeratingFlag)
	
	// Gerar ID único
	msgID := uuid.New().String()
	
	return &entities.ProcessedReading{
		MsgID:                  msgID,
		Source:                 source,
		City:                   city,
		Timestamp:              timestamp,
		TemperatureC:           raw.TemperatureC,
		RelativeHumidity:        raw.RelativeHumidity,
		PrecipitationMM:       raw.PrecipitationMM,
		WindSpeedMS:            raw.WindSpeedMS,
		CloudsPercent:          raw.CloudsPercent,
		WeatherCode:            raw.WeatherCode,
		EstimatedIrradianceW:   estimatedIrradiance,
		TempEffectFactor:       tempEffectFactor,
		SoilingRisk:            soilingRisk,
		WindDeratingFlag:       windDeratingFlag,
		PVDeratingPct:          pvDeratingPct,
		ProcessedAt:            time.Now(),
		PressureHpa:            raw.PressureHpa,
		UvIndex:                raw.UvIndex,
		VisibilityM:            raw.VisibilityM,
		WindDirection10m:       raw.WindDirection10m,
		WindGusts10m:           raw.WindGusts10m,
		PrecipitationProbability: raw.PrecipitationProbability,
	}
}

// calculateEstimatedIrradiance calcula irradiância estimada baseada em nuvens e weather code
func (c *PVMetricsCalculator) calculateEstimatedIrradiance(cloudsPercent int, weatherCode int) float64 {
	baseIrradiance := 1000.0 // W/m² (irradiância padrão)
	
	// Fator de nuvens
	cloudFactor := 1.0 - (float64(cloudsPercent) / 100.0)
	
	// Fator de weather code (WMO codes)
	weatherFactor := c.getWeatherFactor(weatherCode)
	
	estimatedIrradiance := baseIrradiance * cloudFactor * weatherFactor
	
	// Garantir valor mínimo
	return math.Max(estimatedIrradiance, 0.0)
}

// getWeatherFactor retorna fator baseado no weather code
func (c *PVMetricsCalculator) getWeatherFactor(weatherCode int) float64 {
	// WMO Weather interpretation codes (WW)
	switch {
	case weatherCode == 800: // Clear sky
		return 1.0
	case weatherCode >= 801 && weatherCode <= 802: // Few/Scattered clouds
		return 0.9
	case weatherCode == 803: // Broken clouds
		return 0.7
	case weatherCode == 804: // Overcast
		return 0.5
	case weatherCode >= 200 && weatherCode < 300: // Thunderstorm
		return 0.3
	case weatherCode >= 300 && weatherCode < 400: // Drizzle
		return 0.4
	case weatherCode >= 500 && weatherCode < 600: // Rain
		return 0.3
	case weatherCode >= 600 && weatherCode < 700: // Snow
		return 0.2
	case weatherCode >= 700 && weatherCode < 800: // Atmosphere (fog, mist, etc)
		return 0.5
	default:
		return 0.7 // Default para códigos desconhecidos
	}
}

// calculateTempEffectFactor calcula fator de derating por temperatura
func (c *PVMetricsCalculator) calculateTempEffectFactor(tempC float64) float64 {
	// Coeficiente típico: -0.4% por °C acima de 25°C
	// Fórmula: factor = 1 - max(0, (temp - 25) * 0.004)
	tempDiff := tempC - 25.0
	if tempDiff <= 0 {
		return 1.0 // Sem derating se temperatura <= 25°C
	}
	
	factor := 1.0 - (tempDiff * 0.004)
	return math.Max(factor, 0.0) // Garantir não negativo
}

// calculateSoilingRisk calcula risco de sujeira baseado em precipitação
func (c *PVMetricsCalculator) calculateSoilingRisk(precipitationMM float64) string {
	// Baseado em precipitação acumulada (assumindo 24h)
	if precipitationMM < 5.0 {
		return "low"
	} else if precipitationMM < 20.0 {
		return "medium"
	}
	return "high"
}

// calculateWindDeratingFlag verifica se vento extremo causa derating
func (c *PVMetricsCalculator) calculateWindDeratingFlag(windSpeedMS float64) bool {
	// Vento > 20 m/s pode causar derating ou danos
	return windSpeedMS > 20.0
}

// calculatePVDerating calcula percentual total de derating
func (c *PVMetricsCalculator) calculatePVDerating(
	tempEffectFactor float64,
	soilingRisk string,
	windDeratingFlag bool,
) float64 {
	// Derating por temperatura
	tempDerating := (1.0 - tempEffectFactor) * 100.0
	
	// Penalidade por soiling
	var soilingPenalty float64
	switch soilingRisk {
	case "low":
		soilingPenalty = 0.0
	case "medium":
		soilingPenalty = 2.0
	case "high":
		soilingPenalty = 5.0
	}
	
	// Penalidade por vento
	windPenalty := 0.0
	if windDeratingFlag {
		windPenalty = 3.0
	}
	
	totalDerating := tempDerating + soilingPenalty + windPenalty
	
	// Garantir valor entre 0 e 100
	return math.Max(0.0, math.Min(100.0, totalDerating))
}

