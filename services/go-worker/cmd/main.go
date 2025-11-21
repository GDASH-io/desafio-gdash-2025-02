package main

import (
	"context"
	"time"

	"github.com/jp066/desafio-gdash-2025-02/services/go-worker/internal/consumer"
	"github.com/jp066/desafio-gdash-2025-02/services/go-worker/internal/logger"
)

func main() {
	logger.Info("go-worker starting")

	// graceful shutdown context
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// start a goroutine to listen for interrupt/term signals
	go func() {
		// block until context is cancelled in case parent wants to stop
		<-ctx.Done()
	}()

	// Main worker loop: call consumer.Consume repeatedly with simple backoff on error
	for {
		// Attempt to consume/process messages (blocking or short-running depending on implementation)
		if err := consumer.Consume(); err != nil {
			logger.Error("consumer error: " + err.Error())
			// backoff before retrying
			time.Sleep(5 * time.Second)
			continue
		}

		// If consume returned without error, pause briefly before next iteration
		time.Sleep(1 * time.Second)
	}
}
