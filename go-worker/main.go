package main

import (
	"bytes"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	amqp "github.com/rabbitmq/amqp091-go"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Nao foi possivel encontrar o arquivo .env. ")
	}

	RabbitMQURL := os.Getenv("RABBITMQ_URL")
	QueueName := os.Getenv("QUEUE_NAME")
	NestAPIURL := os.Getenv("NESTJS_API_URL")

	conn, err := amqp.Dial(RabbitMQURL)
	failOnError(err, "Falha ao conectar ao RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir um canal")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		QueueName, // name
		false,     // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	failOnError(err, "Falha ao declarar a fila")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Falha ao registrar um consumidor")

	var forever chan struct{}

	go func() {
		for d := range msgs {
			log.Printf("Recebido da fila: %s", d.Body)

			resp, err := http.Post(NestAPIURL, "application/json", bytes.NewBuffer(d.Body))
			if err != nil {
				log.Printf("Erro ao enviar para a API NestJS: %s", err)
				continue
			}
			defer resp.Body.Close()
			log.Printf("API NestJS respondeu com status: %s", resp.Status)
		}
	}()

	log.Printf(" [*] Aguardando mensagens. Para sair, pressione CTRL+C")
	<-forever
}