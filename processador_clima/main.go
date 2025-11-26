package main

import (
	"bytes"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Função auxiliar para ler do Docker ou usar padrão
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

var urlRabbit = getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
var nomeFila = "weather_data"
var urlAPI = getEnv("API_URL", "http://localhost:3000/weather")

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func enviarParaAPI(jsonBody []byte) bool {
	req, err := http.NewRequest("POST", urlAPI, bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Printf("Erro ao criar requisições: %s", err)
		return false
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("A API parece estar desligada (%s): %s", urlAPI, err)
		return false
	}
	defer resp.Body.Close()

	if resp.StatusCode == 201 || resp.StatusCode == 200 {
		log.Printf(" Sucesso! API respondeu: %s", resp.Status)
		return true
	} else {
		log.Printf(" API rejeitou dados: %s", resp.Status)
		return false
	}
}

func main() {
	// Loop de conexão persistente (Retry infinito)
	var conn *amqp.Connection
	var err error

	for {
		conn, err = amqp.Dial(urlRabbit)
		if err == nil {
			break
		}
		log.Printf(" RabbitMQ indisponível (%s). Tentando em 5s...", urlRabbit)
		time.Sleep(5 * time.Second)
	}
	defer conn.Close()
	log.Printf(" Conectado ao RabbitMQ!")

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir canal")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		nomeFila,
		true,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Falha ao declarar fila")

	msgs, err := ch.Consume(
		q.Name,
		"",
		false, // Auto-Ack FALSE (Manual)
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Falha ao registrar consumidor")

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			log.Printf(" Processando mensagem...")

			sucesso := enviarParaAPI(d.Body)

			if sucesso {
				d.Ack(false)
			} else {
				log.Printf(" Falha na entrega. Devolvendo para a fila...")
				time.Sleep(2 * time.Second)
				d.Nack(false, true)
			}
		}
	}()

	log.Printf(" Worker Go rodando! Lendo de %s e enviando para %s", nomeFila, urlAPI)

	<-forever
}
