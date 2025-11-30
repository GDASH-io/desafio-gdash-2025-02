package internal

import (
	"bytes"
	"desafio-gdash-2025-02/consumer/entities"
	"encoding/json"
	"io"
	"log"
	"net/http"
)

func MakeHttpPostRequest(url, contentType string, data entities.WeatherModal) (int, string, error) {
	body, _ := json.Marshal(data)
	payload := bytes.NewBuffer(body)

	log.Printf("Making POST request to %s", url)

	resp, err := http.Post(url, contentType, payload)
	if err != nil {
		log.Printf("Error making POST request: %v", err)
		return 0, "", err
	}

	if resp == nil {
		log.Printf("Response is nil")
		return 0, "", err
	}

	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response body: %v", err)
		return resp.StatusCode, "", err
	}

	log.Printf("POST request completed with status: %d", resp.StatusCode)
	return resp.StatusCode, string(responseBody), nil
}
