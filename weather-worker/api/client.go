package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"weathernator/worker/config"
	"weathernator/worker/models"
)

type Client struct {
	config     *config.Config
	httpClient *http.Client
}

func NewClient(cfg *config.Config) *Client {
	return &Client{
		config:     cfg,
		httpClient: &http.Client{Timeout: cfg.APITimeout},
	}
}

func (c *Client) SendWeatherData(data models.WeatherData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("erro ao serializar JSON: %w", err)
	}

	url := fmt.Sprintf("%s/api/weather/logs", c.config.APIURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro ao enviar requisição: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("erro na API: status %d, body: %s", resp.StatusCode, string(body))
	}

	log.Printf("📡 API respondeu: status %d", resp.StatusCode)
	return nil
}
