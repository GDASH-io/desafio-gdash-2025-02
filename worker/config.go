package main

import (
	"os"
)

type Config struct {
	RabbitMQURL string
	APIURL      string
	QueueName   string
}

func LoadConfig() *Config {
	return &Config{
		RabbitMQURL: getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),
		APIURL:      getEnv("API_URL", "http://localhost:3000/api/weather/logs"),
		QueueName:   getEnv("QUEUE_NAME", "weather_data"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

