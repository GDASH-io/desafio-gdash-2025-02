package main

import (
	"encoding/json"
	"bytes"
	"log"
	"net/http"
	"os"

	"github.com/streadway/amqp"
	"worker/core/domain"
)

func connectRabbit() *amqp.Connection {
	urlRabbit := os.Getenv("RABBIT_URL")
	if urlRabbit == "" {
		log.Fatal("[FATAL] RABBIT_URL not set")
	}
	conn, err := amqp.Dial(urlRabbit)
	if err != nil {
		log.Fatal("[FATAL] Failed to connect to RabbitMQ:", err)
	}
	return conn
}

func openChannel(conn *amqp.Connection) (<-chan amqp.Delivery, *amqp.Channel) {
	ch, err := conn.Channel()
	if err != nil {
		log.Fatal("[FATAL] Failed to open channel:", err)
	}

	q, err := ch.QueueDeclare(
		"weather_data",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatal("[FATAL] Failed to declare a queue:", err)
	}

	msgs, err := ch.Consume(
		q.Name,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatal("[FATAL] Failed to register a consumer:", err)
	}

	return msgs, ch
}

func sendToAPI(doc domain.WeatherDocument) {
	apiURL := "http://api:3000/weather/logs"
	payload, err := json.Marshal(doc)
	if err != nil {
		log.Printf("[ERROR] Failed to marshal weather data: %v", err) 
		return
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(payload))
	if err != nil {
		log.Printf("[ERROR] Failed to create request: %v", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[ERROR] Failed to send data to API: %v", err)
		return
	}
	defer resp.Body.Close()
}

func publishLocation(conn *amqp.Connection, payload domain.LocationPayload) error {
	ch, err := conn.Channel()
	if err != nil {
		return err
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"location_data",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	body, _ := json.Marshal(payload)
	return ch.Publish(
		"",
		q.Name,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
}

func locationHandler(conn *amqp.Connection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var payload domain.LocationPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		if payload.UserID == "" {
			http.Error(w, "userId is required", http.StatusBadRequest)
			return
		}

		if err := publishLocation(conn, payload); err != nil {
			log.Printf("[ERROR] Failed to publish location: %v", err)
			http.Error(w, "Failed to process location", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"Location received and queued"}`))
	}
}


func main() {
	conn := connectRabbit()
	defer conn.Close()
	http.HandleFunc("/location", locationHandler(conn))
	go func() {
		msgs, ch := openChannel(conn)
		defer ch.Close()

		log.Println("[INFO] Worker running, waiting for weather_data messages...")

		for d := range msgs {
			var doc domain.WeatherDocument
			if err := json.Unmarshal(d.Body, &doc); err != nil {
				log.Printf("[ERROR] Failed to parse message: %v", err)
				continue
			}
			log.Printf("[PARSED] %+v\n", doc)
			sendToAPI(doc)
		}
	}()
	log.Printf("[INFO] HTTP server running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}