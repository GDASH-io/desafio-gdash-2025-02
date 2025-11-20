package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type WeatherReading struct {
	City            string  `json:"city"`
	Timestamp       string  `json:"timestamp"`
	TemperatureC    float64 `json:"temperatureC"`
	Humidity        float64 `json:"humidity"`
	WindSpeedKmh    float64 `json:"windSpeedKmh"`
	Condition       string  `json:"condition"`
	RainProbability float64 `json:"rainProbability"`
	Raw             interface{} `json:"raw,omitempty"`
}

var (
	rabbitmqURL          = getEnv("RABBITMQ_URL", "amqp://admin:admin123@localhost:5672/")
	rabbitmqQueue        = getEnv("RABBITMQ_QUEUE", "weather.readings")
	apiBaseURL           = getEnv("API_BASE_URL", "http://localhost:3000")
	apiWeatherIngestPath = getEnv("API_WEATHER_INGEST_PATH", "/api/weather/logs")
	maxRetries           = getEnvInt("MAX_RETRIES", 3)
)

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		var result int
		if _, err := fmt.Sscanf(value, "%d", &result); err == nil {
			return result
		}
	}
	return defaultValue
}

func connectRabbitMQ() (*amqp.Connection, error) {
	conn, err := amqp.Dial(rabbitmqURL)
	if err != nil {
		return nil, fmt.Errorf("falha ao conectar ao RabbitMQ: %w", err)
	}
	return conn, nil
}

func sendToAPI(reading WeatherReading) error {
	url := apiBaseURL + apiWeatherIngestPath

	jsonData, err := json.Marshal(reading)
	if err != nil {
		return fmt.Errorf("erro ao serializar JSON: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("erro ao enviar requisição: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("resposta não bem-sucedida: %d", resp.StatusCode)
	}

	return nil
}

func processMessage(body []byte) error {
	var reading WeatherReading
	if err := json.Unmarshal(body, &reading); err != nil {
		return fmt.Errorf("erro ao fazer unmarshal: %w", err)
	}

	// Validar campos obrigatórios
	if reading.City == "" {
		return fmt.Errorf("campo 'city' é obrigatório")
	}
	if reading.Timestamp == "" {
		return fmt.Errorf("campo 'timestamp' é obrigatório")
	}

	// Tentar enviar para API com retry
	var lastErr error
	for i := 0; i < maxRetries; i++ {
		if err := sendToAPI(reading); err != nil {
			lastErr = err
			log.Printf("Tentativa %d/%d falhou: %v", i+1, maxRetries, err)
			if i < maxRetries-1 {
				time.Sleep(time.Duration(i+1) * time.Second) // Backoff exponencial simples
			}
		} else {
			log.Printf("✅ Dados enviados com sucesso para a API: %s - %.1f°C", reading.City, reading.TemperatureC)
			return nil
		}
	}

	return fmt.Errorf("falha após %d tentativas: %w", maxRetries, lastErr)
}

func main() {
	log.Println("🚀 Iniciando worker Go")
	log.Printf("RabbitMQ URL: %s", rabbitmqURL)
	log.Printf("RabbitMQ Queue: %s", rabbitmqQueue)
	log.Printf("API Base URL: %s", apiBaseURL)
	log.Printf("Max Retries: %d", maxRetries)

	// Conectar ao RabbitMQ
	conn, err := connectRabbitMQ()
	if err != nil {
		log.Fatalf("❌ Erro ao conectar ao RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("❌ Erro ao abrir canal: %v", err)
	}
	defer ch.Close()

	// Declarar fila
	_, err = ch.QueueDeclare(
		rabbitmqQueue, // nome
		true,          // durable
		false,         // delete when unused
		false,         // exclusive
		false,         // no-wait
		nil,           // arguments
	)
	if err != nil {
		log.Fatalf("❌ Erro ao declarar fila: %v", err)
	}

	// Configurar QoS
	err = ch.Qos(
		1,  // prefetch count
		0,  // prefetch size
		false, // global
	)
	if err != nil {
		log.Fatalf("❌ Erro ao configurar QoS: %v", err)
	}

	// Consumir mensagens
	msgs, err := ch.Consume(
		rabbitmqQueue, // queue
		"",            // consumer
		false,         // auto-ack (false para ack manual)
		false,         // exclusive
		false,         // no-local
		false,         // no-wait
		nil,           // args
	)
	if err != nil {
		log.Fatalf("❌ Erro ao registrar consumidor: %v", err)
	}

	log.Println("✅ Worker pronto para processar mensagens...")

	// Processar mensagens
	for msg := range msgs {
		log.Printf("📨 Mensagem recebida: %s", string(msg.Body))

		if err := processMessage(msg.Body); err != nil {
			log.Printf("❌ Erro ao processar mensagem: %v", err)
			// Ack mesmo em caso de erro para evitar loop infinito
			// Em produção, você pode querer usar uma fila de dead letters
			msg.Ack(false)
		} else {
			msg.Ack(false)
		}
	}
}

