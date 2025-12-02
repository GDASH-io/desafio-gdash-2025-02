package consumer

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"go-worker/client"
	"go-worker/models"
)

// RabbitMQConsumer gerencia o consumo de mensagens
type RabbitMQConsumer struct {
	conn      *amqp.Connection
	channel   *amqp.Channel
	queue     string
	apiClient *client.APIClient
}

// NewRabbitMQConsumer cria nova instância do consumer
func NewRabbitMQConsumer(url, queue string, apiClient *client.APIClient) (*RabbitMQConsumer, error) {
	// Conectar ao RabbitMQ
	log.Printf("🔌 Conectando ao RabbitMQ: %s", maskURL(url))
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("erro ao conectar: %w", err)
	}

	// Criar canal
	channel, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("erro ao criar canal: %w", err)
	}

	// Declarar fila (idempotente)
	_, err = channel.QueueDeclare(
		queue, // name
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		channel.Close()
		conn.Close()
		return nil, fmt.Errorf("erro ao declarar fila: %w", err)
	}

	log.Printf("✅ Conectado ao RabbitMQ! Fila: %s", queue)

	return &RabbitMQConsumer{
		conn:      conn,
		channel:   channel,
		queue:     queue,
		apiClient: apiClient,
	}, nil
}

// Start inicia o consumo de mensagens
func (c *RabbitMQConsumer) Start() error {
	// Configurar QoS (prefetch)
	err := c.channel.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	if err != nil {
		return fmt.Errorf("erro ao configurar QoS: %w", err)
	}

	// Registrar consumer
	msgs, err := c.channel.Consume(
		c.queue, // queue
		"",      // consumer tag (auto-generated)
		false,   // auto-ack (false para ACK manual)
		false,   // exclusive
		false,   // no-local
		false,   // no-wait
		nil,     // args
	)
	if err != nil {
		return fmt.Errorf("erro ao registrar consumer: %w", err)
	}

	log.Println("🚀 Worker iniciado! Aguardando mensagens...")
	log.Println("   Pressione CTRL+C para parar")

	// Loop de consumo
	for msg := range msgs {
		c.processMessage(msg)
	}

	return nil
}

// processMessage processa uma mensagem individual
func (c *RabbitMQConsumer) processMessage(msg amqp.Delivery) {
	log.Println(repeat("=", 60))
	log.Printf("📨 Nova mensagem recebida (tag: %d)", msg.DeliveryTag)

	// Parse JSON
	var weatherData models.WeatherData
	err := json.Unmarshal(msg.Body, &weatherData)
	if err != nil {
		log.Printf("❌ Erro ao parsear JSON: %v", err)
		log.Printf("   Body: %s", string(msg.Body))
		
		// NACK sem requeue (mensagem inválida)
		msg.Nack(false, false)
		return
	}

	// Log dos dados
	log.Printf("   Localização: %s", weatherData.Location.Name)
	log.Printf("   Temperatura: %.1f°C", weatherData.Temperature)
	log.Printf("   Umidade: %.0f%%", weatherData.Humidity)
	log.Printf("   Condição: %s", weatherData.Condition)

	// Enviar para API com retry
	err = c.sendWithRetry(&weatherData, 3)
	if err != nil {
		log.Printf("❌ Falha ao enviar para API após retries: %v", err)
		
		// NACK com requeue (talvez a API volte)
		msg.Nack(false, true)
		return
	}

	// ACK (sucesso!)
	msg.Ack(false)
	log.Println("✅ Mensagem processada com sucesso!")
	log.Println(repeat("=", 60))
}

// sendWithRetry tenta enviar dados para API com retry
func (c *RabbitMQConsumer) sendWithRetry(data *models.WeatherData, maxRetries int) error {
	var lastErr error

	for attempt := 1; attempt <= maxRetries; attempt++ {
		err := c.apiClient.SendWeatherData(data)
		if err == nil {
			return nil // Sucesso!
		}

		lastErr = err
		log.Printf("⚠️  Tentativa %d/%d falhou: %v", attempt, maxRetries, err)

		if attempt < maxRetries {
			waitTime := time.Duration(attempt) * 2 * time.Second
			log.Printf("   Aguardando %v antes de tentar novamente...", waitTime)
			time.Sleep(waitTime)
		}
	}

	return fmt.Errorf("todas as tentativas falharam: %w", lastErr)
}

// Close fecha conexões
func (c *RabbitMQConsumer) Close() error {
	log.Println("🛑 Fechando conexões...")

	if c.channel != nil {
		c.channel.Close()
	}

	if c.conn != nil {
		c.conn.Close()
	}

	log.Println("✅ Conexões fechadas")
	return nil
}

// maskURL esconde credenciais na URL para logs
func maskURL(url string) string {
	if len(url) > 20 {
		return url[:7] + "***" + url[len(url)-10:]
	}
	return "***"
}

// repeat repete uma string n vezes
func repeat(s string, n int) string {
	result := ""
	for i := 0; i < n; i++ {
		result += s
	}
	return result
}