package main

import (
	"bytes"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Configuration constants
const (
	QueueName   = "weather_data"
	ContentType = "application/json"
)

// Global HTTP client with timeout configuration
var httpClient = &http.Client{
	Timeout: 10 * time.Second,
}

// Helper to handle critical errors during startup
func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

// dispatchPayload forwards the message body to the Backend API
func dispatchPayload(jsonBody []byte) {
	apiHost := os.Getenv("API_HOST")
	if apiHost == "" {
		apiHost = "localhost"
	}

	apiURL := fmt.Sprintf("http://%s:3000/weather", apiHost)

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Printf("[ERROR] Failed to create request: %v", err)
		return
	}
	req.Header.Set("Content-Type", ContentType)

	resp, err := httpClient.Do(req)
	if err != nil {
		log.Printf("[ERROR] API Request failed (%s): %v", apiURL, err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 201 || resp.StatusCode == 200 {
		log.Printf("[INFO] Payload processed successfully. Status: %s", resp.Status)
	} else {
		log.Printf("[WARN] API rejected payload. Status: %d", resp.StatusCode)
	}
}

func main() {
	rabbitHost := os.Getenv("RABBIT_HOST")
	if rabbitHost == "" {
		rabbitHost = "localhost"
	}

	connString := fmt.Sprintf("amqp://admin:password123@%s:5672/", rabbitHost)
	
	log.Printf("[INIT] Connecting to RabbitMQ at %s...", rabbitHost)

	conn, err := amqp.Dial(connString)
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		QueueName, // name
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
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Failed to register a consumer")

	// Keep the worker running
	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			log.Printf("[RECEIVED] Processing message size: %d bytes", len(d.Body))
			dispatchPayload(d.Body)
		}
	}()

	log.Printf("[READY] Worker started. Waiting for messages in '%s'", QueueName)
	<-forever
}