package messaging

import (
	"fmt"
	"sync"
	"github.com/IBM/sarama"
)

// KafkaProducer implementa KafkaProducerRepository
type KafkaProducer struct {
	producer sarama.SyncProducer
	mu       sync.RWMutex
}

// NewKafkaProducer cria um novo producer Kafka
func NewKafkaProducer(bootstrapServers []string) (*KafkaProducer, error) {
	config := sarama.NewConfig()
	config.Version = sarama.V2_8_0_0
	config.Producer.Return.Successes = true
	config.Producer.Return.Errors = true
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5
	
	producer, err := sarama.NewSyncProducer(bootstrapServers, config)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar producer: %w", err)
	}
	
	return &KafkaProducer{
		producer: producer,
	}, nil
}

// Publish publica mensagem no tópico
func (kp *KafkaProducer) Publish(topic string, message []byte) error {
	kp.mu.Lock()
	defer kp.mu.Unlock()
	
	msg := &sarama.ProducerMessage{
		Topic: topic,
		Value: sarama.ByteEncoder(message),
	}
	
	partition, offset, err := kp.producer.SendMessage(msg)
	if err != nil {
		return fmt.Errorf("erro ao publicar mensagem: %w", err)
	}
	
	_ = partition
	_ = offset
	
	return nil
}

// Close fecha a conexão
func (kp *KafkaProducer) Close() error {
	kp.mu.Lock()
	defer kp.mu.Unlock()
	return kp.producer.Close()
}

