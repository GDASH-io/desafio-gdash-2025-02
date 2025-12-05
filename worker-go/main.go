package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Estrutura esperada vinda do Python
type WeatherPayload struct {
	Timestamp       string  `json:"timestamp"`
	City            string  `json:"city"`
	Temperature     float64 `json:"temperature"`
	Humidity        float64 `json:"humidity"`
	WindSpeed       float64 `json:"wind_speed"`
	Condition       string  `json:"condition"`
	RainProbability float64 `json:"rain_probability"`
}

func main() {
	rabbitURL := os.Getenv("RABBITMQ_URL")
	apiURL := os.Getenv("BACKEND_WEATHER_ENDPOINT")

	if rabbitURL == "" || apiURL == "" {
		log.Fatal("❌ As variáveis de ambiente RABBITMQ_URL e BACKEND_WEATHER_ENDPOINT são obrigatórias.")
	}

	// Conectar ao RabbitMQ
	conn, err := amqp.Dial(rabbitURL)
	if err != nil {
		log.Fatalf("❌ Falha ao conectar RabbitMQ: %v", err)
	}
	defer conn.Close()

	log.Println("🐇 Conectado ao RabbitMQ")

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("❌ Falha ao abrir canal: %v", err)
	}
	defer ch.Close()

	// Assegura que a fila exista
	q, err := ch.QueueDeclare(
		"weather.logs", // nome da fila
		true,           // durable
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("❌ Falha ao declarar fila: %v", err)
	}

	msgs, err := ch.Consume(
		q.Name,
		"",
		false, // auto-ack = false (vamos dar ack manualmente)
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("❌ Falha ao iniciar consumo: %v", err)
	}

	log.Println("👷 Worker Go esperando mensagens...")

	forever := make(chan bool)

	go func() {
		for msg := range msgs {
			log.Println("📨 Mensagem recebida da fila")

			var payload WeatherPayload
			if err := json.Unmarshal(msg.Body, &payload); err != nil {
				log.Printf("❌ Erro ao decodificar JSON: %v\n", err)
				msg.Nack(false, false) // descarta
				continue
			}

			// Enviar para API NestJS
			log.Println("📡 Enviando para backend...")

			success := sendToBackend(apiURL, payload)

			if success {
				msg.Ack(false)
				log.Println("✅ ACK enviado ao RabbitMQ")
			} else {
				msg.Nack(false, true) // requeue
				log.Println("🔁 Reenviando mensagem (retry)")
			}
		}
	}()

	<-forever
}

func sendToBackend(apiURL string, data WeatherPayload) bool {
	jsonBytes, _ := json.Marshal(data)

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonBytes))
	if err != nil {
		log.Printf("❌ Erro ao criar requisição: %v", err)
		return false
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)

	if err != nil {
		log.Printf("❌ Erro ao enviar requisição: %v", err)
		return false
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		log.Println("🌤️ Dados enviados com sucesso:", string(body))
		return true
	}

	log.Printf("⚠️ Backend respondeu com erro (%d): %s\n", resp.StatusCode, string(body))
	return false
}
