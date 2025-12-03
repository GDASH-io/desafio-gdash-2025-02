package http

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gdash/worker/internal/domain"
	"go.uber.org/zap"
)

type APIClient struct {
	baseURL    string
	httpClient *http.Client
	logger     *zap.Logger
}

func NewAPIClient(baseURL string, timeout time.Duration, logger *zap.Logger) *APIClient {
	return &APIClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: timeout,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 10,
				IdleConnTimeout:     90 * time.Second,
			},
		},
		logger: logger,
	}
}

func (c *APIClient) SendWeatherData(ctx context.Context, data *domain.WeatherData) error {
	endpoint := fmt.Sprintf("%s/api/v1/weather/logs", c.baseURL)

	jsonData, err := data.ToJSON()
	if err != nil {
		return fmt.Errorf("failed to parse data: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	c.logger.Info("Sending weather data to API",
		zap.String("endpoint", endpoint),
		zap.String("city", data.Location.City),
		zap.Float64("temperature", data.Temperature),
	)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}

	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		c.logger.Error("API returned error",
			zap.Int("status_code", resp.StatusCode),
			zap.String("response_body", string(body)),
		)
		return fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}

	c.logger.Info("Weather data sent to API",
		zap.Int("status_code", resp.StatusCode),
		zap.String("city", data.Location.City),
	)

	return nil
}

func (c *APIClient) HealthCheck(ctx context.Context) error {
	endpoint := fmt.Sprintf("%s/health", c.baseURL)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return fmt.Errorf("failed to create health check request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("health check failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("health check returned %d", resp.StatusCode)
	}

	return nil
}
