package main

import (
	"log"
	"worker/internal/api"
	"worker/internal/config"
	"worker/internal/queue"
)

func main() {
	// 1. Carregar Configurações
	cfg := config.Load()

	// 2. Inicializar Client da API
	apiClient := api.NewClient(cfg)

	// 3. Iniciar Consumidor da Fila
	log.Println("Iniciando Worker Go...")
	queue.StartConsumer(cfg, apiClient)
}