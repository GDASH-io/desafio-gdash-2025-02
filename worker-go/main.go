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

// --- Configurações Globais ---
var (
	QueueName = "weather_data"
	ApiURL string
)

type WeatherData struct {
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	WindSpeed   float64 `json:"wind_speed"`
	Timestamp   string  `json:"timestamp"`
}

func main() {
	// 1. Configuração via Variáveis de Ambiente (Docker)
	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		rabbitURL = "amqp://user:password123@localhost:5672/"
	}

	ApiURL = os.Getenv("API_URL")
	if ApiURL == "" {
		ApiURL = "http://localhost:3000/api/weather/logs"
	}

	log.Printf("Iniciando Worker...")
	log.Printf("RabbitMQ: %s", rabbitURL)
	log.Printf("API Alvo: %s", ApiURL)

	// 2. Conexão com Retry (Essencial para Docker Compose)
	var conn *amqp.Connection
	var err error

	for i := 0; i < 10; i++ {
		conn, err = amqp.Dial(rabbitURL)
		if err == nil {
			log.Println("✅ Conectado ao RabbitMQ!")
			break
		}
		log.Printf("⚠️ Falha ao conectar (Tentativa %d/10): %s. Retentando em 5s...", i+1, err)
		time.Sleep(5 * time.Second)
	}

	if err != nil {
		log.Fatalf("❌ Erro fatal: Não foi possível conectar ao RabbitMQ: %s", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir canal")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		QueueName, // nome
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	failOnError(err, "Falha ao declarar fila")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack (Manual para garantir entrega)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Falha ao registrar consumidor")

	// 5. Loop de Processamento
	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			log.Printf("📩 Mensagem recebida")

			var data WeatherData
			err := json.Unmarshal(d.Body, &data)
			if err != nil {
				log.Printf("❌ Erro JSON: %s", err)
				d.Nack(false, false)
				continue
			}

			err = sendToAPI(data)
			if err != nil {
				log.Printf("⚠️ Erro ao enviar para API: %s", err)
				d.Nack(false, true)
				time.Sleep(5 * time.Second) 
				continue
			}

			log.Printf("✅ Sucesso! %.1f°C enviado para API.", data.Temperature)
			d.Ack(false) 
		}
	}()

	log.Printf(" [*] Worker Go aguardando mensagens...")
	<-forever
}

// Envia o POST para o NestJS
func sendToAPI(data WeatherData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("POST", ApiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return  err
	}

	return nil
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}