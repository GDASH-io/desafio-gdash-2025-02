package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"

	"github.com/rabbitmq/amqp091-go"
)

type WeatherInput struct {
	Current struct {
		Temp      float64 `json:"temperature_2m"`
		Humidity  float64 `json:"relative_humidity_2m"`
		WindSpeed float64 `json:"wind_speed_10m"`
	} `json:"current"`
}

type WeatherPayload struct {
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	WindSpeed   float64 `json:"windSpeed"`
}

func main() {
	conn, err := amqp091.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}
	defer ch.Close()

	// Usamos _ porque não precisamos dos metadados da fila agora
	_, err = ch.QueueDeclare(
		"weather_data",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to declare a queue: %v", err)
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
		log.Fatalf("Failed to register a consumer: %v", err)
	}

	log.Println("Worker rodando e esperando mensagens...")

	for d := range msgs {
		var input WeatherInput
		if err := json.Unmarshal(d.Body, &input); err != nil {
			log.Printf("Erro ao ler JSON: %v", err)
			d.Ack(false)
			continue
		}

		payload := WeatherPayload{
			Temperature: input.Current.Temp,
			Humidity:    input.Current.Humidity,
			WindSpeed:   input.Current.WindSpeed,
		}

		payloadBytes, _ := json.Marshal(payload)
		resp, err := http.Post("http://localhost:3000/weather", "application/json", bytes.NewBuffer(payloadBytes))

		if err != nil {
			log.Printf("Erro ao enviar para API: %v", err)
		} else {
			log.Printf("Dados enviados para API! Status: %s", resp.Status)
			resp.Body.Close()
		}

		d.Ack(false)
	}
}
