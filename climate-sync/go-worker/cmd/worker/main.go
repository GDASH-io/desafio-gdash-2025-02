package main

import (
	"log"

	"github.com/mlluiz39/go-worker/internal/config"
	"github.com/mlluiz39/go-worker/internal/queue"
)

func main() {
	cfg := config.Load()
	consumer := queue.NewConsumer(cfg)

	log.Println("🚀 Go Worker started")
	if err := consumer.Start(); err != nil {
		log.Fatal(err)
	}
}
