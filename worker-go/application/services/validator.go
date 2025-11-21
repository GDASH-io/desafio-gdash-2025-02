package services

import (
	"encoding/json"
	"fmt"
	"github.com/gdash/worker-go/domain/entities"
)

// Validator valida mensagens raw recebidas do Kafka
type Validator struct{}

// NewValidator cria um novo validador
func NewValidator() *Validator {
	return &Validator{}
}

// ValidateRawMessage valida uma mensagem raw
func (v *Validator) ValidateRawMessage(data []byte) (*entities.RawReading, error) {
	var rawReading entities.RawReading
	
	if err := json.Unmarshal(data, &rawReading); err != nil {
		return nil, fmt.Errorf("erro ao fazer parse da mensagem: %w", err)
	}
	
	// Validações básicas
	if rawReading.Source == "" {
		return nil, fmt.Errorf("campo 'source' é obrigatório")
	}
	
	if rawReading.City == "" {
		return nil, fmt.Errorf("campo 'city' é obrigatório")
	}
	
	if len(rawReading.Payload) == 0 {
		return nil, fmt.Errorf("payload não pode estar vazio")
	}
	
	// Validar cada item do payload
	for i, item := range rawReading.Payload {
		if item.Timestamp == "" {
			return nil, fmt.Errorf("payload[%d]: campo 'timestamp' é obrigatório", i)
		}
	}
	
	return &rawReading, nil
}

