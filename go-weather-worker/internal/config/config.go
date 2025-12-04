package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config armazena todas as configurações da aplicação
type Config struct {
	// RabbitMQ
	RabbitMQURL   string
	RabbitMQQueue string

	// API
	APIBaseURL  string
	APIEndpoint string

	// Worker
	WorkerConcurrency int
	RetryAttempts     int
	RetryDelay        time.Duration
}

// Load carrega as configurações do arquivo .env
func Load() *Config {
	// Carregar .env (ignora erro se não existir, usa variáveis de ambiente)
	_ = godotenv.Load()

	cfg := &Config{
		RabbitMQURL:       getEnv("RABBITMQ_URL", "amqp://admin:admin123@rabbitmq:5672/"),
		RabbitMQQueue:     getEnv("RABBITMQ_QUEUE", "weather_data"),
		APIBaseURL:        getEnv("API_BASE_URL", "http://nestjs-api:3000"),
		APIEndpoint:       getEnv("API_ENDPOINT", "/api/weather/logs"),
		WorkerConcurrency: getEnvInt("WORKER_CONCURRENCY", 5),
		RetryAttempts:     getEnvInt("RETRY_ATTEMPTS", 3),
		RetryDelay:        getEnvDuration("RETRY_DELAY", "2s"),
	}

	log.Println("📋 Configurações carregadas:")
	log.Printf("   🐰 RabbitMQ: %s", cfg.RabbitMQURL)
	log.Printf("   📦 Fila: %s", cfg.RabbitMQQueue)
	log.Printf("   🌐 API: %s%s", cfg.APIBaseURL, cfg.APIEndpoint)
	log.Printf("   ⚙️  Concorrência: %d", cfg.WorkerConcurrency)

	return cfg
}

// getEnv retorna variável de ambiente ou valor padrão
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvInt retorna variável de ambiente como inteiro
func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

// getEnvDuration retorna variável de ambiente como duration
func getEnvDuration(key, defaultValue string) time.Duration {
	value := getEnv(key, defaultValue)
	duration, err := time.ParseDuration(value)
	if err != nil {
		log.Printf("⚠️  Erro ao parsear duração %s: %v. Usando padrão.", key, err)
		duration, _ = time.ParseDuration(defaultValue)
	}
	return duration
}
