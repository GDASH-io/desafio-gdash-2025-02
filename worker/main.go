package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type WeatherMessage struct {
	Timestamp        string   `json:"timestamp"`
	Location         string   `json:"location"`
	Temperature      float64  `json:"temperature"`
	Humidity         float64  `json:"humidity"`
	WindSpeed        float64  `json:"windSpeed"`
	WeatherCondition string   `json:"weatherCondition"`
	RainProbability  *float64 `json:"rainProbability,omitempty"`
	Source           string   `json:"source"`
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func main() {
	rabbitHost := getEnv("RABBITMQ_HOST", "rabbitmq")
	queueName := getEnv("RABBITMQ_QUEUE", "weather_logs")
	apiBaseURL := getEnv("API_BASE_URL", "http://api:3000")
	prefetchStr := getEnv("WORKER_PREFETCH", "1")

	prefetch, err := strconv.Atoi(prefetchStr)
	if err != nil {
		prefetch = 1
	}

	maxRetriesStr := getEnv("MAX_RETRIES", "3")
	maxRetries, err := strconv.Atoi(maxRetriesStr)
	if err != nil {
		maxRetries = 3
	}

	log.Printf("🚀 Starting Go worker...")
	log.Printf("RabbitMQ host: %s, queue: %s", rabbitHost, queueName)
	log.Printf("API base URL: %s", apiBaseURL)
	log.Printf("Prefetch: %d, Max retries: %d", prefetch, maxRetries)

	conn, err := amqp.Dial(fmt.Sprintf("amqp://guest:guest@%s:5672/", rabbitHost))
	if err != nil {
		log.Fatalf("❌ Failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("❌ Failed to open a channel: %v", err)
	}
	defer ch.Close()

	_, err = ch.QueueDeclare(
		queueName,
		true,  // durable
		false, // autoDelete
		false, // exclusive
		false, // noWait
		nil,   // args
	)
	if err != nil {
		log.Fatalf("❌ Failed to declare queue: %v", err)
	}

	err = ch.Qos(prefetch, 0, false)
	if err != nil {
		log.Fatalf("❌ Failed to set QoS: %v", err)
	}

	msgs, err := ch.Consume(
		queueName,
		"",
		false, // autoAck = false (vamos dar ack na mão)
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("❌ Failed to register consumer: %v", err)
	}

	apiClient := &http.Client{
		Timeout: 10 * time.Second,
	}

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			log.Printf("📨 Received message: %s", d.Body)

			var weather WeatherMessage
			if err := json.Unmarshal(d.Body, &weather); err != nil {
				log.Printf("❌ Invalid JSON, rejecting message: %v", err)
				d.Nack(false, false) // descarta a mensagem
				continue
			}

			// Validação básica
			if weather.Timestamp == "" || weather.Location == "" {
				log.Printf("❌ Missing required fields (timestamp/location), rejecting")
				d.Nack(false, false)
				continue
			}

			success := false
			for attempt := 1; attempt <= maxRetries; attempt++ {
				log.Printf("➡️ Sending to API (attempt %d/%d)...", attempt, maxRetries)

				if sendToAPI(apiClient, apiBaseURL, weather) {
					success = true
					break
				}

				time.Sleep(time.Duration(attempt) * time.Second)
			}

			if success {
				log.Printf("✅ Message processed successfully, ack")
				d.Ack(false)
			} else {
				log.Printf("❌ Failed to process message after %d attempts, nack & requeue", maxRetries)
				d.Nack(false, true) // requeue para tentar de novo depois
			}
		}
	}()

	log.Println("👂 Waiting for messages. To exit, press CTRL+C")
	<-forever
}

func sendToAPI(client *http.Client, apiBaseURL string, msg WeatherMessage) bool {
	url := fmt.Sprintf("%s/api/weather/logs", apiBaseURL)

	body, err := json.Marshal(msg)
	if err != nil {
		log.Printf("❌ Failed to marshal message: %v", err)
		return false
	}

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		log.Printf("❌ Failed to create request: %v", err)
		return false
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("❌ Error calling API: %v", err)
		return false
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		log.Printf("✅ API responded with status: %d", resp.StatusCode)
		return true
	}

	log.Printf("❌ API responded with status: %d", resp.StatusCode)
	return false
}
