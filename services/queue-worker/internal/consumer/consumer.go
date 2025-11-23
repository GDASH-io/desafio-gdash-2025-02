package consumer

import (
	"encoding/json"
	"log"
	"math"
	"queue-worker/internal/api"
	"queue-worker/internal/config"
	"queue-worker/internal/models"
	"queue-worker/internal/validator"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Consumer struct {
	conn      *amqp.Connection
	channel   *amqp.Channel
	cfg       *config.Config
	apiClient *api.Client
}

func New(cfg *config.Config) (*Consumer, error) {
	log.Printf("Conectando ao RabbitMQ...")

	conn, err := amqp.Dial(cfg.RabbitMQURL)
	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, err
	}

	err = ch.ExchangeDeclare(
		cfg.RabbitMQExchange,
		"direct",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, err
	}

	_, err = ch.QueueDeclare(
		cfg.RabbitMQQueue,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, err
	}

	err = ch.QueueBind(
		cfg.RabbitMQQueue,
		cfg.RabbitMQKey,
		cfg.RabbitMQExchange,
		false,
		nil,
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, err
	}

	err = ch.Qos(1, 0, false)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, err
	}

	log.Printf("RabbitMQ conectado (queue: %s)", cfg.RabbitMQQueue)

	return &Consumer{
		conn:      conn,
		channel:   ch,
		cfg:       cfg,
		apiClient: api.NewClient(cfg),
	}, nil
}

func (c *Consumer) Start() error {
	msgs, err := c.channel.Consume(
		c.cfg.RabbitMQQueue,
		c.cfg.WorkerID,
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	log.Printf("Worker iniciado. Aguardando mensagens...")

	for msg := range msgs {
		c.processMessage(msg)
	}

	return nil
}

func (c *Consumer) processMessage(msg amqp.Delivery) {
	log.Println("Nova mensagem recebida")

	var weatherData models.WeatherData
	if err := json.Unmarshal(msg.Body, &weatherData); err != nil {
		log.Printf("Erro ao decodificar JSON: %v", err)
		msg.Nack(false, false)
		return
	}

	if err := validator.ValidateWeatherData(&weatherData); err != nil {
		log.Printf("Validação falhou: %v", err)
		// Dados inválidos não devem ser reenfileirados (evita loop infinito)
		msg.Nack(false, false)
		return
	}

	log.Printf("Dados validados: %s - %.1f°C", weatherData.Location.City, weatherData.Current.Temperature)

	payload := weatherData.ToNestJSPayload()

	if err := c.sendWithRetry(payload); err != nil {
		log.Printf("Falha após %d tentativas: %v", c.cfg.MaxRetries, err)
		// Evita loop infinito quando API está offline
		msg.Nack(false, false)
		return
	}

	msg.Ack(false)
	log.Println("Mensagem processada!")
}

func (c *Consumer) sendWithRetry(payload *models.NestJSPayload) error {
	var lastErr error

	for attempt := 1; attempt <= c.cfg.MaxRetries; attempt++ {
		err := c.apiClient.SendWeatherData(payload)
		if err == nil {
			return nil
		}

		lastErr = err
		log.Printf("Tentativa %d/%d falhou: %v", attempt, c.cfg.MaxRetries, err)

		if attempt < c.cfg.MaxRetries {
			backoff := time.Duration(math.Pow(2, float64(attempt-1))) * time.Second
			log.Printf("Aguardando %v antes de retentar...", backoff)
			time.Sleep(backoff)
		}
	}

	return lastErr
}

func (c *Consumer) Close() {
	if c.channel != nil {
		c.channel.Close()
	}
	if c.conn != nil {
		c.conn.Close()
	}
	log.Println("Conexões fechadas")
}
