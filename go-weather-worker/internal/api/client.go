package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/desafio_gdash/go-weather-worker/internal/config"
	"github.com/desafio_gdash/go-weather-worker/internal/models"
)

// Client é o cliente HTTP para comunicação com a API NestJS
type Client struct {
	httpClient *http.Client
	baseURL    string
	endpoint   string
	retries    int
	retryDelay time.Duration
}

// NewClient cria uma nova instância do cliente HTTP
func NewClient(cfg *config.Config) *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		baseURL:    cfg.APIBaseURL,
		endpoint:   cfg.APIEndpoint,
		retries:    cfg.RetryAttempts,
		retryDelay: cfg.RetryDelay,
	}
}

// SendWeatherData envia dados climáticos para a API NestJS
func (c *Client) SendWeatherData(data *models.WeatherData) error {
	// Converter para formato da API
	payload := data.ToAPIPayload()

	// Serializar para JSON
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("erro ao serializar dados: %w", err)
	}

	// URL completa
	url := c.baseURL + c.endpoint

	// Tentar enviar com retry
	var lastErr error
	for attempt := 1; attempt <= c.retries; attempt++ {
		err := c.sendRequest(url, jsonData, attempt)
		if err == nil {
			// Sucesso!
			log.Printf("✅ Dados enviados com sucesso para a API (tentativa %d/%d)", attempt, c.retries)
			return nil
		}

		lastErr = err
		log.Printf("⚠️  Tentativa %d/%d falhou: %v", attempt, c.retries, err)

		// Aguardar antes de retry (exceto na última tentativa)
		if attempt < c.retries {
			time.Sleep(c.retryDelay)
		}
	}

	return fmt.Errorf("falha após %d tentativas: %w", c.retries, lastErr)
}

// sendRequest realiza a requisição HTTP POST
func (c *Client) sendRequest(url string, jsonData []byte, attempt int) error {
	// Criar requisição
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %w", err)
	}

	// Headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Go-Weather-Worker/1.0")

	// Log da requisição
	log.Printf("📤 Enviando dados para %s (tentativa %d)", url, attempt)

	// Executar requisição
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro na requisição HTTP: %w", err)
	}
	defer resp.Body.Close()

	// Ler corpo da resposta
	body, _ := io.ReadAll(resp.Body)

	// Verificar status code
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		log.Printf("✅ API respondeu com status %d: %s", resp.StatusCode, string(body))
		return nil
	}

	return fmt.Errorf("API retornou status %d: %s", resp.StatusCode, string(body))
}

// HealthCheck verifica se a API está acessível
func (c *Client) HealthCheck() error {
	url := c.baseURL + "/health" // Endpoint de health check

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("API inacessível: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("API retornou status %d", resp.StatusCode)
	}

	log.Println("✅ API está acessível")
	return nil
}
