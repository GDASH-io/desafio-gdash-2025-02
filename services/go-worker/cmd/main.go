package main

import (
    "context"
    "log"
    "time"
    "github.com/jp066/desafio-gdash-2025-02/services/go-worker/internal/consumer"
    "github.com/jp066/desafio-gdash-2025-02/services/go-worker/internal"
)

func main() {
    log.Println("[INFO] Inicializando Go Worker...")
    config, err := internal.LoadConfig("configs/config.yaml")
    if err != nil {
        log.Fatalf("[ERROR] Erro ao carregar configuração: %v", err)
        return
    }
    
    log.Println("[INFO] Aguardando RabbitMQ estar disponível...")
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    go func() {
        <-ctx.Done()
    }()

    retryCount := 0
    maxInitialRetries := 12 // 1 minuto de tentativas (12 x 5s)

    for {
        if err := consumer.ConsumeRMQ(config); err != nil {
            retryCount++
            if retryCount <= maxInitialRetries {
                log.Printf("[WARN] Tentativa %d/%d - Aguardando RabbitMQ... (próxima em 5s)", retryCount, maxInitialRetries)
            } else {
                log.Printf("[ERROR] Erro no consumer: %v (reconectando em 5s)", err)
            }
            time.Sleep(5 * time.Second)
        } else {
            // Reset retry count após conexão bem-sucedida
            retryCount = 0
        }
    }
}