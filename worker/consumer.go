package main

import (
    "encoding/json"
    "log"

    amqp "github.com/rabbitmq/amqp091-go"
)

func consumeMessages() error {
    conn, err := amqp.Dial(RabbitMQURL)
    if err != nil {
        return err
    }
    defer conn.Close()

    ch, err := conn.Channel()
    if err != nil {
        return err
    }
    defer ch.Close()

    _, err = ch.QueueDeclare(QueueName, true, false, false, false, nil)
    if err != nil {
        return err
    }

    msgs, err := ch.Consume(QueueName, "", false, false, false, false, nil)
    if err != nil {
        return err
    }

    log.Println("Worker aguardando mensagens na fila:", QueueName)
    for msg := range msgs {
        var w Weather
        if err := json.Unmarshal(msg.Body, &w); err != nil {
            log.Println("JSON inválido:", err)
            msg.Nack(false, false) // descarta (ou requeue=true se preferir)
            continue
        }

        if !w.IsValid() {
            log.Println("Campos obrigatórios ausentes:", string(msg.Body))
            msg.Nack(false, false)
            continue
        }

        if sendToAPI(w) {
            msg.Ack(false)
        } else {
            // Retry básico: recoloca na fila
            msg.Nack(false, true)
        }
    }
    return nil
}
