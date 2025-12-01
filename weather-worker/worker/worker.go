package worker

import (
	"log"
	"time"
	"weathernator/worker/api"
	"weathernator/worker/config"
	"weathernator/worker/processor"
	"weathernator/worker/rabbitmq"
)

type Worker struct {
	config    *config.Config
	processor *processor.Processor
}

func NewWorker(cfg *config.Config) *Worker {
	apiClient := api.NewClient(cfg)
	proc := processor.NewProcessor(apiClient)

	return &Worker{
		config:    cfg,
		processor: proc,
	}
}

func (w *Worker) Start() {
	w.printHeader()

	for {
		if err := w.run(); err != nil {
			log.Printf("❌ Erro no worker: %v", err)
		}

		log.Printf("⚠️  Reconectando em %v...", w.config.RetryDelay)
		time.Sleep(w.config.RetryDelay)
	}
}

func (w *Worker) run() error {
	// Conectar ao RabbitMQ
	client := rabbitmq.NewClient(w.config)
	if err := client.Connect(); err != nil {
		return err
	}
	defer client.Close()

	// Iniciar consumo de mensagens
	msgs, err := client.Consume()
	if err != nil {
		return err
	}

	log.Println("👂 Aguardando mensagens...")

	// Canal para detectar fechamento da conexão
	notifyClose := client.NotifyClose()

	// Canal para controlar o shutdown
	done := make(chan bool)

	// Processar mensagens em goroutine
	go func() {
		w.processor.ProcessMessages(msgs)
		done <- true
	}()

	// Aguardar até a conexão cair ou shutdown
	select {
	case err := <-notifyClose:
		if err != nil {
			log.Printf("⚠️  Conexão perdida: %v", err)
		}
	case <-done:
		log.Println("⚠️  Processamento de mensagens encerrado")
	}

	return nil
}

func (w *Worker) printHeader() {
	log.Println("🚀 Worker iniciado")
	log.Printf("🔗 RabbitMQ: %s", w.config.RabbitMQURL)
	log.Printf("🌐 API: %s", w.config.APIURL)
	log.Printf("📬 Queue: %s", w.config.QueueName)
	log.Println("---")
}
