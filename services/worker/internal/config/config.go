package config

import (
	"fmt"
	"os"
	"strconv"
	"sync"
)

type Config struct {
	RabbitMQURL   string
	QueueName     string
	PrefetchCount int

	APIBaseURL string
	APITimeout int

	MaxRetries   int
	RetryDelayMS int
	WorkerCount  int
	LogLevel     string
}

var (
	instance *Config
	once     sync.Once
)

func Get() *Config {
	once.Do(func() {
		instance = &Config{
			RabbitMQURL:   getEnv("RABBITMQ_URL", buildDefaultRabbitMQURL()),
			QueueName:     getEnv("RABBITMQ_URL", "weather_data"),
			PrefetchCount: getEnvInt("RABBITMQ_PREFETCH", 10),

			APIBaseURL: getEnv("API_BASE_URL", "http://api:3000"),
			APITimeout: getEnvInt("API_TIMEOUT_SECONDS", 10),

			MaxRetries:   getEnvInt("MAX_RETRIES", 3),
			RetryDelayMS: getEnvInt("RETRY_DELAY_MS", 3),
			WorkerCount:  getEnvInt("WORKER_COUNT", 3),
			LogLevel:     getEnv("LOG_LEVEL", "info"),
		}
	})

	return instance
}

func buildDefaultRabbitMQURL() string {
	host := getEnv("RABBITMQ_HOST", "rabbitmq")
	port := getEnv("RABBITMQ_PORT", "5672")
	user := getEnv("RABBITMQ_USER", "admin")
	pass := getEnv("RABBITMQ_PASS", "admin123")

	return fmt.Sprintf("amqp://%s:%s@%s:%s/", user, pass, host, port)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}

	return defaultValue
}

func (c *Config) Validate() error {
	if c.RabbitMQURL == "" {
		return fmt.Errorf("RABBITMQ_URL is empty")
	}
	if c.QueueName == "" {
		return fmt.Errorf("QUEUE_NAME is empty")
	}
	if c.APIBaseURL == "" {
		return fmt.Errorf("API_BASE_URL is empty")
	}

	return nil
}
