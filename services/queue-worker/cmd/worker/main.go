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

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	done := make(chan bool, 1)

	go func() {
		<-sigChan
		log.Println("\nEncerrando...")
		cons.Close()
		done <- true
	}()

	go func() {
		if err := cons.Start(); err != nil {
			log.Printf("Erro no consumer: %v", err)
			done <- true
		}
	}()

	<-done
	log.Println("Worker encerrado")
}
