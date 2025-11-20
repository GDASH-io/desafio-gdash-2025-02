package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"worker-go/internal/config"
	"worker-go/internal/consumer"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("Iniciando Weather Worker...")
	
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Erro ao carregar config: %v", err)
	}
	
	log.Printf("RabbitMQ: %s:%d", cfg.RabbitMQHost, cfg.RabbitMQPort)
	log.Printf("Fila: %s", cfg.RabbitMQQueue)
	
	cons := consumer.NewConsumer(cfg)
	
	if err := cons.Connect(); err != nil {
		log.Fatalf("Erro ao conectar: %v", err)
	}
	defer cons.Close()
	
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	
	go func() {
		<-sigChan
		log.Println("\n Sinal de interrupção recebido. Encerrando...")
		cons.Close()
		os.Exit(0)
	}()
	
	log.Println("Worker pronto!")
	if err := cons.Start(cons.ProcessMessage); err != nil {
		log.Fatalf("Erro ao iniciar consumo: %v", err)
	}
}