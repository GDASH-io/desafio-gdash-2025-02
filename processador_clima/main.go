package main

import (
	"bytes"
	"log"
	"net/http"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

const urlRabbit = "amqp://guest:guest@localhost:5672/"
const nomeFila = "weather_data"
const urlAPI = "http://localhost:3000/weather"

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

	// --- CORREÇÃO 1: Hífen, não Underline ---
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("A API parece estar desligada: %s", err)
		return false
	}
	defer resp.Body.Close()

	if resp.StatusCode == 201 || resp.StatusCode == 200 {
		log.Printf("Sucesso! API respondeu: %s", resp.Status)
		return true
	} else {
		log.Printf("API rejeitou dados: %s", resp.Status)
		return false
	}
}

func main() {
	conn, err := amqp.Dial(urlRabbit)
	failOnError(err, "Falha ao conectar no RabbitMQ")
	defer conn.Close()

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
		false,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Falha ao registrar consumidor")

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			log.Printf("Processando mensagem...")

			sucesso := enviarParaAPI(d.Body)

			if sucesso {

				d.Ack(false)
			} else {
				log.Printf("Falha ao entrega. Devolvendo para a fila...")
				time.Sleep(2 * time.Second)
				d.Nack(false, true)
			}
		}
	}()

	log.Printf("Worker Go rodando! Conectado em %s e enviando para %s", nomeFila, urlAPI)

	<-forever
}
