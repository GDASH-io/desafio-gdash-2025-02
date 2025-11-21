package usecases

import (
	"encoding/json"
	"fmt"
	"time"
	"github.com/gdash/worker-go/application/services"
	"github.com/gdash/worker-go/domain/entities"
	"github.com/gdash/worker-go/domain/repositories"
)

// ProcessReadingUseCase orquestra o processamento de leituras
type ProcessReadingUseCase struct {
	validator          *services.Validator
	pvMetricsCalculator *services.PVMetricsCalculator
	kafkaProducer      repositories.KafkaProducerRepository
	apiClient          repositories.APIClientRepository
}

// NewProcessReadingUseCase cria um novo use case
func NewProcessReadingUseCase(
	validator *services.Validator,
	pvMetricsCalculator *services.PVMetricsCalculator,
	kafkaProducer repositories.KafkaProducerRepository,
	apiClient repositories.APIClientRepository,
) *ProcessReadingUseCase {
	return &ProcessReadingUseCase{
		validator:          validator,
		pvMetricsCalculator: pvMetricsCalculator,
		kafkaProducer:      kafkaProducer,
		apiClient:          apiClient,
	}
}

// Process processa uma mensagem raw e gera leitura processada
func (uc *ProcessReadingUseCase) Process(rawMessage []byte) error {
	// Validar mensagem
	rawReading, err := uc.validator.ValidateRawMessage(rawMessage)
	if err != nil {
		return fmt.Errorf("validação falhou: %w", err)
	}
	
	// Processar cada item do payload
	var processedReadings []*entities.ProcessedReading
	
	for _, payload := range rawReading.Payload {
		// Parsear timestamp
		timestamp, err := time.Parse(time.RFC3339, payload.Timestamp)
		if err != nil {
			// Tentar outros formatos
			timestamp, err = time.Parse("2006-01-02T15:04:05-07:00", payload.Timestamp)
			if err != nil {
				timestamp = time.Now() // Fallback
			}
		}
		
		// Calcular métricas PV
		processed := uc.pvMetricsCalculator.Calculate(
			payload,
			rawReading.Source,
			rawReading.City,
			timestamp,
		)
		
		processedReadings = append(processedReadings, processed)
	}
	
	// Publicar mensagens processadas no Kafka
	for _, processed := range processedReadings {
		processedJSON, err := json.Marshal(processed)
		if err != nil {
			return fmt.Errorf("erro ao serializar leitura processada: %w", err)
		}
		
		if err := uc.kafkaProducer.Publish("ana.processed.readings", processedJSON); err != nil {
			return fmt.Errorf("erro ao publicar no Kafka: %w", err)
		}
	}
	
	// Enviar para API NestJS
	// Converter para formato esperado pela API
	apiLogs := make([]interface{}, len(processedReadings))
	for i, pr := range processedReadings {
		apiLogs[i] = map[string]interface{}{
			"timestamp":            pr.Timestamp.Format(time.RFC3339),
			"city":                 pr.City,
			"source":               pr.Source,
			"temperature_c":        pr.TemperatureC,
			"relative_humidity":    pr.RelativeHumidity,
			"precipitation_mm":     pr.PrecipitationMM,
			"wind_speed_m_s":       pr.WindSpeedMS,
			"clouds_percent":       pr.CloudsPercent,
			"weather_code":         pr.WeatherCode,
			"estimated_irradiance_w_m2": pr.EstimatedIrradianceW,
			"temp_effect_factor":   pr.TempEffectFactor,
			"soiling_risk":         pr.SoilingRisk,
			"wind_derating_flag":   pr.WindDeratingFlag,
			"pv_derating_pct":      pr.PVDeratingPct,
		}
	}
	
	// Enviar para API com retry
	var lastErr error
	for i := 0; i < 3; i++ {
		if err := uc.apiClient.SendWeatherLogs(apiLogs); err != nil {
			lastErr = err
			if i < 2 {
				time.Sleep(time.Duration(i+1) * time.Second) // Exponential backoff
			}
			continue
		}
		return nil // Sucesso
	}
	
	return fmt.Errorf("erro ao enviar para API após 3 tentativas: %w", lastErr)
}

