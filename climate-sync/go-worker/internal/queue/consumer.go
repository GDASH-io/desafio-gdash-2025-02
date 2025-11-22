package queue

import (
	"context"
	"encoding/json"
	"log"

	"github.com/mlluiz39/go-worker/internal/config"
	"github.com/mlluiz39/go-worker/internal/processor"
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

	// Criar exchange enterprise
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

	// Criar fila exclusiva do Go Worker
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

	// Bind da fila ao exchange + routing key
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

	processor := processor.NewWeatherProcessor()

	for msg := range msgs {
		var payload map[string]interface{}

		if err := json.Unmarshal(msg.Body, &payload); err != nil {
			log.Println("❌ Failed to parse message:", err)
			msg.Nack(false, false) // descarta sem requeue
			continue
		}

		log.Println("🌦️ Received weather payload:")

		processor.Handle(context.Background(), payload)

		msg.Ack(false) // Confirma processamento
	}

	return nil
}
