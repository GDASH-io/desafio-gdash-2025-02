package main

import (
	"log"
	"time"

	"github.com/mlluiz39/go-worker/internal/config"
	"github.com/mlluiz39/go-worker/internal/rabbitmq"
)

func main() {
	cfg := config.Load()
	log.Println("🚀 Go Worker Starting (Consumer Mode)...")

	// Retry logic para conexão inicial (aguardar RabbitMQ)
	var consumer *rabbitmq.Consumer
	var err error

	for i := 0; i < 10; i++ {
		consumer, err = rabbitmq.NewConsumer(cfg)
		if err == nil {
			break
		}
		log.Printf("⏳ Waiting for RabbitMQ... (%v)", err)
		time.Sleep(5 * time.Second)
	}

	if err != nil {
		log.Fatalf("❌ Fatal: Could not connect to RabbitMQ after retries: %v", err)
	}
	defer consumer.Close()

	log.Println("✅ Connected to RabbitMQ. Starting Consumer...")
	if err := consumer.Start(); err != nil {
		log.Fatal(err)
	}
}
