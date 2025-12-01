package processor

import (
	"encoding/json"
	"fmt"
	"log"
	"weathernator/worker/api"
	"weathernator/worker/models"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Processor struct {
	apiClient *api.Client
}

func NewProcessor(apiClient *api.Client) *Processor {
	return &Processor{
		apiClient: apiClient,
	}
}

func (p *Processor) ProcessMessages(msgs <-chan amqp.Delivery) {
	for d := range msgs {
		if err := p.processMessage(d); err != nil {
			log.Printf("❌ Erro ao processar mensagem: %v", err)
		}
		log.Println("---")
	}
}

func (p *Processor) processMessage(d amqp.Delivery) error {
	var weatherData models.WeatherData
	if err := json.Unmarshal(d.Body, &weatherData); err != nil {
		log.Printf("❌ Erro ao deserializar mensagem: %v", err)
		log.Printf("📄 Body da mensagem: %s", string(d.Body))
		d.Nack(false, false)
		return err
	}

	log.Printf("📨 Mensagem recebida: %s - %s",
		weatherData.Timestamp,
		weatherData.Location.Name)

	// Log dos valores recebidos
	p.logWeatherData(weatherData)

	// Validar dados críticos
	p.validateWeatherData(weatherData)

	// Enviar para API
	if err := p.apiClient.SendWeatherData(weatherData); err != nil {
		log.Printf("❌ Erro ao enviar para API: %v", err)
		d.Nack(false, true)
		return err
	}

	log.Printf("✅ Dados enviados com sucesso para API")
	d.Ack(false)
	return nil
}

func (p *Processor) logWeatherData(data models.WeatherData) {
	log.Printf("   🌡️  Temperatura: %s°C", formatValue(data.Temperature))
	log.Printf("   💧 Umidade: %s%%", formatValue(data.Humidity))
	log.Printf("   🌬️  Vento: %s km/h", formatValue(data.WindSpeed))
	log.Printf("   🌧️  Prob. Chuva: %s%%", formatValue(data.PrecipitationProbability))
	log.Printf("   🔢 Weather Code: %s", formatIntValue(data.WeatherCode))
	log.Printf("   ☁️  Condição: %s", data.Condition)
}

func (p *Processor) validateWeatherData(data models.WeatherData) {
	if data.Temperature == nil {
		log.Printf("⚠️  Aviso: temperatura não disponível")
	}
	if data.WindSpeed == nil {
		log.Printf("⚠️  Aviso: velocidade do vento não disponível")
	}
	if data.PrecipitationProbability == nil {
		log.Printf("⚠️  Aviso: probabilidade de chuva não disponível")
	}
}

func formatValue(val *float64) string {
	if val == nil {
		return "N/A"
	}
	return fmt.Sprintf("%.1f", *val)
}

func formatIntValue(val *int) string {
	if val == nil {
		return "N/A"
	}
	return fmt.Sprintf("%d", *val)
}
