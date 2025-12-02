package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"worker/internal/config"
	"worker/internal/domain"
)

type Client struct {
	cfg *config.Config
}

func NewClient(cfg *config.Config) *Client {
	return &Client{cfg: cfg}
}

func (c *Client) SendToBackend(data domain.WeatherData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	// Aqui faremos o POST real para o NestJS.
    // Por enquanto, vamos logar que estamos tentando.
	fmt.Printf(" [API] Enviando para %s: %s\n", c.cfg.APIURL, string(jsonData))

	// Código real para quando o NestJS estiver pronto:
	resp, err := http.Post(c.cfg.APIURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
        // Retornamos nil para não travar o worker enquanto não temos API
		fmt.Printf(" [API Error] Falha ao conectar na API (Esperado por enquanto): %v\n", err)
		return nil 
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("API retornou status: %d", resp.StatusCode)
	}

	return nil
}