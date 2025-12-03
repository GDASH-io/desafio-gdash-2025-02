package main

import (
    "encoding/json"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/streadway/amqp"
)

func main() {
    rabbitURL := os.Getenv("RABBITMQ_URL")

    var conn *amqp.Connection
    var err error

    // Retry loop
    for i := 0; i < 10; i++ {
        conn, err = amqp.Dial(rabbitURL)
        if err == nil {
            break
        }
        log.Println("RabbitMQ não disponível, tentando novamente em 3s...")
        time.Sleep(3 * time.Second)
    }

    if err != nil {
        panic(err)
    }

    ch, _ := conn.Channel()
    ch.QueueDeclare("weather", false, false, false, false, nil)

    http.HandleFunc("/publish", func(w http.ResponseWriter, r *http.Request) {
        var body map[string]interface{}
        json.NewDecoder(r.Body).Decode(&body)

        bytes, _ := json.Marshal(body)
        ch.Publish("", "weather", false, false, amqp.Publishing{
            ContentType: "application/json",
            Body:        bytes,
        })

        w.Write([]byte("ok"))
    })

    log.Println("GO Producer online")
    http.ListenAndServe(":8080", nil)
}
