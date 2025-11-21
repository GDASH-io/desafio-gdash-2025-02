package http

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// APIClient implementa APIClientRepository
type APIClient struct {
	baseURL    string
	timeout    time.Duration
	maxRetries int
	client     *http.Client
}

// NewAPIClient cria um novo cliente HTTP para API NestJS
func NewAPIClient(baseURL string, timeout time.Duration, maxRetries int) *APIClient {
	return &APIClient{
		baseURL:    baseURL,
		timeout:    timeout,
		maxRetries: maxRetries,
		client: &http.Client{
			Timeout: timeout,
		},
	}
}

// SendWeatherLogs envia logs de clima para a API
func (c *APIClient) SendWeatherLogs(logs []interface{}) error {
	url := fmt.Sprintf("%s/api/v1/weather/logs", c.baseURL)
	
	// Serializar logs
	body, err := json.Marshal(logs)
	if err != nil {
		return fmt.Errorf("erro ao serializar logs: %w", err)
	}
	
	// Criar requisição
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %w", err)
	}
	
	req.Header.Set("Content-Type", "application/json")
	
	// Executar com retry
	var lastErr error
	for i := 0; i < c.maxRetries; i++ {
		resp, err := c.client.Do(req)
		if err != nil {
			lastErr = err
			if i < c.maxRetries-1 {
				time.Sleep(time.Duration(i+1) * time.Second)
			}
			continue
		}
		
		defer resp.Body.Close()
		
		// Verificar status
		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			return nil // Sucesso
		}
		
		// Ler body do erro
		bodyBytes, _ := io.ReadAll(resp.Body)
		lastErr = fmt.Errorf("API retornou status %d: %s", resp.StatusCode, string(bodyBytes))
		
		if i < c.maxRetries-1 {
			time.Sleep(time.Duration(i+1) * time.Second)
		}
	}
	
	return fmt.Errorf("erro após %d tentativas: %w", c.maxRetries, lastErr)
}

// IsHealthy verifica se a API está saudável
func (c *APIClient) IsHealthy() bool {
	url := fmt.Sprintf("%s/health", c.baseURL)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false
	}
	
	resp, err := c.client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	
	return resp.StatusCode == 200
}

