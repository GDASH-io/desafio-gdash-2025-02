package usecases

import (
	"context"
	"fmt"
	"time"

	"github.com/gdash/worker/internal/domain"
	"go.uber.org/zap"
)

type APIClient interface {
	SendWeatherData(ctx context.Context, data *domain.WeatherData) error
}

type ProcessWeatherUseCase struct {
	apiClient  APIClient
	logger     *zap.Logger
	maxRetries int
	retryDelay time.Duration
}

func NewProcessWeatherUseCase(
	apiClient APIClient,
	logger *zap.Logger,
	maxRetries int,
	retryDelayMS int,
) *ProcessWeatherUseCase {
	return &ProcessWeatherUseCase{
		apiClient:  apiClient,
		logger:     logger,
		maxRetries: maxRetries,
		retryDelay: time.Duration(retryDelayMS) * time.Millisecond,
	}
}

func (uc *ProcessWeatherUseCase) Execute(ctx context.Context, messageBody []byte) error {
	weatherData, err := domain.ParseWeatherData(messageBody)
	if err != nil {
		uc.logger.Error("Failed to parse weather data",
			zap.Error(err),
			zap.String("message", string(messageBody)),
		)

		return fmt.Errorf("invalid message format: %w", err)
	}

	uc.logger.Info("Parsed weather data",
		zap.String("city", weatherData.Location.City),
		zap.Float64("temperature", weatherData.Temperature),
		zap.String("timestamp", weatherData.Timestamp),
	)

	return uc.sendWithRetry(ctx, weatherData)
}

func (uc *ProcessWeatherUseCase) sendWithRetry(ctx context.Context, data *domain.WeatherData) error {
	var lastErr error

	for retries := 1; retries <= uc.maxRetries; retries++ {
		if err := ctx.Err(); err != nil {
			return fmt.Errorf("context cancelled: %w", err)
		}

		uc.logger.Info("Attempting to send data to API",
			zap.Int("retry", retries),
			zap.Int("max_retries", uc.maxRetries),
		)

		if err := uc.apiClient.SendWeatherData(ctx, data); err != nil {
			lastErr = err
			uc.logger.Warn("Failed to send data to API",
				zap.Error(err),
				zap.Int("retry", retries),
			)

			if retries < uc.maxRetries {
				delay := uc.retryDelay * time.Duration(retries)
				uc.logger.Info("Retrying after delay",
					zap.Duration("delay", delay),
				)
				time.Sleep(delay)
				continue
			}

			return fmt.Errorf("max retries reached: %w", lastErr)
		}

		uc.logger.Info("Successfully sent weather data to API",
			zap.String("city", data.Location.City),
			zap.Int("retries", retries),
		)

		return nil
	}

	return fmt.Errorf("unexpected error: %w", lastErr)
}
