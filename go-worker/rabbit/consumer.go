package rabbit

import (
	"encoding/json"
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
	"go-worker/models"
)

type MessageHandler func(body []byte) error

type Logger interface {
	LogInfo(format string, v ...interface{})
	LogError(format string, v ...interface{})
	LogSuccess(format string, v ...interface{})
	LogWarn(format string, v ...interface{})
}

type Consumer struct {
	conn      *amqp.Connection
	channel   *amqp.Channel
	queueName string
	handler   MessageHandler
	logger    Logger
}

func NewConsumer(conn *amqp.Connection, queueName string, handler MessageHandler, logger Logger) (*Consumer, error) {
	ch, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("erro ao abrir canal: %w", err)
	}

	err = ch.Qos(
		1,
		0,
		false,
	)
	if err != nil {
		ch.Close()
		return nil, fmt.Errorf("erro ao configurar QoS: %w", err)
	}

	return &Consumer{
		conn:      conn,
		channel:   ch,
		queueName: queueName,
		handler:   handler,
		logger:    logger,
	}, nil
}

func (c *Consumer) Start() error {
	err := DeclareQueue(c.channel, c.queueName)
	if err != nil {
		return err
	}

	msgs, err := c.channel.Consume(
		c.queueName,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return fmt.Errorf("erro ao registrar consumer: %w", err)
	}

	for msg := range msgs {
		c.logger.LogInfo("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
		c.logger.LogInfo("🔄 Processando nova mensagem")
		c.logger.LogInfo("📨 Mensagem recebida: %s", string(msg.Body))

		err := c.handleMessage(msg)
		if err != nil {
			c.logger.LogError("❌ Erro ao processar mensagem: %v", err)
			c.logger.LogError("❌ Aplicando Nack (sem requeue)")
			msg.Nack(false, false)
		} else {
			c.logger.LogSuccess("✅ Mensagem processada com sucesso")
			c.logger.LogSuccess("✅ Aplicando Ack")
			msg.Ack(false)
		}

		c.logger.LogInfo("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	}

	return nil
}

func (c *Consumer) handleMessage(msg amqp.Delivery) error {
	return c.handler(msg.Body)
}

func (c *Consumer) Close() error {
	if c.channel != nil {
		if err := c.channel.Close(); err != nil {
			return err
		}
	}
	return nil
}

type WeatherSender interface {
	SendWithRetry(data map[string]interface{}, maxRetries int) error
}

func ProcessWeatherMessage(body []byte, sender WeatherSender, logger Logger) error {
	var weatherData models.WeatherData
	if err := json.Unmarshal(body, &weatherData); err != nil {
		return fmt.Errorf("erro ao decodificar JSON: %w", err)
	}

	logger.LogSuccess("✅ JSON decodificado com sucesso")

	if err := weatherData.Validate(); err != nil {
		logger.LogError("❌ Validação falhou: %v", err)
		return fmt.Errorf("validação falhou: %w", err)
	}

	logger.LogSuccess("✅ Validação passou")

	normalizedData := weatherData.ToAPIFormat()
	logger.LogSuccess("✅ Dados normalizados")

	return sender.SendWithRetry(normalizedData, 3)
}
