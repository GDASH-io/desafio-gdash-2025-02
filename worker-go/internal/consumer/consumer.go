package consumer

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
	"worker-go/internal/config"
	"worker-go/internal/models"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Consumer struct {
	config     *config.Config
	conn       *amqp.Connection
	channel    *amqp.Channel
	httpClient *http.Client
}

func NewConsumer(cfg *config.Config) *Consumer {
	return &Consumer{
		config: cfg,
		httpClient: &http.Client{
			Timeout: cfg.APITimeout,
		},
	}
}

func (c *Consumer) Connect() error {
	var err error

	log.Printf("🔌 Conectando ao RabbitMQ: %s", c.config.RabbitMQHost)

	maxRetries := 5
	for i := 1; i <= maxRetries; i++ {
		c.conn, err = amqp.Dial(c.config.RabbitMQURL())
		if err == nil {
			break
		}

		log.Printf("⚠️  Tentativa %d/%d falhou: %v", i, maxRetries, err)
		if i < maxRetries {
			time.Sleep(5 * time.Second)
		}
	}

	if err != nil {
		return fmt.Errorf("erro ao conectar ao RabbitMQ após %d tentativas: %w", maxRetries, err)
	}

	log.Println("✅ Conectado ao RabbitMQ")

	c.channel, err = c.conn.Channel()
	if err != nil {
		return fmt.Errorf("erro ao abrir canal: %w", err)
	}

	log.Println("✅ Canal aberto")

	_, err = c.channel.QueueDeclare(
		c.config.RabbitMQQueue,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return fmt.Errorf("erro ao declarar fila: %w", err)
	}

	log.Printf("✅ Fila '%s' declarada", c.config.RabbitMQQueue)

	err = c.channel.Qos(
		1,
		0,
		false,
	)
	if err != nil {
		return fmt.Errorf("erro ao configurar QoS: %w", err)
	}

	log.Println("✅ QoS configurado (1 mensagem por vez)")

	return nil
}

func (c *Consumer) Close() {
	if c.channel != nil {
		c.channel.Close()
		log.Println("📪 Canal fechado")
	}
	if c.conn != nil {
		c.conn.Close()
		log.Println("🔌 Conexão fechada")
	}
}
func (c *Consumer) sendToNestAPI(data *models.WeatherData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("erro ao serializar dados: %w", err)
	}

	log.Printf("📤 Enviando para API: %s", c.config.APIURL)
	log.Printf("📦 Payload: %s", string(jsonData))

	var lastErr error
	for attempt := 1; attempt <= c.config.MaxRetries; attempt++ {
		resp, err := c.httpClient.Post(
			c.config.APIURL,
			"application/json",
			bytes.NewBuffer(jsonData),
		)

		if err != nil {
			lastErr = fmt.Errorf("tentativa %d/%d - erro na requisição: %w",
				attempt, c.config.MaxRetries, err)
			log.Printf("⚠️  %v", lastErr)

			if attempt < c.config.MaxRetries {
				log.Printf("⏳ Aguardando %v antes de tentar novamente...", c.config.RetryDelay)
				time.Sleep(c.config.RetryDelay)
				continue
			}
			return lastErr
		}

		defer resp.Body.Close()
		body, _ := io.ReadAll(resp.Body)


		if resp.StatusCode == http.StatusCreated || resp.StatusCode == http.StatusOK {
			log.Printf("✅ Dados enviados com sucesso para NestJS (Status: %d)", resp.StatusCode)
			log.Printf("📥 Resposta: %s", string(body))
			return nil
		}


		lastErr = fmt.Errorf("tentativa %d/%d - API retornou status %d: %s",
			attempt, c.config.MaxRetries, resp.StatusCode, string(body))
		log.Printf("❌ %v", lastErr)

		if attempt < c.config.MaxRetries {
			log.Printf("⏳ Aguardando %v antes de tentar novamente...", c.config.RetryDelay)
			time.Sleep(c.config.RetryDelay)
		}
	}

	return fmt.Errorf("falha após %d tentativas: %w", c.config.MaxRetries, lastErr)
}

func (c *Consumer) ProcessMessage(delivery amqp.Delivery) error {
	log.Printf("📨 Mensagem recebida (ID: %s)", delivery.MessageId)
	log.Printf("📏 Tamanho: %d bytes", len(delivery.Body))
	log.Printf("📄 JSON RAW: %s", string(delivery.Body))

	weather, err := models.UnmarshalWeatherData(delivery.Body)
	if err != nil {
		log.Printf("❌ Erro ao deserializar: %v", err)
		return fmt.Errorf("deserialização falhou: %w", err)
	}

	log.Printf("📊 Dados recebidos: %s", weather.String())

	if err := weather.IsValid(); err != nil {
		log.Printf("❌ Validação falhou: %v", err)
		return fmt.Errorf("validação falhou: %w", err)
	}

	log.Println("✅ Dados válidos")

	weather.Normalize()

	if err := c.sendToNestAPI(weather); err != nil {
		log.Printf("❌ Erro ao enviar para API: %v", err)
		return err
	}

	log.Println("✅ Mensagem processada com sucesso")

	return nil
}

func (c *Consumer) Start(handler func(amqp.Delivery) error) error {
	msgs, err := c.channel.Consume(
		c.config.RabbitMQQueue,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return fmt.Errorf("erro ao registrar consumidor: %w", err)
	}

	log.Printf("👂 Aguardando mensagens na fila '%s'...\n", c.config.RabbitMQQueue)
	log.Println("⌨️  Pressione CTRL+C para parar")
	log.Println("---")

	forever := make(chan bool)

	go func() {
		for delivery := range msgs {
	
			err := handler(delivery)

			if err != nil {
				log.Printf("❌ Erro ao processar: %v", err)

		
				if nackErr := delivery.Nack(false, true); nackErr != nil {
					log.Printf("❌ Erro ao enviar NACK: %v", nackErr)
				} else {
					log.Println("🔄 Mensagem devolvida para a fila (NACK)")
				}
			} else {
				if ackErr := delivery.Ack(false); ackErr != nil {
					log.Printf("❌ Erro ao enviar ACK: %v", ackErr)
				} else {
					log.Println("✅ Mensagem confirmada (ACK)")
				}
			}

			log.Println("---")
		}
	}()

	<-forever

	return nil
}