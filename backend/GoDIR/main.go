package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/rabbitmq/amqp091-go"
	"github.com/joho/godotenv"
)

type WeatherPayload struct {
	CityName string  `json:"cityName"`
	Temp     float64 `json:"tempture"`
	Rain     float64 `json:"rain"`
	Humidity float64 `json:"humidity"`
	Sun      float64 `json:"sun"`
	TempAll  string  `json:"allTemp"`
	Cloud    float64 `json:"cloud"`
}

func connectRabbit(url string) *amqp091.Connection {
	var conn *amqp091.Connection
	var err error

	maxRetries := 10

	for i := 1; i <= maxRetries; i++ {
		conn, err = amqp091.Dial(url)
		if err == nil {
			log.Println("Conectado ao RabbitMQ com sucesso.")
			return conn
		}

		wait := time.Duration(i*2) * time.Second
		log.Printf("Falha ao conectar ao RabbitMQ (%d/%d). Tentando novamente em %v...",
			i, maxRetries, wait,)

		time.Sleep(wait)
	}

	log.Fatalf("Não foi possível conectar ao RabbitMQ após %d tentativas.", maxRetries)
	return nil
}

func main() {
	godotenv.Load()

	rabbitURL := os.Getenv("RABBITMQ_URL")
	queueName := os.Getenv("QUEUE_NAME")
	nestAPI := os.Getenv("NEST_API_URL")

	if rabbitURL == "" || queueName == "" || nestAPI == "" {
		log.Fatal("ERRO: Variáveis de ambiente faltando (RABBITMQ_URL, QUEUE_NAME, NEST_API_URL)")
	}

	conn := connectRabbit(rabbitURL)
	defer conn.Close()

	channel, err := conn.Channel()
	if err != nil {
		log.Fatalf("Falha ao abrir canal: %v", err)
	}
	defer channel.Close()

	_, err = channel.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Erro ao declarar fila: %v", err)
	}

	msgs, err := channel.Consume(
		queueName,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Erro ao consumir fila: %v", err)
	}

	log.Println("Worker Go iniciado. Aguardando mensagens...")

	for msg := range msgs {
		var payload WeatherPayload
		err := json.Unmarshal(msg.Body, &payload)
		if err != nil {
			msg.Nack(false, false)
			continue
		}

		jsonData, _ := json.Marshal(payload)

		resp, err := http.Post(nestAPI, "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			msg.Nack(false, true)
			continue
		}
		resp.Body.Close()

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			fmt.Println("foi tudo enviado certin", payload)
			msg.Ack(false)
		} else {
			fmt.Println("Nest ta dando esse errin bobo:", resp.Status)
			msg.Nack(false, true)
		}
	}
}
