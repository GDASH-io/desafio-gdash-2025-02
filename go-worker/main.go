package main

import (
	"os"

	"go-worker/rabbit"
	"go-worker/weather"
)

func main() {
	logger := NewLogger()
	logger.LogInfo("🚀 Iniciando Go Worker para RabbitMQ")

	config := rabbit.GetConfig()
	logger.LogInfo("⚙️  Configurações:")
	logger.LogInfo("   RabbitMQ URL: %s", config.URL)
	logger.LogInfo("   Queue Name: %s", config.QueueName)

	logger.LogInfo("🔌 Conectando ao RabbitMQ...")
	conn, err := rabbit.Connect(config.URL)
	if err != nil {
		logger.LogError("❌ %v", err)
		os.Exit(1)
	}
	defer conn.Close()

	logger.LogSuccess("✅ Conectado ao RabbitMQ com sucesso")

	sender := weather.NewSender(logger)

	messageHandler := func(body []byte) error {
		return rabbit.ProcessWeatherMessage(body, sender, logger)
	}

	consumer, err := rabbit.NewConsumer(conn, config.QueueName, messageHandler, logger)
	if err != nil {
		logger.LogError("❌ Erro ao criar consumer: %v", err)
		os.Exit(1)
	}
	defer consumer.Close()

	logger.LogInfo("👂 Aguardando mensagens da fila '%s'. Para sair pressione CTRL+C", config.QueueName)

	if err := consumer.Start(); err != nil {
		logger.LogError("❌ Erro ao consumir mensagens: %v", err)
		os.Exit(1)
	}
}
