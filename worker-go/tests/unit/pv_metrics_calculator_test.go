package unit

import (
	"testing"
	"time"
	"github.com/gdash/worker-go/application/services"
	"github.com/gdash/worker-go/domain/entities"
)

func TestCalculateEstimatedIrradiance(t *testing.T) {
	calculator := services.NewPVMetricsCalculator()
	
	tests := []struct {
		name          string
		cloudsPercent int
		weatherCode   int
		expectedMin   float64
		expectedMax   float64
	}{
		{
			name:          "Clear sky",
			cloudsPercent: 0,
			weatherCode:   800,
			expectedMin:   900.0,
			expectedMax:   1000.0,
		},
		{
			name:          "Few clouds",
			cloudsPercent: 20,
			weatherCode:   801,
			expectedMin:   700.0,
			expectedMax:   800.0,
		},
		{
			name:          "Overcast",
			cloudsPercent: 100,
			weatherCode:   804,
			expectedMin:   0.0,
			expectedMax:   100.0,
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			raw := entities.ReadingPayload{
				CloudsPercent: tt.cloudsPercent,
				WeatherCode:   tt.weatherCode,
			}
			
			result := calculator.Calculate(raw, "test", "Test City", time.Now())
			
			if result.EstimatedIrradianceW < tt.expectedMin || result.EstimatedIrradianceW > tt.expectedMax {
				t.Errorf("Expected irradiance between %f and %f, got %f",
					tt.expectedMin, tt.expectedMax, result.EstimatedIrradianceW)
			}
		})
	}
}

func TestCalculateTempEffectFactor(t *testing.T) {
	calculator := services.NewPVMetricsCalculator()
	
	tests := []struct {
		name     string
		tempC    float64
		expected float64
	}{
		{
			name:     "Temperature below 25°C",
			tempC:    20.0,
			expected: 1.0,
		},
		{
			name:     "Temperature at 25°C",
			tempC:    25.0,
			expected: 1.0,
		},
		{
			name:     "Temperature above 25°C",
			tempC:    35.0,
			expected: 0.96, // 1 - (35-25)*0.004 = 0.96
		},
		{
			name:     "High temperature",
			tempC:    50.0,
			expected: 0.90, // 1 - (50-25)*0.004 = 0.90
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			raw := entities.ReadingPayload{
				TemperatureC: tt.tempC,
			}
			
			result := calculator.Calculate(raw, "test", "Test City", time.Now())
			
			if result.TempEffectFactor != tt.expected {
				t.Errorf("Expected temp effect factor %f, got %f",
					tt.expected, result.TempEffectFactor)
			}
		})
	}
}

func TestCalculateSoilingRisk(t *testing.T) {
	calculator := services.NewPVMetricsCalculator()
	
	tests := []struct {
		name            string
		precipitationMM float64
		expected        string
	}{
		{
			name:            "Low precipitation",
			precipitationMM: 3.0,
			expected:        "low",
		},
		{
			name:            "Medium precipitation",
			precipitationMM: 10.0,
			expected:        "medium",
		},
		{
			name:            "High precipitation",
			precipitationMM: 25.0,
			expected:        "high",
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			raw := entities.ReadingPayload{
				PrecipitationMM: tt.precipitationMM,
			}
			
			result := calculator.Calculate(raw, "test", "Test City", time.Now())
			
			if result.SoilingRisk != tt.expected {
				t.Errorf("Expected soiling risk %s, got %s",
					tt.expected, result.SoilingRisk)
			}
		})
	}
}

func TestCalculateWindDeratingFlag(t *testing.T) {
	calculator := services.NewPVMetricsCalculator()
	
	tests := []struct {
		name         string
		windSpeedMS  float64
		expectedFlag bool
	}{
		{
			name:         "Normal wind",
			windSpeedMS:  10.0,
			expectedFlag: false,
		},
		{
			name:         "Extreme wind",
			windSpeedMS:  25.0,
			expectedFlag: true,
		},
		{
			name:         "Borderline wind",
			windSpeedMS:  20.0,
			expectedFlag: false, // > 20, not >=
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			raw := entities.ReadingPayload{
				WindSpeedMS: tt.windSpeedMS,
			}
			
			result := calculator.Calculate(raw, "test", "Test City", time.Now())
			
			if result.WindDeratingFlag != tt.expectedFlag {
				t.Errorf("Expected wind derating flag %v, got %v",
					tt.expectedFlag, result.WindDeratingFlag)
			}
		})
	}
}

func TestCalculatePVDerating(t *testing.T) {
	calculator := services.NewPVMetricsCalculator()
	
	tests := []struct {
		name            string
		tempC           float64
		precipitationMM float64
		windSpeedMS     float64
		expectedMin     float64
		expectedMax     float64
	}{
		{
			name:            "Ideal conditions",
			tempC:           20.0,
			precipitationMM: 0.0,
			windSpeedMS:     5.0,
			expectedMin:     0.0,
			expectedMax:     1.0,
		},
		{
			name:            "High temperature",
			tempC:           40.0,
			precipitationMM: 0.0,
			windSpeedMS:     5.0,
			expectedMin:     5.0,
			expectedMax:     7.0,
		},
		{
			name:            "High precipitation",
			tempC:           25.0,
			precipitationMM: 25.0,
			windSpeedMS:     5.0,
			expectedMin:     4.0,
			expectedMax:     6.0,
		},
		{
			name:            "Extreme wind",
			tempC:           25.0,
			precipitationMM: 0.0,
			windSpeedMS:     25.0,
			expectedMin:     2.0,
			expectedMax:     4.0,
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			raw := entities.ReadingPayload{
				TemperatureC:    tt.tempC,
				PrecipitationMM: tt.precipitationMM,
				WindSpeedMS:     tt.windSpeedMS,
			}
			
			result := calculator.Calculate(raw, "test", "Test City", time.Now())
			
			if result.PVDeratingPct < tt.expectedMin || result.PVDeratingPct > tt.expectedMax {
				t.Errorf("Expected PV derating between %f and %f, got %f",
					tt.expectedMin, tt.expectedMax, result.PVDeratingPct)
			}
		})
	}
}

