package main

import (
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	amqp "github.com/streadway/amqp"
)

var AmqpUrl string
var RetryTime int64
var RabbitmqQueueName string
var BaseURL string
var ApiMasterToken string

func connectAutoRetry(retryTime int64) *amqp.Connection {
	conn, err := amqp.Dial(AmqpUrl)
	if err != nil {
		time.Sleep(time.Duration(retryTime))
		MsgOnErr(err, "fail to connect AQML, retry...")
		return connectAutoRetry(retryTime)
	}
	return conn
}

func main() {
	godotenv.Load()
	AmqpUrl = os.Getenv("AMQP_URL")
	retryTimeString := os.Getenv("AMLQP_CONNECTION_RETRY_SLEEP")
	RabbitmqQueueName = os.Getenv("RABBITMQ_QUEUE_NAME")
	BaseURL = os.Getenv("API_BASE_URL")
	ApiMasterToken = os.Getenv("API_MASTER_TOKEN")

	SetupLogFile()
	RetryTime, err := strconv.ParseInt(retryTimeString, 10, 64)
	PanicOnError(err, "falha ao obter RetryTime")
	conn := connectAutoRetry(RetryTime)

	channel, err := conn.Channel()
	PanicOnError(err, "falha ao obter canal")

	err = channel.Qos(1, 0, false)
	PanicOnError(err, "falha ao setar qos")

	q, err := channel.QueueDeclare(RabbitmqQueueName, true, false, false, false, nil)
	PanicOnError(err, "falha ao declarar fila")

	msgs, err := channel.Consume(q.Name, "", false, false, false, false, nil)
	PanicOnError(err, "falha ao consumir mensagem")

	var forever chan struct{}

	go func() {
		for d := range msgs {
			HandleMessage(d.Body)
			d.Ack(false)
		}
	}()

	<-forever
}
