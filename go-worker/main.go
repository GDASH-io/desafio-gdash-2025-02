package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"go-worker/client"
	"go-worker/config"
	"go-worker/consumer"
)

func main() {
	log.Println("================================================================================")
	log.Println("🌦️  GDASH Weather - Go Worker")
	log.Println("================================================================================")

	// Carregar configurações
	cfg := config.Load()

	// Criar cliente da API
	apiClient := client.NewAPIClient(cfg.APIURL)

	// Health check da API
	log.Println("\n🏥 Verificando disponibilidade da API...")
	if err := apiClient.HealthCheck(); err != nil {
		log.Printf("⚠️  API pode estar indisponível: %v", err)
		log.Println("   Continuando mesmo assim (tentará conectar ao receber mensagens)")
	} else {
		log.Println("✅ API está disponível!")
	}

	// Criar consumer RabbitMQ
	log.Println("\n🔌 Iniciando consumer RabbitMQ...")
	consumer, err := consumer.NewRabbitMQConsumer(
		cfg.RabbitMQURL,
		cfg.RabbitMQQueue,
		apiClient,
	)
	if err != nil {
		log.Fatalf("❌ Erro fatal ao criar consumer: %v", err)
	}
	defer consumer.Close()

	// Canal para sinais de interrupção
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// Iniciar consumo em goroutine
	errChan := make(chan error, 1)
	go func() {
		if err := consumer.Start(); err != nil {
			errChan <- err
		}
	}()

	// Aguardar sinal de parada ou erro
	select {
	case err := <-errChan:
		log.Fatalf("❌ Erro no consumer: %v", err)
	case sig := <-sigChan:
		log.Printf("\n📡 Sinal recebido: %v", sig)
		log.Println("🛑 Encerrando worker...")
	}

	log.Println("\n👋 Worker encerrado!")
}