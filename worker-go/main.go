package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type WeatherData struct {
	Timestamp   string  `json:"timestamp"`
	Temperature float64 `json:"temperature"`
	Windspeed   float64 `json:"windspeed"`
	Humidity    float64 `json:"humidity"`
	Latitude    string  `json:"latitude"`
	Longitude   string  `json:"longitude"`
	Condition   string  `json:"condition"`
}

func main() {
	rabbitURL := os.Getenv("RABBITMQ_URL")
	apiURL := os.Getenv("API_URL")

	if rabbitURL == "" {
		log.Fatal("RABBITMQ_URL não está definido")
	}
	if !(strings.HasPrefix(rabbitURL, "amqp://") || strings.HasPrefix(rabbitURL, "amqps://")) {
		log.Fatalf("RABBITMQ_URL inválido: deve começar com amqp:// ou amqps://, mas é '%s'", rabbitURL)
	}

	if apiURL == "" {
		log.Fatal("API_URL não está definido")
	}

	fmt.Println("Worker Go iniciado...")
	time.Sleep(60000)
	conn, err := amqp.Dial(rabbitURL)
	if err != nil {
		log.Fatalf("Erro conectando ao RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Erro criando canal: %v", err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"weather_queue",
		true,  
		false, 
		false, 
		false, 
		nil,  
	)
	if err != nil {
		log.Fatalf("Erro declarando fila: %v", err)
	}

	msgs, err := ch.Consume(
		q.Name,
		"",
		false, // auto-ack false => manual
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Erro consumindo fila: %v", err)
	}

	forever := make(chan bool)

	go func() {
		for msg := range msgs {
			log.Printf("Mensagem recebida: %s", msg.Body)

			var weather WeatherData
			if err := json.Unmarshal(msg.Body, &weather); err != nil {
				log.Printf("Erro ao parsear JSON: %v", err)
				msg.Nack(false, false)
				continue
			}

			jsonData, err := json.Marshal(weather)
			if err != nil {
				log.Printf("Erro ao gerar JSON para API: %v", err)
				msg.Nack(false, true)
				continue
			}

			req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
			if err != nil {
				log.Printf("Erro criando request para API: %v", err)
				msg.Nack(false, true)
				continue
			}
			req.Header.Set("Content-Type", "application/json")

			client := http.Client{Timeout: 10 * time.Second}
			resp, err := client.Do(req)
			if err != nil {
				log.Printf("Erro enviando para API: %v", err)
				msg.Nack(false, true)
				continue
			}

			defer resp.Body.Close()

			if resp.StatusCode >= 400 {
				log.Printf("API retornou status de erro: %d", resp.StatusCode)
				msg.Nack(false, true)
				continue
			}

			log.Println("Mensagem enviada para API com sucesso!")
			msg.Ack(false)
		}
	}()

	log.Println("Aguardando mensagens...")
	<-forever
}
