package main

import (
	"bytes"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go" //biblioteca oficial do RabbitMQ para Go.
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func main() {
	// Espera o RabbitMQ subir
	time.Sleep(10 * time.Second)

	rabbitUser := os.Getenv("RABBITMQ_USER")
    rabbitPass := os.Getenv("RABBITMQ_PASSWORD")

	rabbitURL := "amqp://" + rabbitUser + ":" + rabbitPass + "@rabbitmq:5672/"

	conn, err := amqp.Dial(rabbitURL)
	failOnError(err, "Falha ao conectar no RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir canal")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"weather_data", // nome da fila
		true,           // durable
		false,          // delete when unused
		false,          // exclusive
		false,          // no-wait
		nil,            // arguments
	)
	failOnError(err, "Falha ao declarar fila")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack (confirma recebimento automaticamente)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Falha ao registrar consumidor")

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			log.Printf("Mensagem recebida: %s", d.Body)
			
			// Enviar para API NestJS
			resp, err := http.Post("http://api-nestjs:3000/weather/logs", "application/json", bytes.NewBuffer(d.Body))
			
			if err != nil {
				log.Printf("Erro ao enviar para API: %s", err)
			} else {
				log.Printf("Enviado para API. Status: %s", resp.Status)
				resp.Body.Close()
			}
		}
	}()

	log.Printf(" [*] Aguardando mensagens. Para sair pressione CTRL+C")
	<-forever
}