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

const (
	defaultRabbitMQHost = "localhost"
	defaultRabbitMQPort = "5672"
	defaultRabbitMQUser = "guest"
	defaultRabbitMQPass = "guest"
	defaultNestjsAPIURL = "http://localhost:3000"
	queueName           = "weather_data"
	maxRetries          = 5
	retryDelay          = 5 * time.Second
)

type WeatherData struct {
	Timestamp                string  `json:"timestamp"`
	Latitude                 float64 `json:"latitude"`
	Longitude                float64 `json:"longitude"`
	Temperature              float64 `json:"temperature"`
	Windspeed                float64 `json:"windspeed"`
	Weathercode              int     `json:"weathercode"`
	IsDay                    int     `json:"is_day"`
	Humidity                 int     `json:"humidity,omitempty"`
	PrecipitationProbability int     `json:"precipitation_probability,omitempty"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %v", msg, err)
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func main() {
	rabbitMQHost := getEnv("RABBITMQ_HOST", defaultRabbitMQHost)
	rabbitMQPort := getEnv("RABBITMQ_PORT", defaultRabbitMQPort)
	rabbitMQUser := getEnv("RABBITMQ_USER", defaultRabbitMQUser)
	rabbitMQPass := getEnv("RABBITMQ_PASS", defaultRabbitMQPass)
	nestjsAPIURL := getEnv("NESTJS_API_URL", defaultNestjsAPIURL)

	rabbitMQConnStr := fmt.Sprintf("amqp://%s:%s@%s:%s/", rabbitMQUser, rabbitMQPass, rabbitMQHost, rabbitMQPort)

	conn, err := amqp.Dial(rabbitMQConnStr)
	failOnError(err, "Falha ao conectar ao RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir um canal")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Falha ao declarar uma fila")

	msgs, err := ch.Consume(
		q.Name,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Falha ao registrar um consumidor")

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf("Mensagem recebida: %s", d.Body)

			var weatherData WeatherData
			err := json.Unmarshal(d.Body, &weatherData)
			if err != nil {
				log.Printf("Erro ao decodificar JSON: %v, Rejeitando mensagem", err)
				d.Nack(false, false)
				continue
			}

			retries := 0
			success := false
			for retries < maxRetries {
				err = sendToNestJSAPI(weatherData, nestjsAPIURL)
				if err != nil {
					log.Printf("Erro ao enviar para a API NestJS: %v, Tentando novamente em %v", err, retryDelay)
					retries++
					time.Sleep(retryDelay)
				} else {
					success = true
					break
				}
			}

			if success {
				log.Printf("Mensagem processada com sucesso e enviada para a API NestJS. Confirmando mensagem.")
				d.Ack(false)
			} else {
				log.Printf("Falha ao enviar mensagem para a API NestJS após %d tentativas. Rejeitando mensagem.", maxRetries)
				d.Nack(false, true)
			}
		}
	}()

	log.Printf(" [*] Aguardando mensagens. Para sair pressione CTRL+C")
	<-forever
}

func sendToNestJSAPI(data WeatherData, apiURL string) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("erro ao codificar dados de clima para JSON: %w", err)
	}

	resp, err := http.Post(fmt.Sprintf("%s/api/weather/logs", apiURL), "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro ao enviar dados para a API NestJS: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("código de status inesperado da API NestJS: %d", resp.StatusCode)
	}

	return nil
}
