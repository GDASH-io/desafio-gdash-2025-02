package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	RabbitURL string
	QueueName string
}

func Load() *Config {
	_ = godotenv.Load()

	rabbitMQ := os.Getenv("RABBITMQ_URL")
	queue := os.Getenv("RABBITMQ_QUEUE")

	if rabbitMQ == "" {
		log.Fatal("❌ Missing RABBITMQ_URL in environment")
	}

	if queue == "" {
		queue = "weather.data"
	}

	return &Config{
		RabbitURL: rabbitMQ,
		QueueName: queue,
	}
}
