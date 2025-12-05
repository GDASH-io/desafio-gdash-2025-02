package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/rabbitmq/amqp091-go"
)

type WeatherInput struct {
	Current struct {
		Temp            float64 `json:"temperature_2m"`
		Humidity        float64 `json:"relative_humidity_2m"`
		WindSpeed       float64 `json:"wind_speed_10m"`
		RainProbability float64 `json:"precipitation_probability"`
	} `json:"current"`
}

type WeatherPayload struct {
	Temperature     float64 `json:"temperature"`
	Humidity        float64 `json:"humidity"`
	WindSpeed       float64 `json:"windSpeed"`
	RainProbability float64 `json:"rainProbability"`
}

func main() {
	rabbitmqHost := os.Getenv("RABBITMQ_HOST")
	if rabbitmqHost == "" {
		rabbitmqHost = "localhost"
	}
	rabbitmqUser := os.Getenv("RABBITMQ_USER")
	if rabbitmqUser == "" {
		rabbitmqUser = "guest"
	}
	rabbitmqPassword := os.Getenv("RABBITMQ_PASSWORD")
	if rabbitmqPassword == "" {
		rabbitmqPassword = "guest"
	}
	backendURL := os.Getenv("BACKEND_URL")
	if backendURL == "" {
		backendURL = "http://localhost:3000"
	}

	amqpURL := fmt.Sprintf("amqp://%s:%s@%s:5672/", rabbitmqUser, rabbitmqPassword, rabbitmqHost)
	conn, err := amqp091.Dial(amqpURL)
	if err != nil {
		log.Fatalf("❌ Falha ao conectar RabbitMQ: %v", err)
	}
	defer conn.Close()
	log.Println("✅ Conectado ao RabbitMQ")

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("❌ Falha ao abrir canal: %v", err)
	}
	defer ch.Close()

	_, err = ch.QueueDeclare(
		"weather_data",
		true, // durable - deve ser true como no producer
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("❌ Falha ao declarar fila: %v", err)
	}

	msgs, err := ch.Consume(
		"weather_data",
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("❌ Falha ao consumir da fila: %v", err)
	}

	log.Println("🚀 Worker rodando e esperando mensagens da fila...")

	for d := range msgs {
		var input WeatherInput
		if err := json.Unmarshal(d.Body, &input); err != nil {
			log.Printf("❌ Erro ao desserializar JSON: %v", err)
			d.Ack(false)
			continue
		}

		payload := WeatherPayload{
			Temperature:     input.Current.Temp,
			Humidity:        input.Current.Humidity,
			WindSpeed:       input.Current.WindSpeed,
			RainProbability: input.Current.RainProbability,
		}

		payloadBytes, err := json.Marshal(payload)
		if err != nil {
			log.Printf("❌ Erro ao serializar payload: %v", err)
			d.Nack(false, true)
			continue
		}

		resp, err := http.Post(backendURL+"/weather", "application/json", bytes.NewBuffer(payloadBytes))

		if err != nil {
			log.Printf("❌ Erro ao enviar para API: %v", err)
			d.Nack(false, true)
			continue
		}

		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			log.Printf("❌ API retornou erro: %d | Temp: %.1f°C | Umidade: %.0f%% | Chuva: %.0f%%", resp.StatusCode, input.Current.Temp, input.Current.Humidity, input.Current.RainProbability)
			resp.Body.Close()
			d.Nack(false, true)
			continue
		}

		log.Printf("✅ Dados enviados para API! Status: %s | Temp: %.1f°C | Umidade: %.0f%% | Chuva: %.0f%%", resp.Status, input.Current.Temp, input.Current.Humidity, input.Current.RainProbability)
		resp.Body.Close()
		d.Ack(false)
	}
}
