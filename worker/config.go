package main

import "os"

var (
    RabbitMQURL = getEnv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
    QueueName   = getEnv("QUEUE_NAME", "weather")
    ApiURL      = getEnv("API_URL", "http://api:3000/api/weather/logs")
)

func getEnv(key, def string) string {
    val := os.Getenv(key)
    if val == "" {
        return def
    }
    return val
}
