package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Consumer struct {
	conn      *amqp.Connection
	channel   *amqp.Channel
	queueName string
	apiClient *APIClient
}

func NewConsumer(rabbitmqURL, queueName string, apiClient *APIClient) (*Consumer, error) {
	conn, err := amqp.Dial(rabbitmqURL)
	if err != nil {
		return nil, fmt.Errorf("erro ao conectar ao RabbitMQ: %w", err)
	}

	channel, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("erro ao abrir canal: %w", err)
	}

	_, err = channel.QueueDeclare(
		queueName,
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		channel.Close()
		conn.Close()
		return nil, fmt.Errorf("erro ao declarar fila: %w", err)
	}

	return &Consumer{
		conn:      conn,
		channel:   channel,
		queueName: queueName,
		apiClient: apiClient,
	}, nil
}

func (c *Consumer) Start() error {
	msgs, err := c.channel.Consume(
		c.queueName,
		"",    // consumer
		false, // auto-ack
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)
	if err != nil {
		return fmt.Errorf("erro ao registrar consumidor: %w", err)
	}

	log.Printf("Worker iniciado. Aguardando mensagens na fila '%s'...", c.queueName)

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			if err := c.processMessage(d); err != nil {
				log.Printf("Erro ao processar mensagem: %v", err)
				// NACK - rejeita e reenvia para a fila
				d.Nack(false, true)
			} else {
				// ACK - confirma processamento
				d.Ack(false)
			}
		}
	}()

	<-forever
	return nil
}

func (c *Consumer) processMessage(d amqp.Delivery) error {
	log.Printf("Mensagem recebida: %s", d.Body)

	var weatherData map[string]interface{}
	if err := json.Unmarshal(d.Body, &weatherData); err != nil {
		return fmt.Errorf("erro ao deserializar JSON: %w", err)
	}

	// Validar dados obrigatórios
	if err := c.validateWeatherData(weatherData); err != nil {
		return fmt.Errorf("dados inválidos: %w", err)
	}

	// Transformar timestamp se necessário
	if timestampStr, ok := weatherData["timestamp"].(string); ok {
		// Tentar diferentes formatos de data
		formats := []string{
			time.RFC3339,
			"2006-01-02T15:04:05Z07:00",
			"2006-01-02T15:04:05",
			"2006-01-02T15:04:05Z",
			"2006-01-02 15:04:05",
		}
		
		var timestamp time.Time
		parsed := false
		
		// Carregar timezone do Brasil
		brazilLocation, locErr := time.LoadLocation("America/Sao_Paulo")
		if locErr != nil {
			brazilLocation = time.UTC
		}
		
		// Tentar parsear primeiro assumindo que está no horário do Brasil (formato mais comum do producer)
		// O producer envia timestamps no formato "2025-12-04T01:45:24" que devem ser interpretados como horário do Brasil
		if brazilTime, parseErr := time.ParseInLocation("2006-01-02T15:04:05", timestampStr, brazilLocation); parseErr == nil {
			// Parseado com sucesso no horário do Brasil
			timestamp = brazilTime
			parsed = true
		} else {
			// Se falhar, tentar outros formatos
			for _, format := range formats {
				if parsedTime, parseErr := time.Parse(format, timestampStr); parseErr == nil {
					timestamp = parsedTime
					parsed = true
					// Se foi parseado como UTC, converter para Brasil
					if timestamp.Location() == time.UTC {
						timestamp = timestamp.In(brazilLocation)
					}
					break
				}
			}
		}
		
		if !parsed {
			// Usar timestamp atual no horário do Brasil se não conseguir parsear
			timestamp = time.Now().In(brazilLocation)
		}
		
		// O timestamp agora está no horário do Brasil
		// Converter para UTC para salvar no MongoDB (ex: 01:45 BRT = 04:45 UTC)
		utcTimestamp := timestamp.UTC()
		weatherData["timestamp"] = utcTimestamp.Format(time.RFC3339)
	} else {
		// Se não houver timestamp, usar o atual no horário do Brasil
		brazilLocation, locErr := time.LoadLocation("America/Sao_Paulo")
		if locErr != nil {
			brazilLocation = time.UTC
		}
		weatherData["timestamp"] = time.Now().In(brazilLocation).Format(time.RFC3339)
	}

	// Enviar para API NestJS
	maxRetries := 3
	for i := 0; i < maxRetries; i++ {
		if err := c.apiClient.SendWeatherData(weatherData); err != nil {
			log.Printf("Tentativa %d/%d falhou: %v", i+1, maxRetries, err)
			if i < maxRetries-1 {
				time.Sleep(time.Duration(i+1) * time.Second)
				continue
			}
			return err
		}
		log.Printf("Dados processados e enviados com sucesso")
		return nil
	}

	return fmt.Errorf("falha após %d tentativas", maxRetries)
}

func (c *Consumer) validateWeatherData(data map[string]interface{}) error {
	requiredFields := []string{"timestamp", "location", "latitude", "longitude", "temperature", "humidity", "windSpeed", "condition", "rainProbability"}

	for _, field := range requiredFields {
		if _, ok := data[field]; !ok {
			return fmt.Errorf("campo obrigatório ausente: %s", field)
		}
	}

	return nil
}

func (c *Consumer) Close() {
	if c.channel != nil {
		c.channel.Close()
	}
	if c.conn != nil {
		c.conn.Close()
	}
	log.Println("Conexão com RabbitMQ fechada")
}

