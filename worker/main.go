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

func failOnError(err error, msg string) {
	if err != nil {
		log.Printf("%s: %s", msg, err)
	}
}

func connectRabbitMQ() (*amqp.Connection, error) {
	user := os.Getenv("RABBITMQ_USER")
	pass := os.Getenv("RABBITMQ_PASSWORD")
	host := os.Getenv("RABBITMQ_HOST")
	port := os.Getenv("RABBITMQ_PORT")

	if user == "" {
		user = "guest"
	}
	if pass == "" {
		pass = "guest"
	}
	if host == "" {
		host = "rabbitmq"
	}
	if port == "" {
		port = "5672"
	}

	connStr := fmt.Sprintf("amqp://%s:%s@%s:%s/", user, pass, host, port)

	var counts int64
	var backOff = 1 * time.Second

	for {
		conn, err := amqp.Dial(connStr)
		if err == nil {
			log.Println("Connected to RabbitMQ")
			return conn, nil
		}

		log.Printf("Failed to connect to RabbitMQ: %v. Retrying in %v...", err, backOff)
		counts++

		if counts > 10 {
			return nil, err
		}

		time.Sleep(backOff)
		backOff *= 2
		if backOff > 30*time.Second {
			backOff = 30 * time.Second
		}
	}
}

func postToBackend(data []byte) error {
	backendURL := os.Getenv("BACKEND_URL")
	if backendURL == "" {
		backendURL = "http://backend:3000/weather/logs"
	}

	resp, err := http.Post(backendURL, "application/json", bytes.NewBuffer(data))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("backend returned status: %d", resp.StatusCode)
	}

	return nil
}

func main() {
	conn, err := connectRabbitMQ()
	if err != nil {
		log.Fatalf("Could not connect to RabbitMQ: %s", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"weather_data", // name
		true,           // durable
		false,          // delete when unused
		false,          // exclusive
		false,          // no-wait
		nil,            // arguments
	)
	failOnError(err, "Failed to declare a queue")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack (we will manually ack)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Failed to register a consumer")

	var forever chan struct{}

	go func() {
		for d := range msgs {
			log.Printf("Received a message: %s", d.Body)

			// Try to send to backend
			err := postToBackend(d.Body)
			if err != nil {
				log.Printf("Failed to post to backend: %v", err)
				// Nack and requeue with a slight delay to avoid tight loop
				time.Sleep(2 * time.Second)
				d.Nack(false, true)
			} else {
				log.Println("Successfully posted to backend")
				d.Ack(false)
			}
		}
	}()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever
}
