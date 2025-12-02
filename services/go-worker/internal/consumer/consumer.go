package consumer

import (
    "encoding/json"
    "log"
    "github.com/rabbitmq/amqp091-go"
    "github.com/jp066/desafio-gdash-2025-02/services/go-worker/internal"
    "github.com/jp066/desafio-gdash-2025-02/services/go-worker/internal/sender"
)

func ConnectRabbitMQ(config *internal.Config) (*amqp091.Connection, error) {
    conn, err := amqp091.Dial(config.RabbitMQ.URL)
    return conn, err
}

type WeatherData struct {
    Temperatura        float64 `json:"temperatura"`
    Umidade            float64 `json:"umidade"`
    Vento              float64 `json:"vento"`
    Condicao           string  `json:"condicao"`
    ProbabilidadeChuva float64 `json:"probabilidade_chuva"`
	DataColeta        string  `json:"data_coleta"`
    Cidade            string  `json:"cidade"`
}

func ConsumeRMQ(config *internal.Config) error {
    conn, err := ConnectRabbitMQ(config)
    if err != nil {
        log.Printf("[ERROR] Falha ao conectar ao RabbitMQ: %v", err)
        return err
    }
    defer conn.Close()
    log.Println("[INFO] Conexão estabelecida com RabbitMQ")

    channel, err := conn.Channel()
    if err != nil {
        log.Printf("[ERROR] Falha ao abrir canal: %v", err)
        return err
    }
    defer channel.Close()
    log.Println("[INFO] Canal RabbitMQ aberto com sucesso")

    exchangeName := config.RabbitMQ.EXCHANGE
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
        log.Printf("[ERROR] Falha ao declarar exchange '%s': %v", exchangeName, err)
        return err
    }
    log.Printf("[INFO] Exchange '%s' declarado com sucesso", exchangeName)

    queue, err := channel.QueueDeclare("weather", true, false, false, false, nil)
    if err != nil {
        log.Printf("[ERROR] Falha ao declarar fila: %v", err)
        return err
    }
    log.Printf("[INFO] Fila '%s' declarada com sucesso", queue.Name)

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
            log.Printf("[ERROR] Falha ao fazer bind da fila com routing key '%s': %v", routingKey, err)
            return err
        }
        log.Printf("[INFO] Fila vinculada com routing key '%s'", routingKey)
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
        log.Printf("[ERROR] Falha ao iniciar consumo: %v", err)
        return err
    }

    log.Println("[INFO] Worker iniciado - Aguardando mensagens...")

    for msg := range messages {
        log.Printf("[INFO] Mensagem recebida da fila (tamanho: %d bytes)", len(msg.Body))
        
        var weatherData WeatherData
        if err := json.Unmarshal(msg.Body, &weatherData); err != nil {
            log.Printf("[ERROR] Falha ao decodificar JSON: %v. Mensagem rejeitada.", err)
            msg.Nack(false, false)
            continue
        }

        if weatherData.Temperatura == 0 && weatherData.Umidade == 0 {
            log.Printf("[WARN] Dados meteorológicos inválidos recebidos. Mensagem rejeitada.")
            msg.Nack(false, false)
            continue
        }

        log.Printf("[INFO] Dados decodificados: Temp=%.1f°C, Umidade=%.1f%%, Local=%s", 
            weatherData.Temperatura, weatherData.Umidade, weatherData.Cidade)

        if err := sender.SendToAPI(weatherData, config.Api.LOGS_URL); err != nil {
            log.Printf("[ERROR] Falha ao enviar dados para API: %v. Mensagem será reprocessada.", err)
            msg.Nack(false, true)
            continue
        }

        log.Println("[SUCCESS] Dados enviados para API com sucesso")
        msg.Ack(false)
    }
    return nil
}