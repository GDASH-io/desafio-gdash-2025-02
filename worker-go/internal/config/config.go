package config

import (
	"os"
	"strconv"
	"time"
)

// Config contém todas as configurações do worker
type Config struct {
	// Kafka
	KafkaBootstrapServers string
	KafkaTopicRaw         string
	KafkaTopicProcessed   string
	KafkaGroupID          string

	// API NestJS
	APIURL          string
	APITimeout      time.Duration
	APIMaxRetries   int

	// Worker
	WorkerMaxRetries        int
	WorkerBatchSize         int
	WorkerProcessingInterval time.Duration

	// Healthcheck
	HealthcheckPort int

	// Logging
	LogLevel  string
	LogFormat string
}

// Load carrega configurações das variáveis de ambiente
func Load() *Config {
	apiTimeoutSeconds, _ := strconv.Atoi(getEnv("API_TIMEOUT_SECONDS", "10"))
	apiMaxRetries, _ := strconv.Atoi(getEnv("API_MAX_RETRIES", "3"))
	workerMaxRetries, _ := strconv.Atoi(getEnv("WORKER_MAX_RETRIES", "3"))
	workerBatchSize, _ := strconv.Atoi(getEnv("WORKER_BATCH_SIZE", "10"))
	processingIntervalMs, _ := strconv.Atoi(getEnv("WORKER_PROCESSING_INTERVAL_MS", "1000"))
	healthcheckPort, _ := strconv.Atoi(getEnv("HEALTHCHECK_PORT", "8081"))

	return &Config{
		KafkaBootstrapServers: getEnv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9093"),
		KafkaTopicRaw:         getEnv("KAFKA_TOPIC_RAW", "ana.raw.readings"),
		KafkaTopicProcessed:   getEnv("KAFKA_TOPIC_PROCESSED", "ana.processed.readings"),
		KafkaGroupID:          getEnv("KAFKA_GROUP_ID", "gdash-worker-group"),
		APIURL:                getEnv("API_URL", "http://api:3000"),
		APITimeout:            time.Duration(apiTimeoutSeconds) * time.Second,
		APIMaxRetries:         apiMaxRetries,
		WorkerMaxRetries:      workerMaxRetries,
		WorkerBatchSize:       workerBatchSize,
		WorkerProcessingInterval: time.Duration(processingIntervalMs) * time.Millisecond,
		HealthcheckPort:       healthcheckPort,
		LogLevel:              getEnv("LOG_LEVEL", "INFO"),
		LogFormat:             getEnv("LOG_FORMAT", "json"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

