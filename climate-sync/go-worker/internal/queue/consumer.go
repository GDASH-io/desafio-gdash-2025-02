package queue

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/mlluiz39/go-worker/internal/config"
	"github.com/rabbitmq/amqp091-go"
)

type Consumer struct {
	cfg *config.Config
}

func NewConsumer(cfg *config.Config) *Consumer {
	return &Consumer{cfg: cfg}
}

func (c *Consumer) Start() error {
	conn, err := amqp091.Dial(c.cfg.RabbitURL)
	if err != nil {
		return err
	}

	ch, err := conn.Channel()
	if err != nil {
		return err
	}

	exchangeName := "weather.exchange"
	routingKey := "weather.data"
	queueName := "weather.go.queue"

	// Criar exchange
	err = ch.ExchangeDeclare(
		exchangeName,
		"topic",
		true,  // durable
		false, // auto-delete
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	// Criar fila do Go Worker
	_, err = ch.QueueDeclare(
		queueName,
		true,  // durable
		false, // auto-delete
		false, // exclusive
		false,
		nil,
	)
	if err != nil {
		return err
	}

	// Bind
	err = ch.QueueBind(
		queueName,
		routingKey,
		exchangeName,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	log.Printf("📡 Go Worker listening → exchange: %s | queue: %s | key: %s",
		exchangeName, queueName, routingKey)

	msgs, err := ch.Consume(
		queueName,
		"go-worker",
		false, // manual ACK
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	for msg := range msgs {
		var payload map[string]interface{}

		if err := json.Unmarshal(msg.Body, &payload); err != nil {
			log.Println("❌ Failed to parse message:", err)
			msg.Nack(false, false)
			continue
		}

		log.Println("🌦️ Received weather payload:", payload)

		// Converter payload para JSON
		jsonData, _ := json.Marshal(payload)

		// 🔥 ENVIAR PARA NESTJS EM TEMPO REAL
		realtimeURL := "http://nestjs-api:3000/api/weather/realtime"

		req, _ := http.NewRequest("POST", realtimeURL, bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{
			Timeout: 5 * time.Second,
		}

		resp, err := client.Do(req)

		if err != nil {
			log.Println("❌ Failed to send realtime data to NestJS:", err)
			msg.Nack(false, true) // requeue
			continue
		}

		log.Println("✅ Realtime data sent to NestJS → Status:", resp.StatusCode)
		resp.Body.Close()

		// Confirma consumo
		msg.Ack(false)
	}

	return nil
}
