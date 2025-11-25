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
        return err
    }
    defer conn.Close()

    channel, err := conn.Channel()
    if err != nil {
        return err
    }
    defer channel.Close()

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
        return err
    }

    queue, err := channel.QueueDeclare("weather", true, false, false, false, nil)
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
        var weatherData WeatherData
        if err := json.Unmarshal(msg.Body, &weatherData); err != nil {
            log.Printf("Erro ao decodificar a mensagem: %s", err)
            msg.Nack(false, false)
            continue
        }

        if err := sender.SendToAPI(weatherData, config.Api.LOGS_URL); err != nil {
            log.Printf("Erro ao enviar dados para a API: %s", err)
            msg.Nack(false, true)
            continue
        }

        log.Printf("Mensagem recebida: %s", msg.Body)
        msg.Ack(false)
    }
    return nil
}