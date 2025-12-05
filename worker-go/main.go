package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func main() {
	rabbitURL := getEnv("WORKER_RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
	queueName := getEnv("WORKER_QUEUE", "weather_logs")
	apiBase := getEnv("WORKER_API_URL", "http://api:3000/api")

	log.Println("Iniciando worker Go...")
	log.Printf("RabbitMQ URL: %s, fila: %s, API: %s", rabbitURL, queueName, apiBase)

	// tentativa de conexão com retry
	var conn *amqp.Connection
	var err error
	for i := 0; i < 10; i++ {
		conn, err = amqp.Dial(rabbitURL)
		if err == nil {
			break
		}
		log.Printf("Erro ao conectar no RabbitMQ (%v). Tentando novamente em 5s...", err)
		time.Sleep(5 * time.Second)
	}
	if err != nil {
		log.Fatalf("Falha ao conectar no RabbitMQ depois de várias tentativas: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Erro ao abrir canal: %v", err)
	}
	defer ch.Close()

	// garante que a fila existe
	_, err = ch.QueueDeclare(
		queueName,
		true,  // durable
		false, // autoDelete
		false, // exclusive
		false, // noWait
		nil,   // args
	)
	if err != nil {
		log.Fatalf("Erro ao declarar fila '%s': %v", queueName, err)
	}

	msgs, err := ch.Consume(
		queueName,
		"",
		false, // auto-ack
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Erro ao registrar consumidor: %v", err)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	endpoint := apiBase + "/weather/logs"

	log.Printf("Consumindo fila '%s' e enviando para %s", queueName, endpoint)

	for d := range msgs {
		var payload map[string]any
		if err := json.Unmarshal(d.Body, &payload); err != nil {
			log.Printf("Erro ao deserializar mensagem: %v", err)
			d.Nack(false, false)
			continue
		}

		body, err := json.Marshal(payload)
		if err != nil {
			log.Printf("Erro ao serializar body para API: %v", err)
			d.Nack(false, false)
			continue
		}

		req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewBuffer(body))
		if err != nil {
			log.Printf("Erro ao criar requisição: %v", err)
			d.Nack(false, true)
			continue
		}
		req.Header.Set("Content-Type", "application/json")

		resp, err := client.Do(req)
		if err != nil {
			log.Printf("Erro ao chamar API: %v", err)
			d.Nack(false, true)
			continue
		}
		resp.Body.Close()

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			log.Printf("Mensagem processada com sucesso (status %d), ACK", resp.StatusCode)
			d.Ack(false)
		} else {
			log.Printf("API respondeu com status %d, NACK sem requeue", resp.StatusCode)
			d.Nack(false, false)
		}
	}
}
