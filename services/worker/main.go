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

type WeatherData struct {
	Temperature     float64 `json:"temperature"`
	Humidity        float64 `json:"humidity"`
	WindSpeed       float64 `json:"windSpeed"`
	Condition       string  `json:"condition"`
	RainProbability float64 `json:"rainProbability"`
	Location        string  `json:"location"`
	Latitude        float64 `json:"latitude"`
	Longitude       float64 `json:"longitude"`
	CollectedAt     string  `json:"collectedAt"`
}

var (
	rabbitMQURL  string
	queueName    string
	apiBaseURL   string
	maxRetries   = 3
	retryDelay   = 5 * time.Second
)

func init() {
	rabbitMQURL = getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672")
	queueName = getEnv("RABBITMQ_QUEUE", "weather_data")
	apiBaseURL = getEnv("API_BASE_URL", "http://localhost:3333")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func main() {
	log.Println("==================================================")
	log.Println("GDASH Weather Worker")
	log.Println("==================================================")
	log.Printf("RabbitMQ URL: %s", rabbitMQURL)
	log.Printf("Queue: %s", queueName)
	log.Printf("API Base URL: %s", apiBaseURL)
	log.Println("==================================================")

	// Connect to RabbitMQ with retry
	var conn *amqp.Connection
	var err error

	for i := 0; i < maxRetries; i++ {
		conn, err = amqp.Dial(rabbitMQURL)
		if err == nil {
			break
		}
		log.Printf("Failed to connect to RabbitMQ (attempt %d/%d): %v", i+1, maxRetries, err)
		time.Sleep(retryDelay)
	}

	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ after %d attempts: %v", maxRetries, err)
	}
	defer conn.Close()
	log.Println("Connected to RabbitMQ")

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}
	defer ch.Close()

	// Declare queue
	q, err := ch.QueueDeclare(
		queueName,
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		log.Fatalf("Failed to declare queue: %v", err)
	}

	// Set QoS
	err = ch.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	if err != nil {
		log.Fatalf("Failed to set QoS: %v", err)
	}

	// Start consuming messages
	msgs, err := ch.Consume(
		q.Name,
		"",    // consumer
		false, // auto-ack
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)
	if err != nil {
		log.Fatalf("Failed to register a consumer: %v", err)
	}

	log.Println("Waiting for messages...")

	for msg := range msgs {
		log.Printf("Received message: %s", string(msg.Body))

		var data WeatherData
		if err := json.Unmarshal(msg.Body, &data); err != nil {
			log.Printf("Error parsing message: %v", err)
			msg.Nack(false, false) // Don't requeue malformed messages
			continue
		}

		// Validate data
		if data.Location == "" || data.CollectedAt == "" {
			log.Printf("Invalid data: missing required fields")
			msg.Nack(false, false)
			continue
		}

		// Send to API with retry
		success := false
		for i := 0; i < maxRetries; i++ {
			if err := sendToAPI(data); err != nil {
				log.Printf("Error sending to API (attempt %d/%d): %v", i+1, maxRetries, err)
				time.Sleep(retryDelay)
				continue
			}
			success = true
			break
		}

		if success {
			log.Printf("Successfully processed weather data for %s", data.Location)
			msg.Ack(false)
		} else {
			log.Printf("Failed to process message after %d attempts, requeuing", maxRetries)
			msg.Nack(false, true) // Requeue the message
		}
	}
}

func sendToAPI(data WeatherData) error {
	url := fmt.Sprintf("%s/api/weather/logs", apiBaseURL)

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("error marshaling data: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("error sending request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("API returned status code: %d", resp.StatusCode)
	}

	log.Printf("API response: %d", resp.StatusCode)
	return nil
}
