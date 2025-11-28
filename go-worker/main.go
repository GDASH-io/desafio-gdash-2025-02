package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// WeatherData define o contrato estrito de dados.
type WeatherData struct {
	Location struct {
		Lat float64 `json:"lat"`
		Lon float64 `json:"lon"`
	} `json:"location"`
	Timestamp   string  `json:"timestamp"`
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	Radiation   float64 `json:"radiation"`
	WindSpeed   float64 `json:"wind_speed"`
	WeatherCode int     `json:"weather_code"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func main() {
	rabbitMQURL := os.Getenv("RABBITMQ_URL")
	apiURL := os.Getenv("API_URL")

	var conn *amqp.Connection
	var err error

	for i := 0; i < 15; i++ {
		conn, err = amqp.Dial(rabbitMQURL)
		if err == nil {
			log.Println("Conectado ao RabbitMQ!")
			break
		}
		log.Printf("RabbitMQ indisponível. Tentativa %d/15. Erro: %v", i+1, err)
		time.Sleep(2 * time.Second)
	}
	failOnError(err, "Falha crítica ao conectar ao RabbitMQ após várias tentativas")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir canal")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"weather_data", // name
		true,           // durable
		false,          // delete when unused
		false,          // exclusive
		false,          // no-wait
		nil,            // arguments
	)
	failOnError(err, "Falha ao declarar fila")

	err = ch.Qos(1, 0, false) // Processa 1 por vez
	failOnError(err, "Falha ao configurar QoS")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack 
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Falha ao registrar consumidor")

	forever := make(chan struct{})

	// Cliente HTTP reutilizável (Performance)
	httpClient := &http.Client{Timeout: 10 * time.Second}

	go func() {
		for d := range msgs {
			log.Printf("Recebida mensagem de %d bytes", len(d.Body))

			// Validação
			var data WeatherData
			err := json.Unmarshal(d.Body, &data)
			if err != nil {
				log.Printf("Erro de validação/JSON inválido: %v. Descartando mensagem.", err)
				// Rejeita a mensagem sem requeue (ela está corrompida)
				d.Nack(false, false) 
				continue
			}

			// Envio para API com Retry
			const maxRetries = 5
			retryDelay := 2 * time.Second
			var apiErr error
			sentSuccess := false

			for i := 0; i < maxRetries; i++ {
				apiErr = postToAPI(httpClient, apiURL, data)
				if apiErr == nil {
					sentSuccess = true
					break // Sucesso
				}
				
				log.Printf("Tentativa %d/%d falhou: %v. Aguardando %v...", i+1, maxRetries, apiErr, retryDelay)
				time.Sleep(retryDelay) // Espera antes de tentar de novo
			}

			// Decisão final após as tentativas
			if !sentSuccess {
				log.Printf("ERRO FINAL: Falha ao enviar para API após %d tentativas. Erro: %v", maxRetries, apiErr)
				// Descarta a mensagem 
				d.Ack(false) 
			} else {
				log.Printf("Sucesso! Dados de temp=%.1f°C enviados.", data.Temperature)
				d.Ack(false)
			}
		}
	}()

	log.Printf(" [*] Worker Go rodando. Aguardando mensagens...")
	<-forever
}


func postToAPI(client *http.Client, url string, data WeatherData) error {
	// Converte a Struct para JSON (bytes)
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	// Cria o Request usando jsonData (os bytes)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("API retornou status: %s", resp.Status)
	}

	return nil
}