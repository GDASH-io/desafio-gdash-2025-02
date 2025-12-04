package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	amqp "github.com/rabbitmq/amqp091-go"
)

type WeatherMessage struct {
	City                    string  `json:"city"`
	Datetime                string  `json:"datetime"`
	Temperature             float64 `json:"temperature"`
	WindSpeed               float64 `json:"wind_speed"`
	ConditionCode           int     `json:"condition_code"`
	Humidity                float64 `json:"humidity"`
	PrecipitationProbability float64 `json:"precipitation_probability"`
}

func main() {
	fmt.Println("Worker Go iniciado...")

	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Fatalf("Erro ao conectar no RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Erro ao abrir canal: %v", err)
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
		log.Fatalf("Erro ao declarar fila: %v", err)
	}

	msgs, err := ch.Consume(
		q.Name,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Erro ao consumir mensagens: %v", err)
	}

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			fmt.Println("Mensagem recebida da fila!")

			var weather WeatherMessage
			err := json.Unmarshal(d.Body, &weather)
			if err != nil {
				log.Println("Erro ao decodificar JSON:", err)
				d.Nack(false, false)
				continue
			}

			jsonData, _ := json.Marshal(weather)

			resp, err := http.Post(
				"http://localhost:3000/api/weather/logs",
				"application/json",
				bytes.NewBuffer(jsonData),
			)

			if err != nil {
				log.Println("Erro ao enviar para API:", err)
				d.Nack(false, true)
				continue
			}

			if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
				log.Println("API retornou erro:", resp.StatusCode)
				d.Nack(false, true)
				continue
			}

			fmt.Println("Dados enviados para NestJS com sucesso!")
			d.Ack(false)
		}
	}()

	fmt.Println("Aguardando mensagens...")
	<-forever
}
