package main

import (
	"bytes"
	"log"
	"net/http"
	"time"

	"github.com/streadway/amqp"
)

// Removi a struct e os imports "fmt" e "encoding/json" que o compilador estava reclamando

func main() {
	// Espera o RabbitMQ subir
	time.Sleep(10 * time.Second)

	conn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	failOnError(err, "Falha ao conectar no RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir canal")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"weather_data", // nome da fila
		false,          // durable
		false,          // delete when unused
		false,          // exclusive
		false,          // no-wait
		nil,            // arguments
	)
	failOnError(err, "Falha ao declarar fila")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Falha ao registrar consumidor")

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf("📥 Recebido: %s", d.Body)
			sendToAPI(d.Body)
		}
	}()

	log.Printf(" [*] Aguardando mensagens. Para sair pressione CTRL+C")
	<-forever
}

func sendToAPI(jsonData []byte) {
	// URL do container do NestJS
	url := "http://nestjs-api:3000/weather"
	
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	// Adicionei tratamento de erro na criação do request
	if err != nil {
		log.Printf("❌ Erro ao criar requisição: %s", err)
		return
	}
	
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("❌ Erro ao enviar para API: %s", err)
		return
	}
	defer resp.Body.Close()
	log.Printf("📤 Enviado para API. Status: %s", resp.Status)
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}