package rabbit

import (
	"fmt"
	"os"

	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	defaultRabbitMQHost = "rabbitmq"
	defaultRabbitMQPort = "5672"
	defaultRabbitMQUser = "guest"
	defaultRabbitMQPass = "guest"
	defaultQueueName    = "weather_queue"
)

type Config struct {
	URL       string
	QueueName string
}

func GetConfig() *Config {
	url := os.Getenv("RABBITMQ_URL")
	
	if url == "" {
		host := os.Getenv("RABBITMQ_HOST")
		if host == "" {
			host = defaultRabbitMQHost
		}
		
		port := os.Getenv("RABBITMQ_PORT")
		if port == "" {
			port = defaultRabbitMQPort
		}
		
		user := os.Getenv("RABBITMQ_USER")
		if user == "" {
			user = defaultRabbitMQUser
		}
		
		pass := os.Getenv("RABBITMQ_PASSWORD")
		if pass == "" {
			pass = defaultRabbitMQPass
		}
		
		url = fmt.Sprintf("amqp://%s:%s@%s:%s/", user, pass, host, port)
	}

	queueName := os.Getenv("RABBITMQ_QUEUE")
	if queueName == "" {
		queueName = defaultQueueName
	}

	return &Config{
		URL:       url,
		QueueName: queueName,
	}
}

func Connect(url string) (*amqp.Connection, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("falha ao conectar ao RabbitMQ: %w", err)
	}

	return conn, nil
}

func DeclareQueue(ch *amqp.Channel, queueName string) error {
	_, err := ch.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return fmt.Errorf("erro ao declarar fila: %w", err)
	}

	return nil
}
