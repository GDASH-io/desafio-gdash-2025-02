package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
	"golang.org/x/net/context"
)

// WeatherData representa os dados climáticos
type WeatherData struct {
	City        string  `json:"city"`
	Country     string  `json:"country"`
	Temperature float64 `json:"temperature"`
	FeelsLike   float64 `json:"feels_like"`
	TempMin     float64 `json:"temp_min"`
	TempMax     float64 `json:"temp_max"`
	Pressure    int     `json:"pressure"`
	Humidity    int     `json:"humidity"`
	Description string  `json:"description"`
	WindSpeed   float64 `json:"wind_speed"`
	Clouds      int     `json:"clouds"`
	Timestamp   string  `json:"timestamp"`
	CollectedAt string  `json:"collected_at"`
}

// Worker processa mensagens da fila Redis
type Worker struct {
	redisClient *redis.Client
	apiBaseURL  string
	ctx         context.Context
}

// NewWorker cria uma nova instância do worker
func NewWorker() *Worker {
	ctx := context.Background()

	redisHost := getEnv("REDIS_HOST", "redis")
	redisPort := getEnv("REDIS_PORT", "6379")
	apiBaseURL := getEnv("API_BASE_URL", "http://nestjs-api:3000")

	// Conectar ao Redis
	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", redisHost, redisPort),
		Password: getEnv("REDIS_PASSWORD", ""),
		DB:       0,
	})

	// Testar conexão
	_, err := client.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Error connecting to Redis: %v", err)
	}

	log.Println("Connected to Redis")

	return &Worker{
		redisClient: client,
		apiBaseURL:  apiBaseURL,
		ctx:         ctx,
	}
}

// getEnv obtém variável de ambiente com valor padrão
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// ProcessQueue processa mensagens da fila
func (w *Worker) ProcessQueue() {
	log.Println("Go Worker started")
	log.Printf("API URL: %s", w.apiBaseURL)
	log.Println("Waiting for messages...")

	for {
		// Bloqueia até receber uma mensagem (timeout de 0 = aguarda indefinidamente)
		result, err := w.redisClient.BLPop(w.ctx, 0, "weather_queue").Result()
		if err != nil {
			log.Printf("⚠️  Erro ao ler da fila: %v", err)
			time.Sleep(5 * time.Second)
			continue
		}

		// result[0] é o nome da chave, result[1] é o valor
		if len(result) < 2 {
			continue
		}

		message := result[1]

		// Processar mensagem
		w.processMessage(message)
	}
}

// processMessage processa uma mensagem individual
func (w *Worker) processMessage(message string) {
	var weatherData WeatherData

	// Parse JSON
	err := json.Unmarshal([]byte(message), &weatherData)
	if err != nil {
		log.Printf("Error parsing JSON: %v", err)
		return
	}

	log.Printf("Received: %s - %.1f°C", weatherData.City, weatherData.Temperature)

	// Enviar para API
	err = w.sendToAPI(weatherData)
	if err != nil {
		log.Printf("Error sending to API: %v", err)
		// Em caso de erro, reenviar para a fila
		w.requeueMessage(message)
		return
	}

	log.Printf("Sent to API: %s", weatherData.City)
}

// sendToAPI envia dados para a API NestJS
func (w *Worker) sendToAPI(data WeatherData) error {
	url := fmt.Sprintf("%s/weather", w.apiBaseURL)

	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("API retornou status %d", resp.StatusCode)
	}

	return nil
}

// requeueMessage reenvia mensagem para a fila em caso de erro
func (w *Worker) requeueMessage(message string) {
	err := w.redisClient.RPush(w.ctx, "weather_queue", message).Err()
	if err != nil {
		log.Printf("⚠️  Erro ao reenviar para fila: %v", err)
	} else {
		log.Println("🔄 Mensagem reenviada para a fila")
	}
}

// Close fecha as conexões
func (w *Worker) Close() {
	w.redisClient.Close()
}

func main() {
	worker := NewWorker()
	defer worker.Close()

	worker.ProcessQueue()
}
