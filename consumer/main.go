package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"desafio-gdash-2025-02/consumer/internal"

	"github.com/joho/godotenv"
	"github.com/streadway/amqp"
)

func init() {
	godotenv.Load(".env")
}

func main() {

	// Estabelecer conexão com RabbitMQ
	conn, err := amqp.Dial(os.Getenv("RABBITMQ_URL"))
	if err != nil {
		log.Fatalf("failed to connect to RabbitMQ: %v", err)
	}

	defer conn.Close()

	ch, err := conn.Channel()

	if err != nil {
		log.Fatalf("failed to open a channel: %v", err)
	}
	defer ch.Close()

	log.Println("connected to RabbitMQ")

	q, err := ch.QueueDeclare(
		os.Getenv("QUEUE_NAME"),
		false,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		log.Fatalf("failed to declare a queue: %v", err)
	}

	// Consumir mensagens da fila
	msgs, err := ch.Consume(
		q.Name,
		"",
		false,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		log.Fatalf("failed to register a consumer: %v", err)
	}

	// Canal para capturar sinais de interrupção (CTRL+C)
	sigchain := make(chan os.Signal, 1)
	signal.Notify(sigchain, syscall.SIGINT, syscall.SIGTERM)

	// Inicializar o rastreador de tentativas
	retryTracker := internal.NewRetryTracker(3)

	// Processar mensagens em uma goroutine separada
	go processMessages(msgs, retryTracker)

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-sigchain

	log.Printf("interrupted, shutting down")

}

func processMessages(msgs <-chan amqp.Delivery, retryTracker *internal.RetryTracker) {
	for d := range msgs {
		err := internal.ProcessMessage(d, retryTracker)
		if err != nil {
			continue
		}
	}
}
