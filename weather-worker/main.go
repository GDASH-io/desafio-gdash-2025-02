package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/rabbitmq/amqp091-go"
)

// WeatherData represents the weather data structure
type WeatherData struct {
	City        string    `json:"city"`
	Country     string    `json:"country"`
	Temperature float64   `json:"temperature"`
	Humidity    int       `json:"humidity"`
	WindSpeed   float64   `json:"windSpeed"`
	Condition   string    `json:"condition"`
	Description string    `json:"description"`
	Pressure    *int      `json:"pressure,omitempty"`
	Visibility  *int      `json:"visibility,omitempty"`
	UVIndex     *int      `json:"uvIndex,omitempty"`
	Cloudiness  int       `json:"cloudiness"`
	Timestamp   time.Time `json:"timestamp"`
	Sunrise     *time.Time `json:"sunrise,omitempty"`
	Sunset      *time.Time `json:"sunset,omitempty"`
}

// WeatherWorker handles processing weather data from the message queue
type WeatherWorker struct {
	rabbitMQURL string
	apiBaseURL  string
	conn        *amqp091.Connection
	ch          *amqp091.Channel
}

// NewWeatherWorker creates a new weather worker instance
func NewWeatherWorker() *WeatherWorker {
	return &WeatherWorker{
		rabbitMQURL: getEnv("RABBITMQ_URL", "amqp://admin:password123@localhost:5672"),
		apiBaseURL:  getEnv("API_BASE_URL", "http://localhost:3000"),
	}
}

// getEnv gets environment variable with fallback
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// Connect establishes connection to RabbitMQ
func (w *WeatherWorker) Connect() error {
	var err error
	
	// Retry connection with backoff
	maxRetries := 5
	for i := 0; i < maxRetries; i++ {
		w.conn, err = amqp091.Dial(w.rabbitMQURL)
		if err == nil {
			break
		}
		
		waitTime := time.Duration(1<<uint(i)) * time.Second // Exponential backoff
		log.Printf("Failed to connect to RabbitMQ (attempt %d/%d): %v. Retrying in %v...", 
			i+1, maxRetries, err, waitTime)
		time.Sleep(waitTime)
	}
	
	if err != nil {
		return fmt.Errorf("failed to connect to RabbitMQ after %d attempts: %v", maxRetries, err)
	}

	w.ch, err = w.conn.Channel()
	if err != nil {
		return fmt.Errorf("failed to open channel: %v", err)
	}

	// Declare the queue (ensure it exists)
	_, err = w.ch.QueueDeclare(
		"weather_data", // name
		true,          // durable
		false,         // delete when unused
		false,         // exclusive
		false,         // no-wait
		nil,           // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %v", err)
	}

	log.Println("Successfully connected to RabbitMQ")
	return nil
}

// Close closes the RabbitMQ connection
func (w *WeatherWorker) Close() {
	if w.ch != nil {
		w.ch.Close()
	}
	if w.conn != nil {
		w.conn.Close()
	}
}

// ProcessWeatherData processes a weather data message
func (w *WeatherWorker) ProcessWeatherData(body []byte) error {
	// Parse JSON message
	var weatherData map[string]interface{}
	if err := json.Unmarshal(body, &weatherData); err != nil {
		return fmt.Errorf("failed to parse JSON: %v", err)
	}

	log.Printf("Processing weather data for: %v", weatherData["city"])

	// Validate required fields
	requiredFields := []string{"city", "country", "temperature", "humidity", "windSpeed", "condition", "description", "timestamp"}
	for _, field := range requiredFields {
		if _, exists := weatherData[field]; !exists {
			return fmt.Errorf("missing required field: %s", field)
		}
	}

	// Parse timestamp
	timestampStr, ok := weatherData["timestamp"].(string)
	if !ok {
		return fmt.Errorf("timestamp is not a string")
	}
	
	timestamp, err := time.Parse(time.RFC3339, timestampStr)
	if err != nil {
		return fmt.Errorf("failed to parse timestamp: %v", err)
	}
	weatherData["timestamp"] = timestamp

	// Parse optional datetime fields
	if sunriseStr, ok := weatherData["sunrise"].(string); ok && sunriseStr != "" {
		if sunrise, err := time.Parse(time.RFC3339, sunriseStr); err == nil {
			weatherData["sunrise"] = sunrise
		}
	}
	if sunsetStr, ok := weatherData["sunset"].(string); ok && sunsetStr != "" {
		if sunset, err := time.Parse(time.RFC3339, sunsetStr); err == nil {
			weatherData["sunset"] = sunset
		}
	}

	// Send to API
	return w.SendToAPI(weatherData)
}

// SendToAPI sends weather data to the NestJS API
func (w *WeatherWorker) SendToAPI(data map[string]interface{}) error {
	url := fmt.Sprintf("%s/api/weather/logs", w.apiBaseURL)
	
	// Convert to JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal JSON: %v", err)
	}

	// Create request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	
	// Make request with timeout
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	log.Printf("Successfully sent weather data to API: %v", data["city"])
	return nil
}

// StartWorker starts consuming messages from the queue
func (w *WeatherWorker) StartWorker() error {
	// Set QoS to process one message at a time
	err := w.ch.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	if err != nil {
		return fmt.Errorf("failed to set QoS: %v", err)
	}

	// Start consuming
	msgs, err := w.ch.Consume(
		"weather_data", // queue
		"",            // consumer
		false,         // auto-ack (we'll ack manually)
		false,         // exclusive
		false,         // no-local
		false,         // no-wait
		nil,           // args
	)
	if err != nil {
		return fmt.Errorf("failed to register consumer: %v", err)
	}

	log.Println("Weather Worker started. Waiting for messages...")

	// Process messages
	for msg := range msgs {
		func() {
			// Create context with timeout for processing
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
			defer cancel()

			// Process the message
			err := w.ProcessWeatherData(msg.Body)
			if err != nil {
				log.Printf("Error processing weather data: %v", err)
				
				// Reject and requeue the message (with limit to prevent infinite loops)
				if msg.DeliveryTag <= 3 { // Max 3 retries
					log.Println("Rejecting message for retry")
					msg.Nack(false, true) // requeue
				} else {
					log.Println("Max retries reached, discarding message")
					msg.Nack(false, false) // don't requeue
				}
				return
			}

			// Acknowledge successful processing
			if err := msg.Ack(false); err != nil {
				log.Printf("Failed to acknowledge message: %v", err)
			}

			// Check if context was cancelled
			select {
			case <-ctx.Done():
				log.Println("Processing cancelled due to timeout")
			default:
				// Continue normally
			}
		}()
	}

	return nil
}

func main() {
	log.Println("Starting Weather Worker...")

	worker := NewWeatherWorker()
	defer worker.Close()

	// Connect to RabbitMQ
	if err := worker.Connect(); err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}

	// Start processing
	if err := worker.StartWorker(); err != nil {
		log.Fatalf("Worker failed: %v", err)
	}
}