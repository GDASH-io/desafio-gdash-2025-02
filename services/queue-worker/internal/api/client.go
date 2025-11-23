package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"queue-worker/internal/config"
	"queue-worker/internal/models"
	"time"
)

type Client struct {
	httpClient *http.Client
	cfg        *config.Config
}

func NewClient(cfg *config.Config) *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		cfg: cfg,
	}
}

func (c *Client) SendWeatherData(data *models.NestJSPayload) error {
	url := c.cfg.APIURL + c.cfg.APIEndpoint

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("erro ao serializar JSON: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro ao criar request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Worker-ID", c.cfg.WorkerID)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro na requisição HTTP: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		log.Printf("Dados enviados para NestJS (status: %d)", resp.StatusCode)
		return nil
	}

	return fmt.Errorf("API retornou erro (status: %d): %s", resp.StatusCode, string(body))
}
