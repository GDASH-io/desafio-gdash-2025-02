package rabbitmq

import (
	"fmt"
	"log"
	"weathernator/worker/config"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Client struct {
	config *config.Config
	conn   *amqp.Connection
	ch     *amqp.Channel
}

func NewClient(cfg *config.Config) *Client {
	return &Client{
		config: cfg,
	}
}

func (c *Client) Connect() error {
	amqpConfig := amqp.Config{
		Heartbeat: c.config.Heartbeat,
		Locale:    "en_US",
	}

	conn, err := amqp.DialConfig(c.config.RabbitMQURL, amqpConfig)
	if err != nil {
		return fmt.Errorf("falha ao conectar ao RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return fmt.Errorf("falha ao abrir canal: %w", err)
	}

	// Configurar QoS
	err = ch.Qos(c.config.QoSPrefetch, 0, false)
	if err != nil {
		ch.Close()
		conn.Close()
		return fmt.Errorf("falha ao configurar QoS: %w", err)
	}

	// Declarar fila
	_, err = ch.QueueDeclare(
		c.config.QueueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return fmt.Errorf("falha ao declarar fila: %w", err)
	}

	c.conn = conn
	c.ch = ch

	log.Println("✅ Conectado ao RabbitMQ")
	return nil
}

func (c *Client) Consume() (<-chan amqp.Delivery, error) {
	msgs, err := c.ch.Consume(
		c.config.QueueName,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("erro ao registrar consumidor: %w", err)
	}

	return msgs, nil
}

func (c *Client) NotifyClose() chan *amqp.Error {
	notifyClose := make(chan *amqp.Error)
	c.conn.NotifyClose(notifyClose)
	return notifyClose
}

func (c *Client) Close() {
	if c.ch != nil {
		c.ch.Close()
	}
	if c.conn != nil {
		c.conn.Close()
	}
}
