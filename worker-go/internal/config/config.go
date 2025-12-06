package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	RabbitMQHost  string
	RabbitMQPort  int
	RabbitMQUser  string
	RabbitMQPass  string
	RabbitMQQueue string
	
	APIURL     string
	APITimeout time.Duration
	
	MaxRetries int
	RetryDelay time.Duration
}

func Load() (*Config, error) {
	config := &Config{
		RabbitMQHost:  getEnv("RABBITMQ_HOST", "rabbitmq"),
		RabbitMQPort:  getEnvAsInt("RABBITMQ_PORT", 5672),
		RabbitMQUser:  getEnv("RABBITMQ_USER", "guest"),
		RabbitMQPass:  getEnv("RABBITMQ_PASS", "guest"),
		RabbitMQQueue: getEnv("RABBITMQ_QUEUE", "weather_data"),
		
		APIURL:     getEnv("API_URL", "http://localhost:3000/weather/logs"),
		APITimeout: time.Duration(getEnvAsInt("API_TIMEOUT", 30)) * time.Second,
		
		MaxRetries: getEnvAsInt("MAX_RETRIES", 3),
		RetryDelay: time.Duration(getEnvAsInt("RETRY_DELAY_SECONDS", 2)) * time.Second,
	}
	
	if err := config.validate(); err != nil {
		return nil, err
	}
	
	return config, nil
}

func (c *Config) validate() error {
	if c.RabbitMQHost == "" {
		return fmt.Errorf("RABBITMQ_HOST não pode ser vazio")
	}
	
	if c.RabbitMQPort <= 0 || c.RabbitMQPort > 65535 {
		return fmt.Errorf("RABBITMQ_PORT inválida: %d", c.RabbitMQPort)
	}
	
	if c.RabbitMQQueue == "" {
		return fmt.Errorf("RABBITMQ_QUEUE não pode ser vazia")
	}
	
	if c.MaxRetries < 0 {
		return fmt.Errorf("MAX_RETRIES não pode ser negativo")
	}
	
	return nil
}

func (c *Config) RabbitMQURL() string {
	return fmt.Sprintf(
		"amqp://%s:%s@%s:%d/",
		c.RabbitMQUser,
		c.RabbitMQPass,
		c.RabbitMQHost,
		c.RabbitMQPort,
	)
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}
	
	return value
}