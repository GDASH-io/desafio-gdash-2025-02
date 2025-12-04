package queue

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"

	"github.com/desafio_gdash/go-weather-worker/internal/api"
	"github.com/desafio_gdash/go-weather-worker/internal/config"
	"github.com/desafio_gdash/go-weather-worker/internal/models"
)

// Consumer é o consumidor de mensagens RabbitMQ
type Consumer struct {
	conn      *amqp.Connection
	channel   *amqp.Channel
	queueName string
	apiClient *api.Client
}

// NewConsumer cria uma nova instância do consumidor
func NewConsumer(cfg *config.Config, apiClient *api.Client) (*Consumer, error) {
	// Conectar ao RabbitMQ com retry
	var conn *amqp.Connection
	var err error

	for attempt := 1; attempt <= 10; attempt++ {
		conn, err = amqp.Dial(cfg.RabbitMQURL)
		if err == nil {
			break
		}
		log.Printf("⚠️  Tentativa %d/10 de conectar ao RabbitMQ falhou: %v", attempt, err)
		time.Sleep(5 * time.Second)
	}

	if err != nil {
		return nil, err
	}

	log.Println("✅ Conectado ao RabbitMQ")

	// Criar canal
	channel, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, err
	}

	// Declarar fila (garante que existe)
	_, err = channel.QueueDeclare(
		cfg.RabbitMQQueue, // nome
		true,              // durable
		false,             // auto-delete
		false,             // exclusive
		false,             // no-wait
		nil,               // args
	)
	if err != nil {
		channel.Close()
		conn.Close()
		return nil, err
	}

	log.Printf("📦 Fila '%s' declarada", cfg.RabbitMQQueue)

	// Configurar QoS (quantas mensagens processar por vez)
	err = channel.Qos(
		cfg.WorkerConcurrency, // prefetch count
		0,                     // prefetch size
		false,                 // global
	)
	if err != nil {
		channel.Close()
		conn.Close()
		return nil, err
	}

	return &Consumer{
		conn:      conn,
		channel:   channel,
		queueName: cfg.RabbitMQQueue,
		apiClient: apiClient,
	}, nil
}

// Start inicia o consumo de mensagens
func (c *Consumer) Start(concurrency int) error {
	// Registrar consumidor
	msgs, err := c.channel.Consume(
		c.queueName, // fila
		"",          // consumer tag (gerado automaticamente)
		false,       // auto-ack (vamos fazer ACK manual)
		false,       // exclusive
		false,       // no-local
		false,       // no-wait
		nil,         // args
	)
	if err != nil {
		return err
	}

	log.Printf("🚀 Worker iniciado! Aguardando mensagens... (concorrência: %d)", concurrency)

	// Canal para manter o programa rodando
	forever := make(chan bool)

	// Processar mensagens em goroutines (concorrência)
	for i := 0; i < concurrency; i++ {
		go c.processMessages(msgs, i)
	}

	<-forever // Bloqueia até o programa ser interrompido
	return nil
}

// processMessages processa mensagens em loop
func (c *Consumer) processMessages(msgs <-chan amqp.Delivery, workerID int) {
	for msg := range msgs {
		log.Printf("📨 [Worker %d] Mensagem recebida", workerID)

		// Processar mensagem
		if err := c.handleMessage(msg.Body); err != nil {
			log.Printf("❌ [Worker %d] Erro ao processar: %v", workerID, err)
			// NACK (rejeita e reinsere na fila)
			msg.Nack(false, true)
		} else {
			log.Printf("✅ [Worker %d] Mensagem processada com sucesso", workerID)
			// ACK (confirma processamento)
			msg.Ack(false)
		}
	}
}

// handleMessage processa uma mensagem individual
func (c *Consumer) handleMessage(body []byte) error {
	// 1. Deserializar JSON
	var weatherData models.WeatherData
	if err := json.Unmarshal(body, &weatherData); err != nil {
		return err
	}

	log.Printf("🌡️  Dados recebidos: %.1f°C, %.0f%% umidade, %s",
		safeFloat(weatherData.Temperature),
		safeFloat(weatherData.Humidity),
		weatherData.Condition,
	)

	// 2. Validar dados
	if !weatherData.Validate() {
		return fmt.Errorf("dados inválidos")
	}

	// 3. Enviar para API
	if err := c.apiClient.SendWeatherData(&weatherData); err != nil {
		return err
	}

	return nil
}

// Close fecha as conexões
func (c *Consumer) Close() {
	if c.channel != nil {
		c.channel.Close()
	}
	if c.conn != nil {
		c.conn.Close()
	}
	log.Println("🔌 Conexão com RabbitMQ fechada")
}

// safeFloat retorna 0 se o ponteiro for nil
func safeFloat(f *float64) float64 {
	if f == nil {
		return 0
	}
	return *f
}
