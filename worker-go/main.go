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

type WeatherLog struct {
	Timestamp      float64 `json:"timestamp"`
	LocationName   string  `json:"location_name"`
	TemperatureC   float64 `json:"temperature_c"`
	WindSpeedKmh   float64 `json:"wind_speed_kmh"`
	WeatherCode    int     `json:"weather_code"`
	Condition      string  `json:"condition"`
}

const (
	QueueName  = "weather_data_queue"
	MaxRetries = 3
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func sendToNestJS(data WeatherLog) error {
	log.Printf("-> Enviando log para a API NestJS...")

	apiURL := "http://api:3000/api/weather/logs" 

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("erro ao serializar JSON: %w", err)
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("erro ao fazer POST para NestJS: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("API NestJS retornou status de erro: %s", resp.Status)
	}

	log.Printf("-> Log enviado com sucesso. Status: %s", resp.Status)
	return nil
}

func handleMessage(d amqp.Delivery) {
	var logData WeatherLog
	err := json.Unmarshal(d.Body, &logData)
	if err != nil {
		log.Printf(" [x] ERRO DE VALIDAÇÃO/DESERIALIZAÇÃO: %v. Rejeitando mensagem (NACK) sem re-entrega.", err)
		d.Nack(false, false)
		return
	}

	for attempt := 1; attempt <= MaxRetries; attempt++ {
		err := sendToNestJS(logData)
		if err == nil {
			d.Ack(false)
			log.Printf(" [x] Processamento Concluído (ACK). Tentativas: %d", attempt)
			return
		}

		log.Printf(" [!] ERRO NO ENVIO (Tentativa %d/%d): %v", attempt, MaxRetries, err)
		time.Sleep(2 * time.Second)
	}
	log.Printf(" [X] FALHA FINAL. Rejeitando mensagem (NACK).")
	d.Nack(false, false)
}

func waitForNestJS(apiURL string) {
	log.Println(" [*] Aguardando API NestJS (", apiURL, ")...")
	for {
		_, err := http.Get(apiURL)
		if err == nil {
			log.Println(" [✓] API NestJS está online.")
			return
		}
		log.Printf(" [!] API NestJS ainda indisponível: %v. Tentando novamente em 3s...", err)
		time.Sleep(3 * time.Second)
	}
}

func main() {
	amqpURL := os.Getenv("AMQP_URL")
	if amqpURL == "" {
		amqpURL = "amqp://guest:guest@rabbitmq:5672/"
	}

	var conn *amqp.Connection
	var err error
	for i := 0; i < 10; i++ {
		conn, err = amqp.Dial(amqpURL)
		if err == nil {
			break
		}
		log.Printf("Erro ao conectar ao RabbitMQ: %v. Tentando novamente em 5s...", err)
		time.Sleep(5 * time.Second)
	}
	failOnError(err, "Falha ao conectar ao RabbitMQ após várias tentativas")
	defer conn.Close()

	apiBaseURL := "http://api:3000"
	waitForNestJS(apiBaseURL)

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir o canal")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		QueueName,
		true,
		false,
		false,
		false,
		nil, 
	)
	failOnError(err, "Falha ao declarar a fila")

	msgs, err := ch.Consume(
		q.Name,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Falha ao registrar o consumidor")

	log.Printf(" [*] Go Worker iniciado. Aguardando mensagens na fila '%s'. Para sair, pressione CTRL+C", q.Name)

	var forever chan struct{}
	go func() {
		for d := range msgs {
			log.Printf(" [R] Mensagem recebida: %s", d.Body)
			handleMessage(d)
		}
	}()

	<-forever
}