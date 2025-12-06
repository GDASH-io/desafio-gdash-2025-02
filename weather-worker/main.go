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

var (
	rabbitMQHost     = getEnv("RABBITMQ_HOST", "localhost")
	rabbitMQPort     = getEnv("RABBITMQ_PORT", "5672")
	rabbitMQUser     = getEnv("RABBITMQ_USER", "guest")
	rabbitMQPass     = getEnv("RABBITMQ_PASS", "guest")
	rabbitMQQueue    = getEnv("RABBITMQ_QUEUE", "weather_data")
	apiURL           = getEnv("API_URL", "http://localhost:3000")
	maxRetries       = 3
	retryDelay       = 5 * time.Second
)

type WeatherData struct {
	Timestamp string `json:"timestamp"`
	Location  struct {
		Latitude  float64  `json:"latitude"`
		Longitude float64  `json:"longitude"`
		City      *string  `json:"city,omitempty"`
	} `json:"location"`
	Current struct {
		Temperature float64 `json:"temperature"`
		Humidity    float64 `json:"humidity"`
		WindSpeed   float64 `json:"wind_speed"`
		WeatherCode int     `json:"weather_code"`
	} `json:"current"`
	Forecast struct {
		Hourly []HourlyForecast `json:"hourly"`
	} `json:"forecast"`
}

type HourlyForecast struct {
	Time                   string  `json:"time"`
	Temperature            *float64 `json:"temperature,omitempty"`
	Humidity               *float64 `json:"humidity,omitempty"`
	WindSpeed              *float64 `json:"wind_speed,omitempty"`
	PrecipitationProbability *float64 `json:"precipitation_probability,omitempty"`
	WeatherCode            *int     `json:"weather_code,omitempty"`
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func connectRabbitMQ() (*amqp.Connection, *amqp.Channel, error) {
	url := fmt.Sprintf("amqp://%s:%s@%s:%s/", rabbitMQUser, rabbitMQPass, rabbitMQHost, rabbitMQPort)
	
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, nil, fmt.Errorf("falha ao conectar ao RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, nil, fmt.Errorf("falha ao abrir canal: %w", err)
	}

	_, err = ch.QueueDeclare(
		rabbitMQQueue, // nome
		true,          // durable
		false,         // delete when unused
		false,         // exclusive
		false,         // no-wait
		nil,           // arguments
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, nil, fmt.Errorf("falha ao declarar fila: %w", err)
	}

	log.Printf("Conectado ao RabbitMQ: %s", rabbitMQHost)
	return conn, ch, nil
}

func validateWeatherData(data *WeatherData) error {
	if data.Timestamp == "" {
		return fmt.Errorf("timestamp é obrigatório")
	}
	
	if data.Current.Temperature < -100 || data.Current.Temperature > 100 {
		return fmt.Errorf("temperatura inválida: %.2f", data.Current.Temperature)
	}
	
	if data.Current.Humidity < 0 || data.Current.Humidity > 100 {
		return fmt.Errorf("umidade inválida: %.2f", data.Current.Humidity)
	}
	
	if data.Current.WindSpeed < 0 {
		return fmt.Errorf("velocidade do vento inválida: %.2f", data.Current.WindSpeed)
	}
	
	return nil
}

func sendToAPI(data *WeatherData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("erro ao serializar JSON: %w", err)
	}

	endpoint := fmt.Sprintf("%s/api/weather/logs", apiURL)
	
	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(jsonData))
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

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("API retornou status %d", resp.StatusCode)
	}

	log.Printf("Dados enviados com sucesso para a API (status: %d)", resp.StatusCode)
	return nil
}

func processMessage(body []byte) error {
	var weatherData WeatherData
	
	if err := json.Unmarshal(body, &weatherData); err != nil {
		return fmt.Errorf("erro ao deserializar JSON: %w", err)
	}

	if err := validateWeatherData(&weatherData); err != nil {
		return fmt.Errorf("validação falhou: %w", err)
	}

	var lastErr error
	for attempt := 1; attempt <= maxRetries; attempt++ {
		if err := sendToAPI(&weatherData); err == nil {
			return nil
		} else {
			lastErr = err
			if attempt < maxRetries {
				log.Printf("Tentativa %d/%d falhou, tentando novamente em %v...", attempt, maxRetries, retryDelay)
				time.Sleep(retryDelay)
			}
		}
	}

	return fmt.Errorf("falha após %d tentativas: %w", maxRetries, lastErr)
}

func main() {
	log.Println("Iniciando worker de processamento de dados climáticos...")

	conn, ch, err := connectRabbitMQ()
	if err != nil {
		log.Fatalf("Erro ao conectar ao RabbitMQ: %v", err)
	}
	defer conn.Close()
	defer ch.Close()

	err = ch.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	if err != nil {
		log.Fatalf("Erro ao configurar QoS: %v", err)
	}

	msgs, err := ch.Consume(
		rabbitMQQueue, // queue
		"",            // consumer
		false,         // auto-ack (false para ack manual)
		false,         // exclusive
		false,         // no-local
		false,         // no-wait
		nil,           // args
	)
	if err != nil {
		log.Fatalf("Erro ao registrar consumidor: %v", err)
	}

	log.Printf("Aguardando mensagens da fila '%s'. Para sair, pressione CTRL+C", rabbitMQQueue)

	for msg := range msgs {
		log.Printf("Nova mensagem recebida: %s", string(msg.Body))

		if err := processMessage(msg.Body); err != nil {
			log.Printf("Erro ao processar mensagem: %v", err)
			msg.Nack(false, true)
		} else {
			log.Println("Mensagem processada com sucesso")
			msg.Ack(false)
		}
	}
}

