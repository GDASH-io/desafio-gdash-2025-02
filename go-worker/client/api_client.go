package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"go-worker/models"
)

// APIClient gerencia comunicação com a API NestJS
type APIClient struct {
	baseURL    string
	httpClient *http.Client
}

// NewAPIClient cria nova instância do cliente
func NewAPIClient(baseURL string) *APIClient {
	return &APIClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// SendWeatherData envia dados climáticos para a API
func (c *APIClient) SendWeatherData(data *models.WeatherData) error {
	url := fmt.Sprintf("%s/weather/logs", c.baseURL)

	// Serializar para JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("erro ao serializar dados: %w", err)
	}

	// Criar requisição POST
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %w", err)
	}

	// Headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "WeAIther-Go-Worker/1.0")

	// Enviar requisição
	log.Printf("📤 Enviando dados para API: %s", url)
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro ao enviar requisição: %w", err)
	}
	defer resp.Body.Close()

	// Ler resposta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("erro ao ler resposta: %w", err)
	}

	// Verificar status
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("API retornou erro (status %d): %s", resp.StatusCode, string(body))
	}

	// Parse da resposta
	var apiResp models.APIResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		log.Printf("⚠️  Não foi possível parsear resposta, mas status OK: %s", string(body))
	} else {
		log.Printf("✅ Dados enviados com sucesso! ID: %s", apiResp.ID)
	}

	return nil
}

// HealthCheck verifica se a API está disponível
func (c *APIClient) HealthCheck() error {
	url := fmt.Sprintf("%s/health", c.baseURL)

	resp, err := c.httpClient.Get(url)
	if err != nil {
		return fmt.Errorf("API indisponível: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 && resp.StatusCode != 404 {
		return fmt.Errorf("API retornou status %d", resp.StatusCode)
	}

	return nil
}