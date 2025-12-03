package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "log"
    "net/http"

    amqp "github.com/rabbitmq/amqp091-go"
)

// Dados recebidos do Python
type Weather struct {
    Timestamp     string  `json:"timestamp"`
    Temperature   float64 `json:"temperature"`
    WindSpeed     float64 `json:"wind_speed"`
    WindDirection float64 `json:"wind_direction"`
    WeatherCode   int     `json:"weather_code"`
}

// DTO que será enviado para o NestJS (formato esperado pelo Zod)
type ClimateDTO struct {
    TimeStamp     string  `json:"timeStamp"`
    Temperature   float64 `json:"temperature"`
    WindSpeed     float64 `json:"windSpeed"`
    WindDirection string  `json:"windDirection"`
    WeatherCode   string  `json:"weatherCode"`
}

func main() {
    conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
    if err != nil {
        log.Fatalf("Failed to connect to RabbitMQ: %s", err)
    }
    defer conn.Close()

    ch, err := conn.Channel()
    if err != nil {
        log.Fatalf("Failed to open a channel: %s", err)
    }
    defer ch.Close()

    msgs, err := ch.Consume(
        "weather_queue",
        "",
        true,
        false,
        false,
        false,
        nil,
    )

    if err != nil {
        log.Fatalf("Failed to register consumer: %s", err)
    }

    fmt.Println("Worker Go está ouvindo mensagens...")

    forever := make(chan bool)

    go func() {
        for msg := range msgs {

            var data Weather
            json.Unmarshal(msg.Body, &data)

            fmt.Println("📥 Recebido do Python:")
            fmt.Printf("%+v\n\n", data)

            // Converte para o formato do NestJS
            dto := ClimateDTO{
                TimeStamp:     data.Timestamp,
                Temperature:   data.Temperature,
                WindSpeed:     data.WindSpeed,
                WindDirection: fmt.Sprintf("%v", data.WindDirection),
                WeatherCode:   fmt.Sprintf("%v", data.WeatherCode),
            }

            // Envia para a API
            sendToAPI(dto)
        }
    }()

    <-forever
}

func sendToAPI(dto ClimateDTO) {
    url := "http://localhost:3333/climate"

    jsonData, err := json.Marshal(dto)
    if err != nil {
        log.Println("❌ Erro ao converter DTO para JSON:", err)
        return
    }

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    if err != nil {
        log.Println("❌ Erro ao criar requisição HTTP:", err)
        return
    }

    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        log.Println("❌ Erro ao enviar requisição:", err)
        return
    }
    defer resp.Body.Close()

    fmt.Println("➡️  Enviado para API:", resp.Status)
}
