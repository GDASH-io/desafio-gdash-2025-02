package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	log.Println("Iniciando Worker GDASH...")

	config := LoadConfig()
	log.Printf("Configuração carregada:")
	log.Printf("  RabbitMQ URL: %s", config.RabbitMQURL)
	log.Printf("  API URL: %s", config.APIURL)
	log.Printf("  Queue Name: %s", config.QueueName)

	apiClient := NewAPIClient(config.APIURL)
	consumer, err := NewConsumer(config.RabbitMQURL, config.QueueName, apiClient)
	if err != nil {
		log.Fatalf("Erro ao criar consumidor: %v", err)
	}
	defer consumer.Close()

	// Graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-sigChan
		log.Println("Recebido sinal de encerramento. Finalizando...")
		consumer.Close()
		os.Exit(0)
	}()

	// Iniciar consumo
	if err := consumer.Start(); err != nil {
		log.Fatalf("Erro ao iniciar consumidor: %v", err)
	}
}

