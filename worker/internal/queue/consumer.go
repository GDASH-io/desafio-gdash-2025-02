package queue

import (
	"encoding/json"
	"log"
	"worker/internal/api"
	"worker/internal/config"
	"worker/internal/domain"

	amqp "github.com/rabbitmq/amqp091-go"
)

func StartConsumer(cfg *config.Config, apiClient *api.Client) {
	conn, err := amqp.Dial(cfg.RabbitMQURL)
	if err != nil {
		log.Fatalf("Falha ao conectar no RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Falha ao abrir canal: %v", err)
	}
	defer ch.Close()

	// Garante que a fila existe
	q, err := ch.QueueDeclare(
		cfg.QueueName, // name
		true,          // durable
		false,         // delete when unused
		false,         // exclusive
		false,         // no-wait
		nil,           // arguments
	)
	if err != nil {
		log.Fatalf("Falha ao declarar fila: %v", err)
	}

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack (Vamos confirmar manualmente após processar)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		log.Fatalf("Falha ao registrar consumidor: %v", err)
	}

	log.Println(" [*] Aguardando mensagens. Para sair pressione CTRL+C")

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf(" [x] Recebido: %s", d.Body)

			var weather domain.WeatherData
			if err := json.Unmarshal(d.Body, &weather); err != nil {
				log.Printf("Erro ao decodificar JSON: %v", err)
				d.Nack(false, false) // Rejeita a mensagem (formato inválido)
				continue
			}

			// Envia para a API NestJS
			if err := apiClient.SendToBackend(weather); err != nil {
				log.Printf("Erro ao enviar para API: %v", err)
				// Se a API falhar, podemos dar Nack com requeue=true para tentar depois
                // Para este teste, vamos apenas logar.
			}

			// Confirma processamento (Ack)
			d.Ack(false)
		}
	}()

	<-forever
}