package main

import (
	"bytes"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Estrutura de Log (Deve refletir o payload JSON enviado pelo Python)
type WeatherLog struct {
	Timestamp       float64                `json:"timestamp"`
	Location        string                 `json:"location"`
	TemperatureC    float64                `json:"temperature_c"`
	HumidityPercent float64                `json:"humidity_percent"`
	WindSpeedKmh    float64                `json:"wind_speed_kmh"`
	Condition       string                 `json:"condition"`
	Insights        map[string]interface{} `json:"insights"`
}

// Variáveis de Ambiente
var (
	RabbitMQUser  = os.Getenv("RABBITMQ_USER")
	RabbitMQPass  = os.Getenv("RABBITMQ_PASSWORD")
	RabbitMQHost  = os.Getenv("RABBITMQ_HOST")
	RabbitMQPort  = os.Getenv("RABBITMQ_PORT")
	RabbitMQQueue = os.Getenv("RABBITMQ_QUEUE_NAME")
	NestJSAPIURL  = os.Getenv("NEST_API_URL") // Endpoint de destino no NestJS
)

// Função auxiliar para tratamento de erros
func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %v", msg, err)
	}
}

// Função para tentar reconectar ao RabbitMQ
func connectToRabbitMQ(url string) *amqp.Connection {
	for i := 0; i < 5; i++ {
		conn, err := amqp.Dial(url)
		if err == nil {
			log.Println("Conectado ao RabbitMQ com sucesso!")
			return conn
		}
		log.Printf("Falha na conexão com RabbitMQ: %v. Tentando novamente em %d segundos...", err, 5)
		time.Sleep(5 * time.Second)
	}
	log.Fatal("Falha crítica: Não foi possível conectar ao RabbitMQ. O worker será encerrado.")
	return nil
}

// Função para enviar o log para a API NestJS
func sendToNestJS(logData []byte) error {
	log.Printf("➡️ Enviando log para a API NestJS: %s", NestJSAPIURL)

	resp, err := http.Post(NestJSAPIURL, "application/json", bytes.NewBuffer(logData))
	if err != nil {
		return fmt.Errorf("erro HTTP ao enviar para NestJS: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		// Trata códigos de status que não são sucesso (ex: 400, 500)
		return fmt.Errorf("API NestJS retornou status de erro: %d", resp.StatusCode)
	}

	log.Printf("Log enviado com sucesso. Status: %d", resp.StatusCode)
	return nil
}

// Função principal de consumo
func consumeQueue(conn *amqp.Connection) {
	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir o canal")
	defer ch.Close()

	// Garante que a fila existe
	q, err := ch.QueueDeclare(
		RabbitMQQueue, // nome
		true,          // durável
		false,         // deletar quando não usado
		false,         // exclusivo
		false,         // noWait
		nil,           // args
	)
	failOnError(err, "Falha ao declarar a fila")

	msgs, err := ch.Consume(
		q.Name, // fila
		"",     // consumer
		false,  // auto-ack (usaremos ack manual para retry)
		false,  // exclusivo
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Falha ao registrar o consumidor")

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf("Mensagem recebida (%d bytes)", len(d.Body))

			// Tenta enviar para NestJS com Retry Básico
			maxRetries := 3
			for attempt := 0; attempt < maxRetries; attempt++ {
				err := sendToNestJS(d.Body)

				if err == nil {
					// Sucesso: Confirma a mensagem (ACK) e sai do loop de retry
					d.Ack(false)
					break
				}

				// Falha: Loga e tenta novamente
				log.Printf("Tentativa %d falhou: %v", attempt+1, err)
				if attempt == maxRetries-1 {
					// Última tentativa falhou: NACK, NÃO re-envia para a fila (requeue=false)
					// Se você tivesse uma DLQ configurada, ela receberia a mensagem aqui.
					d.Nack(false, false)
					log.Println("Falha após retries. Mensagem descartada.")
				} else {
					time.Sleep(2 * time.Second) // Espera antes de tentar novamente
				}
			}
		}
	}()

	log.Println("Worker Go pronto. Aguardando mensagens. Para sair, pressione CTRL+C")
	<-forever
}

func main() {
	// Inicializa os arquivos de dependência Go (necessário antes do build do Docker)
	// Para Windows/VSCode, pode ser preciso rodar `go mod tidy` antes do docker-compose up

	rabbitMQURL := fmt.Sprintf("amqp://%s:%s@%s:%s/", RabbitMQUser, RabbitMQPass, RabbitMQHost, RabbitMQPort)

	// Conecta e inicia o consumo
	conn := connectToRabbitMQ(rabbitMQURL)
	defer conn.Close()

	consumeQueue(conn)
}
