package unit

import (
	"testing"
	"github.com/gdash/worker-go/application/services"
)

func TestValidateRawMessage(t *testing.T) {
	validator := services.NewValidator()
	
	tests := []struct {
		name    string
		message string
		wantErr bool
	}{
		{
			name: "Valid message",
			message: `{
				"source": "openmeteo",
				"city": "Coronel Fabriciano",
				"coords": {"lat": -19.5186, "lon": -42.6289},
				"fetched_at": "2025-11-19T20:00:00-03:00",
				"interval": "hourly",
				"payload": [
					{
						"timestamp": "2025-11-19T20:00:00-03:00",
						"temperature_c": 23.5,
						"relative_humidity": 78,
						"precipitation_mm": 0.0,
						"wind_speed_m_s": 2.3,
						"clouds_percent": 75,
						"weather_code": 801
					}
				]
			}`,
			wantErr: false,
		},
		{
			name: "Missing source",
			message: `{
				"city": "Coronel Fabriciano",
				"payload": [
					{"timestamp": "2025-11-19T20:00:00-03:00"}
				]
			}`,
			wantErr: true,
		},
		{
			name: "Missing city",
			message: `{
				"source": "openmeteo",
				"payload": [
					{"timestamp": "2025-11-19T20:00:00-03:00"}
				]
			}`,
			wantErr: true,
		},
		{
			name: "Empty payload",
			message: `{
				"source": "openmeteo",
				"city": "Coronel Fabriciano",
				"payload": []
			}`,
			wantErr: true,
		},
		{
			name: "Missing timestamp in payload",
			message: `{
				"source": "openmeteo",
				"city": "Coronel Fabriciano",
				"payload": [
					{"temperature_c": 23.5}
				]
			}`,
			wantErr: true,
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := validator.ValidateRawMessage([]byte(tt.message))
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateRawMessage() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateRawMessage_InvalidJSON(t *testing.T) {
	validator := services.NewValidator()
	
	invalidJSON := `{invalid json}`
	_, err := validator.ValidateRawMessage([]byte(invalidJSON))
	if err == nil {
		t.Error("Expected error for invalid JSON, got nil")
	}
}

