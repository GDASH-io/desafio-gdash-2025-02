package main

import (
    "bytes"
    "encoding/json"
    "io"
    "log"
    "net/http"
    "os"
    "time"

    amqp "github.com/rabbitmq/amqp091-go"
)

var (
    rabbitURL = getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
    apiURL    = getenv("API_URL", "http://nestjs:3000/api/weather/logs")
)

func getenv(k, d string) string {
    v := os.Getenv(k)
    if v == "" {
        return d
    }
    return v
}

func main() {
    conn, err := amqp.Dial(rabbitURL)
    if err != nil {
        log.Fatalln("Failed to connect to RabbitMQ:", err)
    }
    defer conn.Close()
    ch, err := conn.Channel()
    if err != nil {
        log.Fatalln(err)
    }
    defer ch.Close()
    q, err := ch.QueueDeclare("weather_logs", true, false, false, false, nil)
    if err != nil {
        log.Fatalln(err)
    }
    msgs, err := ch.Consume(q.Name, "", false, false, false, false, nil)
    if err != nil {
        log.Fatalln(err)
    }
    forever := make(chan bool)
    go func() {
        for d := range msgs {
            log.Println("Received a message")
            var payload map[string]interface{}
            if err := json.Unmarshal(d.Body, &payload); err != nil {
                log.Println("Invalid JSON:", err)
                d.Nack(false, false)
                continue
            }
            if postToAPI(payload) {
                d.Ack(false)
            } else {
                d.Nack(false, true) // requeue for retry
            }
        }
    }()
    log.Println("Worker started, waiting for messages...")
    <-forever
}

func postToAPI(payload map[string]interface{}) bool {
    b, _ := json.Marshal(payload)
    req, _ := http.NewRequest("POST", apiURL, io.NopCloser(bytes.NewReader(b)))
    req.Header.Set("Content-Type", "application/json")
    client := &http.Client{Timeout: 10 * time.Second}
    resp, err := client.Do(req)
    if err != nil {
        log.Println("Error posting to API:", err)
        return false
    }
    defer resp.Body.Close()
    if resp.StatusCode >= 200 && resp.StatusCode < 300 {
        log.Println("Posted to API OK")
        return true
    }
    body, _ := io.ReadAll(resp.Body)
    log.Printf("API error: %d %s\n", resp.StatusCode, string(body))
    return false
}
