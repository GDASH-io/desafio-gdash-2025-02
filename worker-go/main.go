package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	RabbitMQURL = "amqp://user:password123@localhost:5672/"
	QueueName   = "weather_data"
	// api
	ApiURL      = "http://localhost:3000/api/weather/logs"
)

type WeatherData struct {
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	WindSpeed   float64 `json:"wind_speed"`
	Timestamp   string  `json:"timestamp"`
}

func main() {
	// Connection
	conn, err := amqp.Dial(RabbitMQURL)
	failOnError(err, "Falha ao conectar no RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir canal")
	defer ch.Close()

	// Fila
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
		false,  // auto-ack (ativado)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Falha ao registrar consumidor")

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			log.Printf("📩 Recebido: %s", d.Body)

			var data WeatherData
			err := json.Unmarshal(d.Body, &data)
			if err != nil {
				log.Printf("❌ Erro JSON: %s. Rejeitando mensagem...", err)
				d.Nack(false, false) 
				continue
			}

			err = sendToAPI(data)
			if err != nil {
				log.Printf("⚠️ Erro ao enviar para API: %s. Tentando novamente em breve...", err)
				d.Nack(false, true) 
				time.Sleep(5 * time.Second)
				continue
			}

			log.Printf("✅ Sucesso! Ack enviado.")
			d.Ack(false)
		}
	}()

	log.Printf(" [*] Worker Go pronto para enviar para %s", ApiURL)
	<-forever
}

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