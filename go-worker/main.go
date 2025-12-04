package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	amqp "github.com/rabbitmq/amqp091-go"
)


type WeatherData struct {
	Temperature float64 `json:"temperature"`
	Windspeed   float64 `json:"windspeed"`
	Humidity    float64 `json:"humidity"`
	Time        string  `json:"time"`
	Lat         float64 `json:"lat"`
	Lon         float64 `json:"lon"`
	City        string  `json:"city"`
}

func main() {


	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ Aviso: .env não encontrado, usando variáveis padrão.")
	}

	rabbitURL := os.Getenv("RABBIT_URL")
	queueName := os.Getenv("QUEUE_NAME")
	backendURL := os.Getenv("BACKEND_URL")

	if rabbitURL == "" || queueName == "" || backendURL == "" {
		log.Fatal("❌ Erro: Variáveis de ambiente ausentes (RABBIT_URL, QUEUE_NAME, BACKEND_URL).")
	}

	
	conn, err := amqp.Dial(rabbitURL)
	if err != nil {
		log.Fatalf("❌ Falha ao conectar ao RabbitMQ: %v", err)
	}
	defer conn.Close()
	log.Println("🐰 Conectado ao RabbitMQ!")

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Erro ao abrir canal: %v", err)
	}
	defer ch.Close()

	
	_, err = ch.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("❌ Erro ao declarar fila: %v", err)
	}

	
	msgs, err := ch.Consume(
		queueName,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("❌ Erro ao consumir fila: %v", err)
	}

	log.Println("🚀 Worker Go iniciado. Aguardando mensagens...")

	forever := make(chan bool)

	go func() {
		for msg := range msgs {
			log.Println("📩 Mensagem recebida da fila!")

			var weather WeatherData
			err := json.Unmarshal(msg.Body, &weather)
			if err != nil {
				log.Printf("Erro ao interpretar JSON: %v\n", err)
				continue
			}

			log.Printf("➡ Dados recebidos: %+v\n", weather)

			
			jsonBody, _ := json.Marshal(weather)
			resp, err := http.Post(backendURL, "application/json", bytes.NewBuffer(jsonBody))
			if err != nil {
				log.Printf("❌ Erro ao enviar para backend: %v\n", err)
				continue
			}

			body, _ := ioutil.ReadAll(resp.Body)
			resp.Body.Close()

			log.Printf("📨 Backend respondeu [%d]: %s\n", resp.StatusCode, string(body))
		}
	}()

	<-forever
}
