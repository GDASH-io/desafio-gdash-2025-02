package config

import (
	"os"
	"time"
)

type Config struct {
	RabbitMQURL string
	APIURL      string
	QueueName   string
	Heartbeat   time.Duration
	QoSPrefetch int
	APITimeout  time.Duration
	RetryDelay  time.Duration
}

func Load() *Config {
	return &Config{
		RabbitMQURL: getEnv("RABBITMQ_URL", "amqp://admin:admin123@localhost:5672/"),
		APIURL:      getEnv("API_URL", "http://localhost:3000"),
		QueueName:   "weather_data",
		Heartbeat:   30 * time.Second,
		QoSPrefetch: 1,
		APITimeout:  10 * time.Second,
		RetryDelay:  5 * time.Second,
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
