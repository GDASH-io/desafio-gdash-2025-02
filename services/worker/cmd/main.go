package main

import (
	"context"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/gdash/worker/internal/adapters/http"
	"github.com/gdash/worker/internal/adapters/queue"
	"github.com/gdash/worker/internal/config"
	"github.com/gdash/worker/internal/usecases"
	"go.uber.org/zap"
)

func main() {
	logger, err := initLogger()
	if err != nil {
		panic("Failed to initialize logger: " + err.Error())
	}
	defer logger.Sync()

	logger.Info("========================================")
	logger.Info("GDASH Weather Worker Starting")
	logger.Info("========================================")

	cfg := config.Get()
	if err := cfg.Validate(); err != nil {
		logger.Fatal("Invalid configuration", zap.Error(err))
	}

	logger.Info("Configuration loaded",
		zap.String("rabbitmq_queue", cfg.QueueName),
		zap.String("api_base_url", cfg.APIBaseURL),
		zap.Int("worker_count", cfg.WorkerCount),
		zap.Int("max_retries", cfg.MaxRetries),
	)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	apiClient := http.NewAPIClient(
		cfg.APIBaseURL,
		time.Duration(cfg.APITimeout)*time.Second,
		logger,
	)

	logger.Info("Waiting for API to be ready...")
	if err := waitForAPI(ctx, apiClient, logger); err != nil {
		logger.Fatal("API not available", zap.Error(err))
	}
	logger.Info("API is ready")

	processUseCase := usecases.NewProcessWeatherUseCase(
		apiClient,
		logger,
		cfg.MaxRetries,
		cfg.RetryDelayMS,
	)

	messageHandler := func(ctx context.Context, body []byte) error {
		return processUseCase.Execute(ctx, body)
	}

	var wg sync.WaitGroup
	for i := 1; i <= cfg.WorkerCount; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			runWorker(ctx, workerID, cfg, messageHandler, logger)
		}(i)
	}

	logger.Info("All workers started",
		zap.Int("count", cfg.WorkerCount),
	)

	<-sigChan
	logger.Info("Shutdown started")

	cancel()

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		logger.Info("All workers stopped")
	case <-time.After(30 * time.Second):
		logger.Warn("Shutdown timeout exceeded, forcing exit")
	}

	logger.Info("========================================")
	logger.Info("GDASH Weather Worker Stopped")
	logger.Info("========================================")
}

func runWorker(
	ctx context.Context,
	workerID int,
	cfg *config.Config,
	handler queue.MessageHandler,
	logger *zap.Logger,
) {
	workerLogger := logger.With(zap.Int("worker_id", workerID))
	workerLogger.Info("Worker starting")

	consumer, err := queue.NewConsumer(
		cfg.RabbitMQURL,
		cfg.QueueName,
		cfg.PrefetchCount,
		workerLogger,
	)
	if err != nil {
		workerLogger.Fatal("Failed to create consumer", zap.Error(err))
		return
	}
	defer consumer.Close()

	if err := consumer.Consume(ctx, handler); err != nil {
		if ctx.Err() != nil {
			workerLogger.Info("Worker stopped due to context cancellation")
		} else {
			workerLogger.Error("Worker stopped with error", zap.Error(err))
		}
	}

	workerLogger.Info("Worker stopped")
}

func waitForAPI(ctx context.Context, client *http.APIClient, logger *zap.Logger) error {
	maxAttempts := 30
	delay := 2 * time.Second

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		logger.Info("Checking API health",
			zap.Int("attempt", attempt),
			zap.Int("max_attempts", maxAttempts),
		)

		healthCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
		err := client.HealthCheck(healthCtx)
		cancel()

		if err == nil {
			return nil
		}

		logger.Warn("API health check failed",
			zap.Error(err),
			zap.Duration("retry_in", delay),
		)

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(delay):
		}
	}

	return os.ErrDeadlineExceeded
}

func initLogger() (*zap.Logger, error) {
	cfg := zap.NewProductionConfig()
	cfg.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
	cfg.Encoding = "json"
	cfg.OutputPaths = []string{"stdout"}

	return cfg.Build()
}
