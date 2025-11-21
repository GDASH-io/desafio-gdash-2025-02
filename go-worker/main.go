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

const (
	defaultRabbitMQHost = "localhost"
	defaultRabbitMQPort = "5672"
	defaultRabbitMQUser = "guest"
	defaultRabbitMQPass = "guest"
	defaultNestjsAPIURL = "http://localhost:3000"
	queueName           = "weather_data"
	maxRetries          = 5
	retryDelay          = 5 * time.Second
)

type WeatherData struct {
	Timestamp           string  `json:"timestamp"`
	Latitude            float64 `json:"latitude"`
	Longitude           float64 `json:"longitude"`
	Temperature         float64 `json:"temperature"`
	Windspeed           float64 `json:"windspeed"`
	Weathercode         int     `json:"weathercode"`	
	IsDay               int     `json:"is_day"`
	Humidity            int     `json:"humidity,omitempty"`
	PrecipitationProbability int `json:"precipitation_probability,omitempty"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %v", msg, err)
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func main() {
	rabbitMQHost := getEnv("RABBITMQ_HOST", defaultRabbitMQHost)
	rabbitMQPort := getEnv("RABBITMQ_PORT", defaultRabbitMQPort)
	rabbitMQUser := getEnv("RABBITMQ_USER", defaultRabbitMQUser)
	rabbitMQPass := getEnv("RABBITMQ_PASS", defaultRabbitMQPass)
	nestjsAPIURL := getEnv("NESTJS_API_URL", defaultNestjsAPIURL)

	rabbitMQConnStr := fmt.Sprintf("amqp://%s:%s@%s:%s/", rabbitMQUser, rabbitMQPass, rabbitMQHost, rabbitMQPort)

	conn, err := amqp.Dial(rabbitMQConnStr)
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		queueName, // name
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	failOnError(err, "Failed to declare a queue")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Failed to register a consumer")

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf("Received a message: %s", d.Body)

			var weatherData WeatherData
			err := json.Unmarshal(d.Body, &weatherData)
			if err != nil {
				log.Printf("Error unmarshaling JSON: %v, Nacking message", err)
				d.Nack(false, false)
				continue
			}

			// Send data to NestJS API with retry logic
			retries := 0
			success := false
			for retries < maxRetries {
				err = sendToNestJSAPI(weatherData, nestjsAPIURL)
				if err != nil {
					log.Printf("Error sending to NestJS API: %v, Retrying in %v", err, retryDelay)
					retries++
					time.Sleep(retryDelay)
				} else {
					success = true
					break
				}
			}

			if success {
				log.Printf("Successfully processed message and sent to NestJS API. Acking message.")
				d.Ack(false)
			} else {
				log.Printf("Failed to send message to NestJS API after %d retries. Nacking message.", maxRetries)
				d.Nack(false, true) // Requeue the message
			}
		}
	}()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever
}

func sendToNestJSAPI(data WeatherData, apiURL string) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("error marshaling weather data to JSON: %w", err)
	}

	resp, err := http.Post(fmt.Sprintf("%s/api/weather/logs", apiURL), "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("error sending data to NestJS API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code from NestJS API: %d", resp.StatusCode)
	}

	return nil
}
