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

type WeatherData struct {
	Timestamp   string  `json:"timestamp"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Temperature float64 `json:"temperature"`
	WindSpeed   float64 `json:"wind_speed"`
	WeatherCode int     `json:"weather_code"`
}

var (
	redisHost    = os.Getenv("REDIS_HOST")
	redisPort    = os.Getenv("REDIS_PORT")
	redisAddr    = fmt.Sprintf("%s:%s", redisHost, redisPort)
	redisChannel = "weather_data_queue"
	apiURL       = os.Getenv("NESTJS_API_URL")
	httpClient   = &http.Client{Timeout: 15 * time.Second}
	ctx          = context.Background()
)

func main() {
	log.Println("Iniciando Go Worker...")

	rdb := redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: "",
		DB:       0,
		PoolSize: 5,
	})

	for i := 0; i < 10; i++ {
		_, err := rdb.Ping(ctx).Result()
		if err == nil {
			log.Println("Redis conectado. Escutando fila...")
			break
		}
		log.Printf("Tentativa %d: erro ao conectar Redis (%v). Retry em 3s...", i+1, err)
		time.Sleep(3 * time.Second)
		if i == 9 {
			log.Fatalf("Falha crítica ao conectar Redis.")
		}
	}

	for {
		result, err := rdb.BLPop(ctx, 0, redisChannel).Result()
		if err != nil {
			log.Printf("Erro ao ler Redis: %v. Retry...", err)
			time.Sleep(1 * time.Second)
			continue
		}

		payloadJson := result[1]
		log.Printf("Dado recebido: %s", payloadJson)

		var data WeatherData
		if err := json.Unmarshal([]byte(payloadJson), &data); err != nil {
			log.Printf("Erro ao deserializar: %v. Pulando.", err)
			continue
		}

		if err := sendToAPI(data); err != nil {
			log.Printf("Erro ao enviar para API: %v. Descartado.", err)
		}
	}
}

func sendToAPI(data WeatherData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("erro ao serializar: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro na requisição para API (%s): %w", apiURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("API retornou: %s", resp.Status)
	}

	log.Printf("Dados (%.2f°C) enviados com sucesso.", data.Temperature)
	return nil
}
