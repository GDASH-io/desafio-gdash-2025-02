package repositories

// KafkaProducerRepository interface para publicação de mensagens Kafka
type KafkaProducerRepository interface {
	// Publish publica mensagem no tópico
	Publish(topic string, message []byte) error
	
	// Close fecha a conexão
	Close() error
}

