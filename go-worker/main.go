// Exemplo mínimo de worker em Go que consome RabbitMQ e faz POST para API.
package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "log"
    "net/http"
    "os"

    amqp "github.com/rabbitmq/amqp091-go"
)

func failOnError(err error, msg string) {
    if err != nil {
        log.Fatalf("%s: %s", msg, err)
    }
}

func main() {
    rabbit := os.Getenv("RABBITMQ_URI")
    apiUrl := os.Getenv("API_URL")
    if rabbit == "" {
        rabbit = "amqp://guest:guest@localhost:5672/"
    }
    if apiUrl == "" {
        apiUrl = "http://localhost:3000"
    }

    conn, err := amqp.Dial(rabbit)
    failOnError(err, "Failed to connect to RabbitMQ")
    defer conn.Close()

    ch, err := conn.Channel()
    failOnError(err, "Failed to open a channel")
    defer ch.Close()

    q, err := ch.QueueDeclare(
        "weather_logs", true, false, false, false, nil,
    )
    failOnError(err, "Failed to declare a queue")

    msgs, err := ch.Consume(q.Name, "", false, false, false, false, nil)
    failOnError(err, "Failed to register a consumer")

    forever := make(chan bool)

    go func() {
        for d := range msgs {
            fmt.Printf("Received a message: %s\n", d.Body)
            // enviar para API
            resp, err := http.Post(apiUrl+"/api/weather/logs", "application/json", bytes.NewReader(d.Body))
            if err != nil {
                fmt.Println("post error:", err)
                d.Nack(false, true)
                continue
            }
            body, _ := ioutil.ReadAll(resp.Body)
            resp.Body.Close()
            fmt.Println("API response:", string(body))
            d.Ack(false)
        }
    }()

    log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
    <-forever
}
