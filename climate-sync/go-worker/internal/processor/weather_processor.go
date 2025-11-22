package processor

import (
	"context"
	"encoding/json"
	"log"
)

type WeatherProcessor struct{}

func NewWeatherProcessor() *WeatherProcessor {
	return &WeatherProcessor{}
}

func (p *WeatherProcessor) Handle(ctx context.Context, data map[string]interface{}) {
	jsonData, _ := json.MarshalIndent(data, "", "  ")
	log.Println("🌦️ Received weather payload:")
	log.Println(string(jsonData))
}
