package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	RabbitMQURL string
	QueueName   string
	APIURL      string
}

func Load() *Config {
    // Tenta carregar o .env, mas não falha se não achar (pode estar no Docker env vars)
	_ = godotenv.Load()

	return &Config{
		RabbitMQURL: getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),
		QueueName:   getEnv("QUEUE_NAME", "weather_data"),
		APIURL:      getEnv("API_URL", "http://localhost:3000/api/weather/logs"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}