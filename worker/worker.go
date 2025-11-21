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
		false,
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
			Temperature: input.Current.Temp,
			Humidity:    input.Current.Humidity,
			WindSpeed:   input.Current.WindSpeed,
		}

		payloadBytes, _ := json.Marshal(payload)
		resp, err := http.Post("http://localhost:3000/weather", "application/json", bytes.NewBuffer(payloadBytes))

		if err != nil {
			log.Printf("❌ Erro ao enviar para API: %v", err)
		} else {
			log.Printf("✅ Dados enviados para API! Status: %s | Temp: %.1f°C | Umidade: %.0f%%", resp.Status, input.Current.Temp, input.Current.Humidity)
			resp.Body.Close()
		}

		d.Ack(false)
	}
}
