package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	RabbitMQURL      string
	RabbitMQQueue    string
	RabbitMQExchange string
	RabbitMQKey      string
	APIURL           string
	APIEndpoint      string
	MaxRetries       int
	WorkerID         string
}

func Load() *Config {
	_ = godotenv.Load()

	maxRetries, _ := strconv.Atoi(getEnv("MAX_RETRIES", "3"))

	cfg := &Config{
		RabbitMQURL:      getEnv("RABBITMQ_URL", "amqp://gdash:gdash123@localhost:5672/"),
		RabbitMQQueue:    getEnv("RABBITMQ_QUEUE", "weather_data_queue"),
		RabbitMQExchange: getEnv("RABBITMQ_EXCHANGE", "weather_exchange"),
		RabbitMQKey:      getEnv("RABBITMQ_ROUTING_KEY", "weather.data"),
		APIURL:           getEnv("API_URL", "http://localhost:4000"),
		APIEndpoint:      getEnv("API_ENDPOINT", "/api/weather/logs"),
		MaxRetries:       maxRetries,
		WorkerID:         getEnv("WORKER_ID", "queue-worker-01"),
	}

	log.Printf("Config OK: Queue=%s, API=%s%s", cfg.RabbitMQQueue, cfg.APIURL, cfg.APIEndpoint)

	return cfg
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}