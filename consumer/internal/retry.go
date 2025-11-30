package internal

import (
	"log"
	"sync"

	"github.com/streadway/amqp"
)

type RetryTracker struct {
	mu       sync.RWMutex
	attempts map[string]int
	maxRetry int
}

func NewRetryTracker(maxRetry int) *RetryTracker {
	return &RetryTracker{
		attempts: make(map[string]int),
		maxRetry: maxRetry,
	}
}

func (rt *RetryTracker) ShouldRetry(messageID string) bool {
	rt.mu.Lock()
	defer rt.mu.Unlock()

	rt.attempts[messageID]++
	currentAttempt := rt.attempts[messageID]

	log.Printf("Message %s - Tentativa %d/%d", messageID, currentAttempt, rt.maxRetry)

	if currentAttempt >= rt.maxRetry {
		delete(rt.attempts, messageID)
		return false
	}

	return true
}

func (rt *RetryTracker) MarkSuccess(messageID string) {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	delete(rt.attempts, messageID)
}

func (rt *RetryTracker) HandleError(d amqp.Delivery, messageID string, err error) {
	if rt.ShouldRetry(messageID) {
		d.Nack(false, true)
		log.Printf("Error processing message (will retry): %v", err)
	} else {
		d.Nack(false, false)
		log.Printf("Message %s discarded after max retries: %v", messageID, err)
	}
}
