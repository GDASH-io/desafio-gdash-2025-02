package consumer

import (
	"log"
	"github.com/rabbitmq/amqp091-go"
    "github.com/jp066/desafio-gdash-2025-02/services/go-worker/internal"
)


func ConnectRabbitMQ(config *internal.Config) (*amqp091.Connection, error) {
	conn, err := amqp091.Dial(config.RabbitMQ.URL)
	return conn, err
}


func ConsumeRMQ(config *internal.Config) error {
	conn, err := ConnectRabbitMQ(config)
	if err != nil {
	    return err
	}
	defer conn.Close()

	channel, err := conn.Channel() // Abrindo um canal
	if err != nil {
    	return err
	}

	defer channel.Close()

	exchangeName := config.RabbitMQ.EXCHANGE // Declarando a exchange
	err = channel.ExchangeDeclare(
		exchangeName, 
		"direct",     
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
    	return err
	}

	queue, err := channel.QueueDeclare("", true, false, false, false, nil) // Declarando a fila
	if err != nil {
    	return err
	}

	routingKeys := []string{"weather_routing_key"}
	for _, routingKey := range routingKeys {
		err = channel.QueueBind( 
			queue.Name,   
			routingKey,   
			exchangeName, 
			false,
			nil,
		)
		if err != nil {
	    	return err
		}
	}

	messages, err := channel.Consume(
		queue.Name,
		"", 
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	for msg := range messages {
		log.Printf("Mensagem recebida: %s", msg.Body)
		msg.Ack(false)
	}
	return nil
}