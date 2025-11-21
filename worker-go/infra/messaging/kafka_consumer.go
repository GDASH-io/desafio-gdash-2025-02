package messaging

import (
	"context"
	"fmt"
	"sync"
	"github.com/IBM/sarama"
)

// KafkaConsumer implementa KafkaConsumerRepository
type KafkaConsumer struct {
	consumerGroup sarama.ConsumerGroup
	config        *sarama.Config
	connected     bool
	mu            sync.RWMutex
}

// NewKafkaConsumer cria um novo consumer Kafka
func NewKafkaConsumer(bootstrapServers []string, groupID string) (*KafkaConsumer, error) {
	config := sarama.NewConfig()
	config.Version = sarama.V2_8_0_0
	config.Consumer.Group.Rebalance.Strategy = sarama.NewBalanceStrategyRoundRobin()
	config.Consumer.Offsets.Initial = sarama.OffsetOldest
	config.Consumer.Return.Errors = true
	
	consumerGroup, err := sarama.NewConsumerGroup(bootstrapServers, groupID, config)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar consumer group: %w", err)
	}
	
	kc := &KafkaConsumer{
		consumerGroup: consumerGroup,
		config:        config,
		connected:     true,
	}
	
	// Handler de erros
	go func() {
		for err := range consumerGroup.Errors() {
			if err != nil {
				kc.mu.Lock()
				kc.connected = false
				kc.mu.Unlock()
			}
		}
	}()
	
	return kc, nil
}

// Consume inicia consumo de mensagens
func (kc *KafkaConsumer) Consume(ctx context.Context, topic string, handler func(message []byte) error) error {
	consumerHandler := &consumerGroupHandler{
		handler: handler,
	}
	
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
			err := kc.consumerGroup.Consume(ctx, []string{topic}, consumerHandler)
			if err != nil {
				kc.mu.Lock()
				kc.connected = false
				kc.mu.Unlock()
				return fmt.Errorf("erro ao consumir mensagens: %w", err)
			}
			
			kc.mu.Lock()
			kc.connected = true
			kc.mu.Unlock()
		}
	}
}

// Close fecha a conexão
func (kc *KafkaConsumer) Close() error {
	kc.mu.Lock()
	kc.connected = false
	kc.mu.Unlock()
	return kc.consumerGroup.Close()
}

// IsConnected verifica se está conectado
func (kc *KafkaConsumer) IsConnected() bool {
	kc.mu.RLock()
	defer kc.mu.RUnlock()
	return kc.connected
}

// consumerGroupHandler implementa sarama.ConsumerGroupHandler
type consumerGroupHandler struct {
	handler func(message []byte) error
}

// Setup é chamado antes que o consumidor comece a consumir
func (h *consumerGroupHandler) Setup(sarama.ConsumerGroupSession) error {
	return nil
}

// Cleanup é chamado quando o consumidor termina
func (h *consumerGroupHandler) Cleanup(sarama.ConsumerGroupSession) error {
	return nil
}

// ConsumeClaim processa mensagens
func (h *consumerGroupHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for {
		select {
		case message := <-claim.Messages():
			if message == nil {
				return nil
			}
			
			// Processar mensagem
			if err := h.handler(message.Value); err != nil {
				// Em produção, implementar DLQ ou retry logic
				session.MarkMessage(message, "")
				continue
			}
			
			// Marcar como processada
			session.MarkMessage(message, "")
			
		case <-session.Context().Done():
			return nil
		}
	}
}

