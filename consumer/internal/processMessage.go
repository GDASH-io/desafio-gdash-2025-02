package internal

import (
	"desafio-gdash-2025-02/consumer/entities"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/streadway/amqp"
)

func ProcessMessage(d amqp.Delivery, retrytracker *RetryTracker) error {
	log.Println("----------------------------------------------------------------------------")
	log.Printf("Received a message")
	log.Println("Processing the messages")

	messageId := d.MessageId
	weather := entities.WeatherModal{}
	err := json.Unmarshal(d.Body, &weather)
	if err != nil {
		log.Printf("Error unmarshaling JSON: %v", err)
		return err
	}

	statusCode, reqBody, err := MakeHttpPostRequest(os.Getenv("NESTJS_API"), "application/json", weather)

	if err != nil {
		retrytracker.HandleError(d, messageId, err)
		log.Printf("Body request response: %s", reqBody)
		log.Printf("Error sending POST request: %v", err)
		return err
	}

	if statusCode != http.StatusCreated {
		retrytracker.HandleError(d, messageId, err)
		log.Printf("Body request response: %s", reqBody)
		log.Printf("Unexpected response status: %d", statusCode)
		return err
	}

	retrytracker.MarkSuccess(messageId)
	d.Ack(false)

	log.Println("Finished processing the message")
	log.Println("----------------------------------------------------------------------------")
	return nil
}
