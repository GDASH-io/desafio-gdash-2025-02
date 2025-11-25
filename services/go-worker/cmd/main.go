package main

import (
    "context"
    "log"
    "time"
    "github.com/jp066/desafio-gdash-2025-02/services/go-worker/internal/consumer"
    "github.com/jp066/desafio-gdash-2025-02/services/go-worker/internal"
)

func main() {
    log.Println("INFO: inicializando o worker")
    config, err := internal.LoadConfig("configs/config.yaml")
    if err != nil {
        log.Printf("ERRO: falha ao carregar a configuração: %s", err.Error())
        return
    }
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    go func() {
        <-ctx.Done()
    }()

    for {
        if err := consumer.ConsumeRMQ(config); err != nil {
            log.Printf("ERROR: erro no consumer: %s", err.Error())
            time.Sleep(5 * time.Second)
        }
    }
}