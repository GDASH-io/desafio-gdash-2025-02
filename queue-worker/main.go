package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"io"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type WeatherData struct {
	Location struct {
		Lat float64 `json:"lat"`
		Lon float64 `json:"lon"`
	} `json:"location"`
	Temperature   float64 `json:"temperature"`
	Humidity      float64 `json:"humidity"`
	WindSpeed     float64 `json:"wind_speed"`
	ConditionCode int     `json:"condition_code"`
	CollectedAt   string  `json:"collected_at"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func main() {
	rabbitMQURL := os.Getenv("RABBITMQ_URL")
	if rabbitMQURL == "" {
		rabbitMQURL = "amqp://guest:guest@localhost:5672/"
	}
	
	apiURL := os.Getenv("API_URL")
	if apiURL == "" {
		apiURL = "http://localhost:8080/weather/logs"
	}

	var conn *amqp.Connection
	var err error
	for i := 0; i < 10; i++ {
		conn, err = amqp.Dial(rabbitMQURL)
		if err == nil {
			break
		}
		log.Printf("RabbitMQ indisponível, tentando em 2s... (%d/10)", i+1)
		time.Sleep(2 * time.Second)
	}
	failOnError(err, "Falha ao conectar no RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir canal")
	defer ch.Close()

	q, err := ch.QueueDeclare("weather_data", true, false, false, false, nil)
	failOnError(err, "Falha ao declarar fila")

	msgs, err := ch.Consume(q.Name, "", false, false, false, false, nil)
	failOnError(err, "Falha ao registrar consumidor")

	log.Printf(" [*] Worker Go iniciado. Enviando para: %s", apiURL)

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			log.Printf("📥 Recebido da fila")

			var data WeatherData
			if err := json.Unmarshal(d.Body, &data); err != nil {
				log.Printf("❌ Erro JSON: %v", err)
				d.Nack(false, false) 
				continue
			}

			// Envia para a API
			err := sendToAPI(apiURL, data)
			
			if err == nil {
				d.Ack(false) 
				log.Println("✅ Dados salvos na API com sucesso!")
			} else {
				log.Printf("⚠️ Erro no envio: %v", err)
				
				time.Sleep(5 * time.Second)
				d.Nack(false, true) 
			}
		}
	}()

	<-forever
}

func sendToAPI(url string, data WeatherData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	client := &http.Client{Timeout: 5 * time.Second}
	
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("falha na requisição: %w", err)
	}
	defer resp.Body.Close()
	bodyBytes, _ := io.ReadAll(resp.Body)
	responseBody := string(bodyBytes)

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}

	if resp.StatusCode == 400 {
		log.Printf("❌ NestJS recusou: %s", responseBody)
		return fmt.Errorf("erro de validação (400)")
	}

	return fmt.Errorf("API retornou erro: %d", resp.StatusCode)
}