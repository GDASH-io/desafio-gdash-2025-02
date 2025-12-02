package rabbitmq

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/mlluiz39/go-worker/internal/config"
	"github.com/rabbitmq/amqp091-go"
)

type Producer struct {
	cfg          *config.Config
	conn         *amqp091.Connection
	ch           *amqp091.Channel
	exchangeName string
	routingKey   string
}

func NewProducer(cfg *config.Config) (*Producer, error) {
	conn, err := amqp091.Dial(cfg.RabbitURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to rabbitmq: %v", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("failed to open channel: %v", err)
	}

	exchangeName := "weather.exchange"
	// Declara exchange para garantir que existe
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
		return nil, fmt.Errorf("failed to declare exchange: %v", err)
	}

	return &Producer{
		cfg:          cfg,
		conn:         conn,
		ch:           ch,
		exchangeName: exchangeName,
		routingKey:   cfg.QueueName, // Usando o nome da fila como routing key (weather.data)
	}, nil
}

func (p *Producer) Publish(data map[string]interface{}) error {
	body, err := json.Marshal(data)
	if err != nil {
		return err
	}

	err = p.ch.Publish(
		p.exchangeName, // exchange
		p.routingKey,   // routing key
		false,          // mandatory
		false,          // immediate
		amqp091.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp091.Persistent,
			Body:         body,
		},
	)

	if err != nil {
		// Tentar reconectar em caso de falha
		log.Printf("⚠️ Publish failed, attempting to reconnect... Error: %v", err)
		if reconErr := p.reconnect(); reconErr == nil {
			// Tentar publicar novamente
			return p.ch.Publish(
				p.exchangeName,
				p.routingKey,
				false,
				false,
				amqp091.Publishing{
					ContentType:  "application/json",
					DeliveryMode: amqp091.Persistent,
					Body:         body,
				},
			)
		}
		return err
	}

	return nil
}

func (p *Producer) reconnect() error {
	if !p.conn.IsClosed() {
		p.conn.Close()
	}

	conn, err := amqp091.Dial(p.cfg.RabbitURL)
	if err != nil {
		return err
	}
	p.conn = conn

	ch, err := conn.Channel()
	if err != nil {
		return err
	}
	p.ch = ch
	return nil
}

func (p *Producer) Close() {
	if p.ch != nil {
		p.ch.Close()
	}
	if p.conn != nil {
		p.conn.Close()
	}
}
