package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"

	amqp "github.com/rabbitmq/amqp091-go"
)

type WeatherData struct {
	City             string  `json:"city"`
	Latitude         float64 `json:"latitude"`
	Longitude        float64 `json:"longitude"`
	Temperature      float64 `json:"temperature"`
	FeelsLike        float64 `json:"feels_like"`
	Humidity         int     `json:"humidity"`
	Pressure         int     `json:"pressure"`
	WindSpeed        float64 `json:"wind_speed"`
	WindDirection    int     `json:"wind_direction"`
	WeatherCondition string  `json:"weather_condition"`
	WeatherMain      string  `json:"weather_main"`
	Cloudiness       int     `json:"cloudiness"`
	Visibility       int     `json:"visibility"`
	Timestamp        int64   `json:"timestamp"`
	CollectionTime   int64   `json:"collection_time"`
}

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Erro ao carregar arquivo .env")
	}

	rabbitmqURL := os.Getenv("RABBITMQ_URL")
	apiURL := os.Getenv("API_URL")

	log.Printf("RabbitMQ URL: %s", rabbitmqURL)
	log.Printf("API URL: %s", apiURL)

	conn, err := amqp.Dial(rabbitmqURL)
	if err != nil {
		log.Fatalf("Falha ao conectar ao RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Falha ao abrir canal: %v", err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"weather_data", // nome
		true,           // durable
		false,          // delete when unused
		false,          // exclusive
		false,          // no-wait
		nil,            // arguments
	)
	if err != nil {
		log.Fatalf("Falha ao declarar fila: %v", err)
	}

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		log.Fatalf("Falha ao registrar consumer: %v", err)
	}

	var forever chan struct{}

	go func() {
		for d := range msgs {
			log.Printf("Mensagem recebida: %s", d.Body)

			var weatherData WeatherData
			if err := json.Unmarshal(d.Body, &weatherData); err != nil {
				log.Printf("Erro ao decodificar JSON: %v", err)
				d.Nack(false, false)
				continue
			}

			if err := sendToAPI(apiURL, weatherData); err != nil {
				log.Printf("Erro ao enviar para API: %v", err)
				d.Nack(false, true)
				continue
			}

			d.Ack(false)
			log.Printf("Dados processados e enviados para API: %s - %.1f°C",
				weatherData.City, weatherData.Temperature)
		}
	}()

	log.Printf("Worker aguardando mensagens...")
	<-forever
}
func sendToAPI(apiURL string, data WeatherData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("erro ao serializar dados: %v", err)
	}

	resp, err := http.Post(apiURL+"/weather", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro na requisição HTTP: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("status code inesperado: %d", resp.StatusCode)
	}

	return nil
}
