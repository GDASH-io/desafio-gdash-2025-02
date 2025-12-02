package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config armazena todas as configurações do worker
type Config struct {
	RabbitMQURL   string
	RabbitMQQueue string
	APIURL        string
}

// Load carrega as configurações do ambiente
func Load() *Config {
	// Carregar .env (ignora erro se não existir, usa variáveis do sistema)
	_ = godotenv.Load()

	config := &Config{
		RabbitMQURL:   getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672"),
		RabbitMQQueue: getEnv("RABBITMQ_QUEUE", "weather-data"),
		APIURL:        getEnv("API_URL", "http://localhost:3001/api"),
	}

	log.Println("✅ Configurações carregadas:")
	log.Printf("   RabbitMQ URL: %s", maskURL(config.RabbitMQURL))
	log.Printf("   Queue: %s", config.RabbitMQQueue)
	log.Printf("   API URL: %s", config.APIURL)

	return config
}

// getEnv obtém variável de ambiente com fallback
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// maskURL esconde credenciais na URL para logs
func maskURL(url string) string {
	if len(url) > 20 {
		return url[:7] + "***" + url[len(url)-10:]
	}
	return "***"
}