package main

import (
	"log"
	"os"
	"os/signal"
	"queue-worker/internal/config"
	"queue-worker/internal/consumer"
	"syscall"
)

func main() {
	log.SetFlags(log.Ldate | log.Ltime)

	log.Println("GDASH Queue Worker")

	cfg := config.Load()

	cons, err := consumer.New(cfg)
	if err != nil {
		log.Fatalf("Erro ao criar consumer: %v", err)
	}
	defer cons.Close()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigChan
		log.Println("\nEncerrando...")
		cons.Close()
		os.Exit(0)
	}()

	if err := cons.Start(); err != nil {
		log.Fatalf("Erro ao iniciar consumer: %v", err)
	}
}
