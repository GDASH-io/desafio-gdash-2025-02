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

type WeatherPayload struct {
	City        string  `json:"city"`
	Timestamp   string  `json:"ts"`
	Temperature float64 `json:"temperature"`
	WindSpeed   float64 `json:"windspeed"`
	Humidity    float64 `json:"humidity"`
}

func main() {
	rabbitURL := getEnv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
	queue := getEnv("RABBITMQ_QUEUE", "weather_logs")
	apiBase := getEnv("API_BASE_URL", "http://api:3000/api")

	// Retry para conectar ao RabbitMQ
	var conn *amqp.Connection
	var err error
	for i := 0; i < 10; i++ {
		conn, err = amqp.Dial(rabbitURL)
		if err == nil {
			break
		}
		log.Printf("Tentando conectar ao RabbitMQ... (%d/10)", i+1)
		time.Sleep(5 * time.Second)
	}
	if err != nil {
		log.Fatalf("Erro ao conectar RabbitMQ após 10 tentativas: %v", err)
	}
	defer conn.Close()
	log.Println("✅ Conectado ao RabbitMQ")

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Erro ao abrir canal: %v", err)
	}
	defer ch.Close()

	// Declara a fila (idempotente - não cria se já existir)
	_, err = ch.QueueDeclare(
		queue, // nome
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // argumentos
	)
	if err != nil {
		log.Fatalf("Erro ao declarar fila: %v", err)
	}

	msgs, err := ch.Consume(queue, "", false, false, false, false, nil)
	if err != nil {
		log.Fatalf("Erro ao consumir fila: %v", err)
	}

	log.Println("Worker aguardando mensagens...")
	for msg := range msgs {
		if err := processMessage(apiBase, msg.Body); err != nil {
			log.Printf("Erro ao processar mensagem: %v", err)
			msg.Nack(false, true)
			continue
		}
		msg.Ack(false)
	}
}

func processMessage(apiBase string, body []byte) error {
	var payload WeatherPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		return fmt.Errorf("payload inválido: %w", err)
	}

	url := fmt.Sprintf("%s/weather/logs", apiBase)
	log.Printf("📤 Enviando para: %s", url)
	log.Printf("📦 Payload: %s", string(body))

	client := http.Client{Timeout: 5 * time.Second}
	req, err := http.NewRequest(
		http.MethodPost,
		url,
		bytes.NewReader(body),
	)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("❌ Erro ao conectar: %v", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		log.Printf("❌ API retornou %d para URL: %s", resp.StatusCode, url)
		return fmt.Errorf("API respondeu com status %d", resp.StatusCode)
	}

	log.Printf("✅ Mensagem enviada para API: %s", payload.Timestamp)
	return nil
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

