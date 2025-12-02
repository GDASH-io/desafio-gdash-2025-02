package rabbitmq

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/mlluiz39/go-worker/internal/config"
	"github.com/rabbitmq/amqp091-go"
)

type Consumer struct {
	cfg          *config.Config
	conn         *amqp091.Connection
	ch           *amqp091.Channel
	exchangeName string
	consumeQueue string
}

func NewConsumer(cfg *config.Config) (*Consumer, error) {
	conn, err := amqp091.Dial(cfg.RabbitURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to rabbitmq: %v", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("failed to open channel: %v", err)
	}

	exchangeName := "weather.exchange"
	consumeQueue := "weather.raw.queue"
	consumeRoutingKey := "weather.raw"

	// 1. Declarar Exchange
	err = ch.ExchangeDeclare(exchangeName, "topic", true, false, false, false, nil)
	if err != nil {
		return nil, err
	}

	// 2. Declarar Fila de Consumo
	_, err = ch.QueueDeclare(consumeQueue, true, false, false, false, nil)
	if err != nil {
		return nil, err
	}

	// 3. Bind Fila ao Exchange
	err = ch.QueueBind(consumeQueue, consumeRoutingKey, exchangeName, false, nil)
	if err != nil {
		return nil, err
	}

	return &Consumer{
		cfg:          cfg,
		conn:         conn,
		ch:           ch,
		exchangeName: exchangeName,
		consumeQueue: consumeQueue,
	}, nil
}

func (c *Consumer) Start() error {
	msgs, err := c.ch.Consume(
		c.consumeQueue,
		"go-worker",
		false, // Manual ACK
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	log.Printf("📡 Go Worker Listening on queue '%s'...", c.consumeQueue)
	log.Printf("🔗 Will POST data to: %s", c.cfg.NestAPIURL)

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			c.processMessage(d)
		}
	}()

	<-forever
	return nil
}

func (c *Consumer) processMessage(msg amqp091.Delivery) {
	log.Println("📥 Received raw weather data from RabbitMQ")

	var data map[string]interface{}
	if err := json.Unmarshal(msg.Body, &data); err != nil {
		log.Printf("❌ Error decoding JSON: %v", err)
		msg.Nack(false, false) // Descarta
		return
	}

	// ==========================================
	// 🛠️ VALIDAÇÃO E TRANSFORMAÇÃO
	// ==========================================
	data["processed_by"] = "go-worker"
	data["processed_at"] = time.Now().Format(time.RFC3339)

	// Exemplo de validação básica
	if _, ok := data["data"]; !ok {
		log.Println("⚠️ Invalid data structure, missing 'data' field")
		msg.Ack(false)
		return
	}

	// ==========================================
	// 🚀 ENVIAR PARA API NESTJS (HTTP POST)
	// ==========================================
	err := c.sendToAPI(data)
	if err != nil {
		log.Printf("❌ Failed to send data to NestJS API: %v", err)
		// Nack com requeue=true para tentar novamente depois
		// (Idealmente deveria ter um delay ou dead letter queue, mas retry básico serve)
		msg.Nack(false, true)
		return
	}

	log.Println("✅ Data sent to NestJS successfully")
	msg.Ack(false)
}

func (c *Consumer) sendToAPI(data map[string]interface{}) error {
	payload, err := json.Marshal(data)
	if err != nil {
		return err
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	req, err := http.NewRequest("POST", c.cfg.NestAPIURL, bytes.NewBuffer(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	// Se a API do NestJS for protegida, adicionar Header Authorization aqui
	// req.Header.Set("Authorization", "Bearer " + c.cfg.APIToken)

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("API returned error status: %d", resp.StatusCode)
	}

	return nil
}

func (c *Consumer) Close() {
	c.ch.Close()
	c.conn.Close()
}
