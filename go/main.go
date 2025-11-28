package main

import (
	"bytes"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

const attemptHeader = "x-retry-attempt"

var logger = log.New(os.Stdout, "[go-worker] ", log.LstdFlags)

type Config struct {
	RabbitHost    string
	RabbitPort    int
	RabbitUser    string
	RabbitPass    string
	RabbitQueue   string
	RabbitVHost   string
	PrefetchCount int
	RetryLimit    int
	RetryDelay    time.Duration
	APIURL        string
}

type worker struct {
	config     Config
	conn       *amqp.Connection
	channel    *amqp.Channel
	httpClient *http.Client
}

func main() {
	config := loadConfig()
	wrk, err := newWorker(config)
	if err != nil {
		logger.Fatalf("falha ao criar worker: %v", err)
	}
	logger.Printf("iniciando worker conectado ao RabbitMQ %s:%d", config.RabbitHost, config.RabbitPort)
	if err := wrk.start(); err != nil {
		logger.Fatalf("worker finalizado: %v", err)
	}
}

func loadConfig() Config {
	return Config{
		RabbitHost:    getEnv("RABBITMQ_HOST", "rabbitmq"),
		RabbitPort:    getEnvInt("RABBITMQ_PORT", 5672),
		RabbitUser:    getEnv("RABBITMQ_USER", "guest"),
		RabbitPass:    getEnv("RABBITMQ_PASSWORD", "guest"),
		RabbitQueue:   getEnv("RABBITMQ_QUEUE", "weather-data"),
		RabbitVHost:   getEnv("RABBITMQ_VHOST", "/"),
		PrefetchCount: getEnvInt("WORKER_PREFETCH_COUNT", 1),
		RetryLimit:    getEnvInt("WORKER_RETRY_LIMIT", 3),
		RetryDelay:    time.Duration(getEnvInt("WORKER_RETRY_DELAY_SECONDS", 5)) * time.Second,
		APIURL:        getEnv("NESTJS_API_URL", "http://nestjs-api:3000/api/weather/logs"),
	}
}

func newWorker(cfg Config) (*worker, error) {
	vhost := cfg.RabbitVHost
	if vhost == "" {
		vhost = "/"
	}
	escapedVHost := url.PathEscape(vhost)
	uri := fmt.Sprintf(
		"amqp://%s:%s@%s:%d/%s",
		url.PathEscape(cfg.RabbitUser),
		url.PathEscape(cfg.RabbitPass),
		cfg.RabbitHost,
		cfg.RabbitPort,
		escapedVHost,
	)
	conn, err := amqp.Dial(uri)
	if err != nil {
		return nil, fmt.Errorf("falha ao conectar no RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("falha ao abrir canal: %w", err)
	}

	if err := ch.Qos(cfg.PrefetchCount, 0, false); err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("falha ao configurar QoS: %w", err)
	}

	if _, err := ch.QueueDeclare(
		cfg.RabbitQueue,
		true,
		false,
		false,
		false,
		nil,
	); err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("falha ao declarar fila: %w", err)
	}

	return &worker{
		config:     cfg,
		conn:       conn,
		channel:    ch,
		httpClient: &http.Client{Timeout: 15 * time.Second},
	}, nil
}

func (w *worker) start() error {
	deliveries, err := w.channel.Consume(
		w.config.RabbitQueue,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return fmt.Errorf("falha ao consumir fila: %w", err)
	}

	for delivery := range deliveries {
		w.handleDelivery(delivery)
	}

	return nil
}

func (w *worker) handleDelivery(delivery amqp.Delivery) {
	attempt := extractAttempt(delivery.Headers)
	logger.Printf("recebendo mensagem (tentativa %d)", attempt)

	if err := w.forwardToAPI(delivery.Body); err != nil {
		w.retryOrDiscard(delivery, attempt, err)
		return
	}

	if err := delivery.Ack(false); err != nil {
		logger.Printf("falha ao confirmar mensagem: %v", err)
	}
}

func (w *worker) forwardToAPI(payload []byte) error {
	req, err := http.NewRequest(http.MethodPost, w.config.APIURL, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := w.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("status inesperado %d", resp.StatusCode)
	}

	return nil
}

func (w *worker) retryOrDiscard(delivery amqp.Delivery, attempt int, err error) {
	logger.Printf("erro ao enviar para API (%v)", err)

	if attempt >= w.config.RetryLimit {
		logger.Printf("limite de tentativas (%d) atingido para %s, descartando", w.config.RetryLimit, delivery.MessageId)
		if ackErr := delivery.Ack(false); ackErr != nil {
			logger.Printf("falha ao confirmar (descartar) mensagem: %v", ackErr)
		}
		return
	}

	time.Sleep(w.config.RetryDelay)
	if err := w.requeue(delivery.Body, attempt+1); err != nil {
		logger.Printf("falha ao reenfileirar: %v", err)
		if nackErr := delivery.Nack(false, true); nackErr != nil {
			logger.Printf("falha ao nack: %v", nackErr)
		}
		return
	}

	if ackErr := delivery.Ack(false); ackErr != nil {
		logger.Printf("falha ao confirmar após reenfileirar: %v", ackErr)
	}
}

func (w *worker) requeue(body []byte, attempt int) error {
	headers := amqp.Table{
		attemptHeader: attempt,
	}
	return w.channel.Publish(
		"",
		w.config.RabbitQueue,
		false,
		false,
		amqp.Publishing{
			DeliveryMode: amqp.Persistent,
			ContentType:  "application/json",
			Headers:      headers,
			Body:         body,
		},
	)
}

func extractAttempt(headers amqp.Table) int {
	if headers == nil {
		return 1
	}

	raw, ok := headers[attemptHeader]
	if !ok {
		return 1
	}

	switch value := raw.(type) {
	case int:
		return value
	case int8:
		return int(value)
	case int16:
		return int(value)
	case int32:
		return int(value)
	case int64:
		return int(value)
	case float64:
		return int(value)
	case string:
		if parsed, err := strconv.Atoi(value); err == nil {
			return parsed
		}
	default:
	}

	return 1
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(val)
	if err != nil {
		logger.Printf("valor inválido para %s (%s), usando %d", key, val, fallback)
		return fallback
	}
	return parsed
}