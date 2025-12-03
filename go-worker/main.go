package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
)

// Estrutura para os dados climáticos recebidos
type WeatherData struct {
	Timestamp string  `json:"timestamp"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Temperature float64 `json:"temperature"`
	WindSpeed float64 `json:"wind_speed"`
	WeatherCode int     `json:"weather_code"`
}

// --- CONFIGURAÇÕES E CLIENTS ---
var (
	redisHost   = os.Getenv("REDIS_HOST")
	redisPort   = os.Getenv("REDIS_PORT")
	redisAddr   = fmt.Sprintf("%s:%s", redisHost, redisPort)
	redisChannel = "weather_data_queue"
	apiURL      = os.Getenv("NESTJS_API_URL") // Endpoint da API NestJS (env pass é NESTJS_API_URL)
	httpClient  = &http.Client{Timeout: 15 * time.Second}
	ctx         = context.Background()
)

func main() {
	log.Println("Iniciando Go Worker...")

	// Conexão com o Redis
	rdb := redis.NewClient(&redis.Options{
		Addr: redisAddr,
		Password: "", 
		DB: 0,       
		PoolSize: 5,
	})

	// Loop de tentativa de conexão para resiliência
	for i := 0; i < 10; i++ {
		_, err := rdb.Ping(ctx).Result()
		if err == nil {
			log.Println("Conexão com Redis estabelecida. Escutando a fila...")
			break
		}
		log.Printf("Tentativa %d: Falha ao conectar ao Redis (%v). ReTentando em 3s...", i+1, err)
		time.Sleep(3 * time.Second)
		if i == 9 {
			log.Fatalf("Falha crítica ao conectar ao Redis.")
		}
	}

	// Loop principal para consumir a fila
	for {
		// BLPOP: Remove e obtém o primeiro elemento em uma lista, ou bloqueia a conexão.
		// Timeout 0 significa bloqueio infinito.
		result, err := rdb.BLPop(ctx, 0, redisChannel).Result()
		if err != nil {
			log.Printf("Erro ao ler do Redis: %v. Tentando novamente...", err)
			time.Sleep(1 * time.Second)
			continue
		}

		// result[0] é o nome da chave (redisChannel), result[1] é o valor JSON
		payloadJson := result[1]
		log.Printf("Dado recebido: %s", payloadJson)

		// 1. Deserializar o payload JSON
		var data WeatherData
		if err := json.Unmarshal([]byte(payloadJson), &data); err != nil {
			log.Printf("Erro ao deserializar JSON: %v. Pulando dado.", err)
			continue
		}

		// 2. Enviar para a API NestJS
		if err := sendToAPI(data); err != nil {
			// Em um sistema real, aqui você implementaria uma Fila de Letras Mortas (DLQ)
			log.Printf("ERRO FATAL: Falha ao enviar dados para a API: %v. O dado foi descartado.", err)
		}
	}
}

func sendToAPI(data WeatherData) error {
	// Serializa o struct de volta para JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("erro ao serializar dado para a API: %w", err)
	}

	// Cria e envia a requisição HTTP POST
	req, err := http.NewRequestWithContext(ctx, "POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição HTTP: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro na requisição HTTP para a API (%s): %w", apiURL, err)
	}
	defer resp.Body.Close()

	// Verifica o status de sucesso
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("API retornou status inesperado: %s", resp.Status)
	}

	log.Printf("Dados de clima (%.2f°C) enviados e persistidos com sucesso.", data.Temperature)
	return nil
}