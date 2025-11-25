package processor

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

type WeatherProcessor struct {
	apiURL string
}

func NewWeatherProcessor() *WeatherProcessor {
	return &WeatherProcessor{
		apiURL: "http://nestjs-api:3000/api/weather/logs", // HOST DO DOCKER!
	}
}

func (p *WeatherProcessor) Handle(ctx context.Context, data map[string]interface{}) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Println("❌ Erro ao converter payload:", err)
		return
	}

	log.Println("📤 Enviando dados processados para API NestJS...")

	req, err := http.NewRequest("POST", p.apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Println("❌ Erro ao criar requisição:", err)
		return
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Println("❌ Erro ao enviar dados para backend:", err)
		return
	}
	defer resp.Body.Close()

	log.Println("✅ Dados enviados ao backend. Status:", resp.Status)
}
