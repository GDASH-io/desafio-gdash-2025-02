package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	RabbitURL    string
	QueueName    string
	PythonAPIURL string
	NestAPIURL   string
}

func Load() *Config {
	_ = godotenv.Load()

	rabbitMQ := os.Getenv("RABBITMQ_URL")
	if rabbitMQ == "" {
		user := os.Getenv("RABBITMQ_USER")
		pass := os.Getenv("RABBITMQ_PASS")
		host := os.Getenv("RABBITMQ_HOST")
		port := os.Getenv("RABBITMQ_PORT")

		if user != "" && pass != "" && host != "" && port != "" {
			rabbitMQ = "amqp://" + user + ":" + pass + "@" + host + ":" + port + "/"
		}
	}

	queue := os.Getenv("RABBITMQ_QUEUE")
	if queue == "" {
		queue = "weather.data"
	}

	pythonURL := os.Getenv("PYTHON_API_URL")
	if pythonURL == "" {
		pythonURL = "http://python-producer:5000/weather"
	}

	nestURL := os.Getenv("NEST_API_URL")
	if nestURL == "" {
		nestURL = "http://nestjs-api:3000/weather/logs"
	}

	if rabbitMQ == "" {
		log.Fatal("❌ Missing RABBITMQ_URL in environment")
	}

	return &Config{
		RabbitURL:    rabbitMQ,
		QueueName:    queue,
		PythonAPIURL: pythonURL,
		NestAPIURL:   nestURL,
	}
}
