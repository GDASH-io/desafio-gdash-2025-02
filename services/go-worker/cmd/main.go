package main
import (
	"context"
	"time"
	"github.com/jp066/desafio-gdash-2025-02/services/go-worker/internal/consumer"
	"github.com/jp066/desafio-gdash-2025-02/services/go-worker/internal/logger"
	"github.com/jp066/desafio-gdash-2025-02/services/go-worker/internal"

)

func main() {
	logger.Info("inicializando o worker")
	config, err := internal.LoadConfig("configs/config.yaml")
	if err != nil {
		logger.Error("failed to load config: " + err.Error())
		return
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		<-ctx.Done()
	}()

	for {
		if err := consumer.ConsumeRMQ(config); err != nil {
			logger.Error("erro no consumer: " + err.Error())
			time.Sleep(5 * time.Second)
			continue
		}
		time.Sleep(1 * time.Second)
	}
}
