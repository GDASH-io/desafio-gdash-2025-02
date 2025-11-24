package client

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type WeatherClient struct {
	url string
}

func NewWeatherClient(url string) *WeatherClient {
	return &WeatherClient{url: url}
}

func (c *WeatherClient) FetchWeather() (map[string]interface{}, error) {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Get(c.url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to python service: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("python service returned status: %d", resp.StatusCode)
	}

	var data map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return data, nil
}
