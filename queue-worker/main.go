package main

import (
	"encoding/json"
	"log"
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

	var conn *amqp.Connection
	var err error
	for i := 0; i < 5; i++ {
		conn, err = amqp.Dial(rabbitMQURL)
		if err == nil {
			break
		}
		log.Printf("RabbitMQ não disponível, tentando em 2s... (%d/5)", i+1)
		time.Sleep(2 * time.Second)
	}
	failOnError(err, "Falha ao conectar no RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir canal")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"weather_data", // nome
		true,           // durable
		false,          // delete when unused
		false,          // exclusive
		false,          // no-wait
		nil,            // arguments
	)
	failOnError(err, "Falha ao declarar fila")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer tag
		false,  // auto-ack (vamos confirmar manualmente após processar)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Falha ao registrar consumidor")

	var forever chan struct{}

	go func() {
		for d := range msgs {
			log.Printf("📥 Recebido: %s", d.Body)

			var data WeatherData
			err := json.Unmarshal(d.Body, &data)
			if err != nil {
				log.Printf("Erro ao decodificar JSON: %v", err)
				d.Nack(false, false) 
				continue
			}

			// TODO: Enviar para API NestJS (Passo 3)
			err = sendToAPI(data) 
			
			if err == nil {
				d.Ack(false)
				log.Println("✅ Processado com sucesso!")
			} else {
				log.Printf("⚠️ Falha ao enviar para API. Tentando novamente... Erro: %v", err)
				d.Ack(false) 
			}
		}
	}()

	log.Printf(" [*] Aguardando mensagens na fila '%s'. Para sair pressione CTRL+C", q.Name)
	<-forever
}

func sendToAPI(data WeatherData) error {
	// Aqui faremos o HTTP POST para o NestJS depois
	// url := "http://localhost:3000/api/weather/logs"
	
	log.Printf("Simulando envio para API -> Temp: %.1f°C | Umidade: %.1f%%", data.Temperature, data.Humidity)
	
	time.Sleep(500 * time.Millisecond) 
	
	return nil
}