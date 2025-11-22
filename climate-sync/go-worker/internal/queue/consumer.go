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

	_, err = ch.QueueDeclare(
		c.cfg.QueueName, // name
		true,            // durable
		false,           // delete when unused
		false,           // exclusive
		false,           // no-wait
		nil,             // arguments
	)
	if err != nil {
		return err
	}

	msgs, err := ch.Consume(
		c.cfg.QueueName,
		"",     // consumerTag vazio (evita conflito ao reiniciar)
		false,  // auto-ack DESATIVADO
		false,  // not exclusive
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	log.Printf("📡 Listening queue: %s", c.cfg.QueueName)

	// Instância correta do processor
	weatherProcessor := processor.NewWeatherProcessor()

	for msg := range msgs {
		var payload map[string]interface{}

		if err := json.Unmarshal(msg.Body, &payload); err != nil {
			log.Println("❌ Failed to parse message:", err)
			msg.Nack(false, false) // descarta mensagem inválida
			continue
		}

		// Processa
		weatherProcessor.Handle(context.Background(), payload)

		// Confirma processamento ao Rabbit
		msg.Ack(false)
	}

	return nil
}
