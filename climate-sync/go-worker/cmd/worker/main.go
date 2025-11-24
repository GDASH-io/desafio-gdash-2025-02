package main

import (
	"log"
	"time"

	"github.com/mlluiz39/go-worker/internal/client"
	"github.com/mlluiz39/go-worker/internal/config"
	"github.com/mlluiz39/go-worker/internal/rabbitmq"
)

func main() {
	// 1. Carregar Configurações
	cfg := config.Load()
	log.Println("🚀 Go Worker Starting...")

	// 2. Configurar Cliente HTTP (Python API)
	weatherClient := client.NewWeatherClient(cfg.PythonAPIURL)

	// 3. Configurar Produtor RabbitMQ
	producer, err := rabbitmq.NewProducer(cfg)
	if err != nil {
		log.Fatalf("❌ Fatal: Failed to initialize RabbitMQ producer: %v", err)
	}
	defer producer.Close()
	log.Println("✅ Connected to RabbitMQ")

	// 4. Configurar Loop de Coleta
	ticker := time.NewTicker(60 * time.Second) // Coleta a cada 1 minuto (pode ser ajustado via env)
	defer ticker.Stop()

	// Executar imediatamente na inicialização
	processWeather(weatherClient, producer)

	// Loop
	for range ticker.C {
		processWeather(weatherClient, producer)
	}
}

func processWeather(client *client.WeatherClient, producer *rabbitmq.Producer) {
	log.Println("🔄 Polling Python API for weather data...")

	// Buscar dados do Python
	data, err := client.FetchWeather()
	if err != nil {
		// AQUI ESTÁ O WARNING SOLICITADO
		log.Printf("⚠️ WARNING: Failed to fetch weather data from Python service. Service might be down. Error: %v", err)
		return
	}

	// Publicar no RabbitMQ
	err = producer.Publish(data)
	if err != nil {
		log.Printf("⚠️ WARNING: Failed to publish data to RabbitMQ. Error: %v", err)
		return
	}

	log.Println("✅ Data processed and sent to NestJS successfully")
}
