package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	RABBITMQ_DEFAULT_URL = "amqp://gdash:gdash2025@localhost:5672/"
	WEATHER_DATA_QUEUE   = "weather_queue"
	API_DEFAULT_URL      = "http://localhost:3000/weather"
)

type WeatherData struct {
	Latitude      string  `json:"latitude"`
	Longitude     string  `json:"longitude"`
	TempC         float64 `json:"temp_c"`
	Humidity      int     `json:"humidity"`
	WindSpeed     float64 `json:"wind_speed"`
	ConditionCode int     `json:"condition_code"`
	RainProb      int     `json:"rain_prob"`
	CollectedAt   float64 `json:"collected_at"`
}

var httpClient = &http.Client{Timeout: 10 * time.Second}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("CRITICAL %s: %s", msg, err)
	}
}

func sendToAPI(data WeatherData, apiUrl string) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Printf("Erro ao converter para JSON: %v", err)
		return
	}

	resp, err := httpClient.Post(apiUrl, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("Erro ao enviar para API: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusCreated || resp.StatusCode == http.StatusOK {
		log.Printf("Sucesso! Salvo no Banco via API. (Status: %d)", resp.StatusCode)
	} else {
		log.Printf("API rejeitou: Status %d", resp.StatusCode)
	}
}

func processWeatherReport(body []byte, apiUrl string) {
	var report WeatherData
	err := json.Unmarshal(body, &report)

	if err != nil {
		log.Printf("Erro ao decodificar JSON (pacote descartado): %v", err)
		return
	}

	log.Printf("Processando: [Lat: %s, Temp: %.1f°C, Chuva: %d%%]",
		report.Latitude, report.TempC, report.RainProb)

	sendToAPI(report, apiUrl)
}

func main() {
	rabbitURL := getEnv("RABBITMQ_URL", RABBITMQ_DEFAULT_URL)
	apiURL := getEnv("API_URL", API_DEFAULT_URL)

	log.Println("Iniciando Weather Worker...")
	log.Printf("Conectando ao broker em: %s", rabbitURL)
	log.Printf("API NestJS: %s", apiURL)

	conn, err := amqp.Dial(rabbitURL)
	failOnError(err, "Falha ao conectar no RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir canal")
	defer ch.Close()

	queue, err := ch.QueueDeclare(
		WEATHER_DATA_QUEUE,
		true,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Falha ao declarar fila")

	err = ch.Qos(1, 0, false)
	failOnError(err, "Falha ao configurar QoS")

	msgs, err := ch.Consume(
		queue.Name,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Falha ao registrar consumidor")

	forever := make(chan struct{})

	go func() {
		for delivery := range msgs {
			processWeatherReport(delivery.Body, apiURL)
			time.Sleep(100 * time.Millisecond)
		}
	}()

	log.Printf("Worker operante. Aguardando eventos na fila '%s'. (CTRL+C para sair)", queue.Name)
	<-forever
}
