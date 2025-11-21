package repositories

import "context"

// KafkaConsumerRepository interface para consumo de mensagens Kafka
type KafkaConsumerRepository interface {
	// Consume inicia consumo de mensagens do tópico
	Consume(ctx context.Context, topic string, handler func(message []byte) error) error
	
	// Close fecha a conexão
	Close() error
	
	// IsConnected verifica se está conectado
	IsConnected() bool
}

