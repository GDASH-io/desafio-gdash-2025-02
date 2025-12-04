package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/desafio_gdash/go-weather-worker/internal/api"
	"github.com/desafio_gdash/go-weather-worker/internal/config"
	"github.com/desafio_gdash/go-weather-worker/internal/queue"
)

func main() {
	log.Println("============================================================")
	log.Println("🚀 GO WEATHER WORKER - INICIANDO")
	log.Println("============================================================")

	// 1. Carregar configurações
	cfg := config.Load()

	// 2. Criar cliente HTTP (para enviar dados à API)
	apiClient := api.NewClient(cfg)

	// 3. (Opcional) Verificar se API está acessível
	// Descomente quando a API NestJS estiver rodando
	// if err := apiClient.HealthCheck(); err != nil {
	// 	log.Printf("⚠️  API não está acessível: %v", err)
	// 	log.Println("⚠️  Worker irá tentar enviar dados mesmo assim...")
	// }

	// 4. Criar consumidor RabbitMQ
	consumer, err := queue.NewConsumer(cfg, apiClient)
	if err != nil {
		log.Fatalf("❌ Erro ao criar consumidor: %v", err)
	}
	defer consumer.Close()

	// 5. Capturar sinais de interrupção (Ctrl+C)
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// 6. Iniciar consumidor em goroutine
	go func() {
		if err := consumer.Start(cfg.WorkerConcurrency); err != nil {
			log.Fatalf("❌ Erro ao iniciar consumidor: %v", err)
		}
	}()

	// 7. Aguardar sinal de interrupção
	<-sigChan
	log.Println("\n⏹️  Sinal de interrupção recebido. Encerrando...")

	log.Println("👋 Worker encerrado com sucesso!")
}
