package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Config struct {
	RabbitURL  string
	QueueName  string
	APIURL     string
	APIPath    string
	APIToken   string
	Prefetch   int
	MaxRetries int
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func loadConfig() Config {
	rabURL := getEnv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
	// Corrige valor sem credencial no .env.example
	if !strings.Contains(rabURL, "@") {
		rabURL = "amqp://guest:guest@rabbitmq:5672/"
	}
	return Config{
		RabbitURL:  rabURL,
		QueueName:  getEnv("WEATHER_QUEUE", "weather.raw"),
		APIURL:     getEnv("API_URL", "http://api:3000"),
		APIPath:    getEnv("API_PATH", "/weather/logs"),
		APIToken:   os.Getenv("API_TOKEN"),
		Prefetch:   10,
		MaxRetries: 5,
	}
}

func connectRabbit(cfg Config) (*amqp.Connection, *amqp.Channel, error) {
	conn, err := amqp.Dial(cfg.RabbitURL)
	if err != nil {
		return nil, nil, fmt.Errorf("dial rabbit: %w", err)
	}
	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, nil, fmt.Errorf("open channel: %w", err)
	}
	if err := ch.Qos(cfg.Prefetch, 0, false); err != nil {
		ch.Close()
		conn.Close()
		return nil, nil, fmt.Errorf("set qos: %w", err)
	}
	_, err = ch.QueueDeclare(cfg.QueueName, true, false, false, false, nil)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, nil, fmt.Errorf("declare queue: %w", err)
	}
	return conn, ch, nil
}

func postToAPI(cfg Config, body []byte) (int, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	url := strings.TrimRight(cfg.APIURL, "/") + cfg.APIPath
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return 0, err
	}
	req.Header.Set("Content-Type", "application/json")
	if cfg.APIToken != "" {
		// Permite tanto Authorization: Bearer quanto X-API-KEY conforme backend
		req.Header.Set("Authorization", "Bearer "+cfg.APIToken)
		req.Header.Set("X-API-KEY", cfg.APIToken)
	}
	resp, err := client.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()
	return resp.StatusCode, nil
}

func handleMessage(cfg Config, d amqp.Delivery) {
	// Validação básica de JSON
	var js map[string]interface{}
	if err := json.Unmarshal(d.Body, &js); err != nil {
		log.Printf("[worker] mensagem inválida (JSON): %v", err)
		_ = d.Ack(false)
		return
	}

	// Retry básico para erros transitórios
	backoff := time.Second
	for attempt := 1; attempt <= cfg.MaxRetries; attempt++ {
		status, err := postToAPI(cfg, d.Body)
		if err == nil && status >= 200 && status < 300 {
			log.Printf("[worker] OK -> API %d (ack)", status)
			_ = d.Ack(false)
			return
		}
		if status == http.StatusConflict { // 409 duplicado: considerar sucesso/idempotente
			log.Printf("[worker] DUPLICADO 409 -> ack")
			_ = d.Ack(false)
			return
		}
		if status >= 400 && status < 500 && status != 429 { // erro do cliente não recuperável
			log.Printf("[worker] ERRO 4xx (%d) -> descartar (ack)", status)
			_ = d.Ack(false)
			return
		}
		log.Printf("[worker] Falha tentativa %d (status=%d err=%v) -> retry em %s", attempt, status, err, backoff)
		time.Sleep(backoff)
		backoff *= 2
	}
	// Exaustão de tentativas: requeue para tentar novamente mais tarde
	log.Printf("[worker] Exaustão de retries -> requeue")
	_ = d.Nack(false, true)
}

func main() {
	log.SetFlags(0)
	cfg := loadConfig()
	log.Printf("[worker] starting (queue=%s api=%s%s)", cfg.QueueName, cfg.APIURL, cfg.APIPath)

	conn, ch, err := connectRabbit(cfg)
	if err != nil {
		log.Fatalf("[worker] rabbit error: %v", err)
	}
	defer conn.Close()
	defer ch.Close()

	deliveries, err := ch.Consume(cfg.QueueName, "go-worker", false, false, false, false, nil)
	if err != nil {
		log.Fatalf("[worker] consume error: %v", err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	go func() {
		for d := range deliveries {
			handleMessage(cfg, d)
		}
	}()

	<-ctx.Done()
	log.Printf("[worker] shutdown")
}
