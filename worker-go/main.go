package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	queueName      = "weather"
	// maxRetries define o número máximo de tentativas para enviar mensagem ao backend.
	// Escolhemos 3 tentativas como balanceamento entre:
	// - Resiliência: permite recuperação de falhas temporárias (rede, timeout, 5xx)
	// - Performance: evita espera excessiva em erros permanentes (4xx, JSON inválido)
	// - Recursos: não sobrecarrega o backend com requisições repetidas desnecessariamente
	maxRetries = 3
	// initialBackoff define o tempo inicial de espera entre retries.
	// Usamos backoff exponencial (1s, 2s, 4s) para:
	// - Dar tempo ao backend se estiver temporariamente sobrecarregado
	// - Reduzir carga em caso de problemas de rede transitórios
	// - Evitar "thundering herd" quando múltiplos workers tentam simultaneamente
	initialBackoff = 1 * time.Second
)

// logStructured cria um log estruturado no formato JSON
func logStructured(level, message string, fields map[string]interface{}) {
	timestamp := time.Now().UTC().Format(time.RFC3339)
	logData := map[string]interface{}{
		"timestamp": timestamp,
		"level":     strings.ToUpper(level),
		"service":   "worker",
		"message":   message,
	}
	
	// Adicionar campos extras
	for k, v := range fields {
		logData[k] = v
	}
	
	// Converter para JSON
	jsonData, err := json.Marshal(logData)
	if err != nil {
		// Fallback para log simples se JSON falhar
		log.Printf("[worker] [%s] %s", level, message)
		return
	}
	
	// Usar log padrão com JSON
	log.Printf("[worker] %s", string(jsonData))
}

// logInfo cria log de informação estruturado
func logInfo(message string, fields map[string]interface{}) {
	logStructured("info", message, fields)
}

// logError cria log de erro estruturado
func logError(message string, err error, fields map[string]interface{}) {
	if fields == nil {
		fields = make(map[string]interface{})
	}
	if err != nil {
		fields["error"] = err.Error()
	}
	logStructured("error", message, fields)
}

// logWarn cria log de aviso estruturado
func logWarn(message string, fields map[string]interface{}) {
	logStructured("warn", message, fields)
}

// logDebug cria log de debug estruturado
func logDebug(message string, fields map[string]interface{}) {
	if os.Getenv("LOG_LEVEL") == "debug" {
		logStructured("debug", message, fields)
	}
}

var (
	rabbitmqURL string
	backendURL  string
	httpClient  *http.Client
)

func init() {
	// Tentar carregar .env da raiz do projeto (para desenvolvimento local)
	// No Docker, as variáveis já estarão disponíveis via env_file
	envPath := filepath.Join("..", ".env")
	if _, err := os.Stat(envPath); err == nil {
		if err := godotenv.Load(envPath); err != nil {
			log.Printf("[worker] Warning: failed to load .env file: %v", err)
		} else {
			log.Printf("[worker] Loaded .env from %s", envPath)
		}
	} else {
		// Tentar também .env no diretório atual
		if err := godotenv.Load(); err == nil {
			log.Printf("[worker] Loaded .env from current directory")
		}
	}

	// Ler variáveis de ambiente
	rabbitmqURL = os.Getenv("RABBITMQ_URL")
	if rabbitmqURL == "" {
		log.Fatal("[worker] RABBITMQ_URL environment variable is required")
	}

	// Backend URL - usar BACKEND_URL do env ou padrão
	backendURL = os.Getenv("BACKEND_URL")
	if backendURL == "" {
		backendURL = "http://backend:3000"
	}

	// Detectar se está rodando localmente (fora do Docker)
	isLocal := isRunningLocally()
	
	// Garantir protocolos antes de verificar e ajustar
	// RabbitMQ URL geralmente já vem com protocolo (amqp://, amqps://), mas vamos garantir
	// Backend URL precisa garantir protocolo
	backendURL = ensureProtocol(backendURL)
	
	// Ajustar RabbitMQ URL apenas se for URL Docker interna (ex: rabbitmq:5672)
	// Não ajustar URLs externas (ex: amqps://host.cloudamqp.com)
	if isLocal && isDockerInternalURL(rabbitmqURL) {
		rabbitmqURL = adjustURLForLocal(rabbitmqURL, "rabbitmq", "localhost")
		log.Printf("[worker] Detected local execution, adjusted RABBITMQ_URL to localhost")
	}
	
	// Ajustar backend URL apenas se for URL Docker interna (ex: backend:3000)
	// NUNCA ajustar URLs de produção (que contêm domínios externos como .railway.app, .com, etc)
	if isLocal && isDockerInternalURL(backendURL) {
		backendURL = adjustURLForLocal(backendURL, "backend", "localhost")
		// Garantir protocolo novamente após ajuste
		backendURL = ensureProtocol(backendURL)
		log.Printf("[worker] Detected local execution, adjusted BACKEND_URL to localhost")
	}

	// Remover barra final se existir antes de adicionar o path
	backendURL = strings.TrimSuffix(backendURL, "/")
	backendURL = backendURL + "/weather/logs"

	// HTTP client com timeout
	httpClient = &http.Client{
		Timeout: 10 * time.Second,
	}

	logInfo("Worker initialized", map[string]interface{}{
		"operation":   "init",
		"rabbitmq_url": rabbitmqURL,
		"backend_url": backendURL,
		"endpoint":    "/weather/logs",
		"full_url":    backendURL,
	})
}

// isRunningLocally verifica se está rodando fora do Docker
func isRunningLocally() bool {
	// Verificar se o hostname "rabbitmq" pode ser resolvido
	// Se não conseguir, provavelmente está rodando localmente
	_, err := net.LookupHost("rabbitmq")
	return err != nil
}

// isDockerInternalURL verifica se a URL é uma URL Docker interna (ex: backend:3000, rabbitmq:5672)
// Retorna true apenas para URLs que não são domínios externos
func isDockerInternalURL(url string) bool {
	// Exemplos de URLs Docker internas (retornar true):
	//   - http://backend:3000
	//   - backend:3000
	//   - http://rabbitmq:5672
	//   - amqp://rabbitmq:5672
	// Exemplos de URLs externas (retornar false - NÃO ajustar):
	//   - https://backend.example.com
	//   - https://backend.up.railway.app
	//   - https://desafio-gdash-backend.up.railway.app
	//   - http://localhost:3000 (já é localhost, não precisa ajustar)
	
	// Remover protocolo para análise (incluindo amqp, amqps)
	cleanURL := url
	protocols := []string{"http://", "https://", "amqp://", "amqps://"}
	for _, proto := range protocols {
		if strings.HasPrefix(cleanURL, proto) {
			cleanURL = strings.TrimPrefix(cleanURL, proto)
			break
		}
	}
	
	// Se contém localhost ou 127.0.0.1, não precisa ajustar (já é local)
	if strings.HasPrefix(cleanURL, "localhost") || strings.HasPrefix(cleanURL, "127.0.0.1") {
		return false
	}
	
	// Extrair o hostname (parte antes de : ou /)
	hostname := cleanURL
	if idx := strings.Index(hostname, ":"); idx != -1 {
		hostname = hostname[:idx]
	}
	if idx := strings.Index(hostname, "/"); idx != -1 {
		hostname = hostname[:idx]
	}
	
	// Se o hostname contém ponto, é um domínio externo (ex: backend.up.railway.app)
	// Se não contém ponto, é provavelmente um nome de serviço Docker (ex: backend, rabbitmq)
	return !strings.Contains(hostname, ".")
}

// adjustURLForLocal substitui o hostname Docker por localhost na URL
// Esta função só deve ser chamada se isDockerInternalURL retornar true
// Exemplo: "http://backend:3000" -> "http://localhost:3000"
func adjustURLForLocal(url, dockerHost, localHost string) string {
	// Extrair protocolo
	protocol := ""
	if strings.HasPrefix(url, "http://") {
		protocol = "http://"
		url = strings.TrimPrefix(url, "http://")
	} else if strings.HasPrefix(url, "https://") {
		protocol = "https://"
		url = strings.TrimPrefix(url, "https://")
	} else if strings.HasPrefix(url, "amqp://") {
		protocol = "amqp://"
		url = strings.TrimPrefix(url, "amqp://")
	} else if strings.HasPrefix(url, "amqps://") {
		protocol = "amqps://"
		url = strings.TrimPrefix(url, "amqps://")
	}
	
	// Substituir hostname Docker por localhost
	// Exemplo: "backend:3000" -> "localhost:3000"
	if strings.HasPrefix(url, dockerHost+":") {
		url = strings.Replace(url, dockerHost+":", localHost+":", 1)
	} else if url == dockerHost {
		url = localHost
	}
	
	return protocol + url
}

// ensureProtocol garante que a URL tenha um protocolo válido (http:// ou https://)
// Se não tiver protocolo, adiciona https:// por padrão (assumindo produção)
// Para URLs locais/Docker (localhost, backend:3000, etc), usa http://
func ensureProtocol(url string) string {
	url = strings.TrimSpace(url)
	if url == "" {
		return url
	}

	// Se já tem protocolo, retornar como está
	if strings.HasPrefix(url, "http://") || strings.HasPrefix(url, "https://") {
		return url
	}

	// Verificar se é uma URL local/Docker que deve usar http://
	// Casos: localhost, 127.0.0.1, backend:port, backend-hostname
	localHosts := []string{"localhost", "127.0.0.1", "backend:"}
	for _, host := range localHosts {
		if strings.HasPrefix(url, host) {
			return "http://" + url
		}
	}

	// Se contém "backend" no início e não tem ponto (provavelmente nome de serviço Docker)
	if strings.HasPrefix(url, "backend") && !strings.Contains(url, ".") {
		return "http://" + url
	}

	// Para todas as outras URLs (assumindo produção com domínio externo), usar https://
	return "https://" + url
}

func main() {
	logInfo("Starting worker", map[string]interface{}{
		"operation": "start",
	})

	// Conectar ao RabbitMQ
	conn, err := amqp.Dial(rabbitmqURL)
	if err != nil {
		logError("Failed to connect to RabbitMQ", err, map[string]interface{}{
			"operation": "connect_rabbitmq",
		})
		log.Fatalf("[worker] Failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()
	logInfo("Connected to RabbitMQ", map[string]interface{}{
		"operation": "connect_rabbitmq",
	})

	// Criar canal
	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("[worker] Failed to open channel: %v", err)
	}
	defer ch.Close()

	// Declarar fila (durable para persistência)
	_, err = ch.QueueDeclare(
		queueName, // name
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	if err != nil {
		log.Fatalf("[worker] Failed to declare queue: %v", err)
	}
	logInfo(fmt.Sprintf("Queue '%s' declared", queueName), map[string]interface{}{
		"operation": "declare_queue",
		"queue_name": queueName,
	})

	// Configurar QoS para processar uma mensagem por vez
	err = ch.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	if err != nil {
		log.Fatalf("[worker] Failed to set QoS: %v", err)
	}

	// Consumir mensagens
	msgs, err := ch.Consume(
		queueName, // queue
		"",        // consumer
		false,     // auto-ack (false para ack manual)
		false,     // exclusive
		false,     // no-local
		false,     // no-wait
		nil,       // args
	)
	if err != nil {
		log.Fatalf("[worker] Failed to register consumer: %v", err)
	}
	logInfo("Waiting for messages", map[string]interface{}{
		"operation": "consume_start",
		"queue_name": queueName,
	})

	// Graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// Processar mensagens
	go func() {
		for d := range msgs {
			processMessage(ch, d)
		}
	}()

	// Aguardar sinal de shutdown
	<-sigChan
	logInfo("Shutting down gracefully", map[string]interface{}{
		"operation": "shutdown",
	})
}

// processMessage processa uma mensagem do RabbitMQ
func processMessage(ch *amqp.Channel, d amqp.Delivery) {
	logInfo("Received message", map[string]interface{}{
		"operation": "process_message",
		"message_size": len(d.Body),
		"delivery_tag": d.DeliveryTag,
	})

	// Validar JSON mínimo
	if !isValidJSON(d.Body) {
		logError("Invalid JSON format, rejecting message", nil, map[string]interface{}{
			"operation": "validate_json",
		})
		d.Nack(false, false) // não requeue mensagens inválidas
		return
	}

	// Tentar postar para o backend com retry
	success := postToBackendWithRetry(d.Body)

	if success {
		// Ack se sucesso
		err := d.Ack(false)
		if err != nil {
			logError("Failed to ack message", err, map[string]interface{}{
				"operation": "ack_message",
			})
		} else {
			logInfo("Message acknowledged successfully", map[string]interface{}{
				"operation": "ack_message",
			})
		}
	} else {
		// Nack com requeue se falhou após todas as tentativas
		err := d.Nack(false, true) // requeue=true para tentar novamente depois
		if err != nil {
			logError("Failed to nack message", err, map[string]interface{}{
				"operation": "nack_message",
			})
		} else {
			logWarn("Message nacked and requeued", map[string]interface{}{
				"operation": "nack_message",
				"retries": maxRetries,
			})
		}
	}
}

// isValidJSON valida se o JSON tem estrutura mínima esperada
func isValidJSON(data []byte) bool {
	var payload map[string]interface{}
	if err := json.Unmarshal(data, &payload); err != nil {
		logError("JSON unmarshal error", err, map[string]interface{}{
			"operation": "validate_json",
		})
		return false
	}

	// Validar campos mínimos esperados (timestamp, temperature, humidity)
	hasTimestamp := false
	hasTemperature := false
	hasHumidity := false

	for key, value := range payload {
		switch key {
		case "timestamp":
			if _, ok := value.(string); ok {
				hasTimestamp = true
			}
		case "temperature":
			if _, ok := value.(float64); ok {
				hasTemperature = true
			}
		case "humidity":
			if _, ok := value.(float64); ok {
				hasHumidity = true
			}
		}
	}

	valid := hasTimestamp && hasTemperature && hasHumidity
	if !valid {
		logWarn("Missing required fields", map[string]interface{}{
			"operation":      "validate_json",
			"has_timestamp":  hasTimestamp,
			"has_temperature": hasTemperature,
			"has_humidity":   hasHumidity,
		})
	}

	return valid
}

// postToBackendWithRetry tenta postar para o backend com retry e backoff exponencial.
//
// Estratégia de retry:
// - Apenas erros temporários (5xx, timeout, conexão) são retentados
// - Erros permanentes (4xx, JSON inválido) não são retentados para evitar desperdício
// - Backoff exponencial (1s, 2s, 4s) reduz carga no backend durante problemas transitórios
// - Após maxRetries, a mensagem é rejeitada (Nack com requeue) para processamento posterior
func postToBackendWithRetry(body []byte) bool {
	backoff := initialBackoff

	for attempt := 1; attempt <= maxRetries; attempt++ {
		logInfo("Attempting POST to backend", map[string]interface{}{
			"operation": "post_backend",
			"attempt":   attempt,
			"max_retries": maxRetries,
		})

		success, isTemporary := postToBackend(body)
		if success {
			logInfo("POST successful", map[string]interface{}{
				"operation": "post_backend",
				"attempt":   attempt,
			})
			return true
		}

		// Se não é erro temporário, não tentar novamente
		if !isTemporary {
			logWarn("Non-temporary error, stopping retries", map[string]interface{}{
				"operation": "post_backend",
				"attempt":   attempt,
			})
			return false
		}

		// Se não é a última tentativa, aguardar antes de retry
		if attempt < maxRetries {
			logWarn("Temporary error, retrying", map[string]interface{}{
				"operation": "post_backend",
				"attempt":   attempt,
				"backoff":   backoff.String(),
			})
			time.Sleep(backoff)
			backoff *= 2 // backoff exponencial
		}
	}

	logError("Failed to POST after all attempts", nil, map[string]interface{}{
		"operation": "post_backend",
		"max_retries": maxRetries,
	})
	return false
}

// postToBackend faz POST para o backend e retorna (success, isTemporaryError)
func postToBackend(body []byte) (bool, bool) {
	// Criar request com bytes.NewReader
	req, err := http.NewRequest("POST", backendURL, bytes.NewReader(body))
	if err != nil {
		logError("Failed to create request", err, map[string]interface{}{
			"operation": "post_backend",
			"url":       backendURL,
		})
		return false, false // erro não temporário
	}

	req.Header.Set("Content-Type", "application/json")

	// Log da URL sendo usada (apenas no primeiro erro para evitar spam)
	logDebug("Attempting POST request", map[string]interface{}{
		"operation": "post_backend",
		"url":       backendURL,
		"body_size": len(body),
	})

	// Fazer requisição
	resp, err := httpClient.Do(req)
	if err != nil {
		logError("HTTP request error", err, map[string]interface{}{
			"operation": "post_backend",
			"url":       backendURL,
		})
		return false, true // erro temporário (rede, timeout, etc)
	}
	defer resp.Body.Close()

	// Ler resposta para incluir no log de erro
	responseBody := make([]byte, 512) // Ler apenas primeiros 512 bytes
	n, _ := resp.Body.Read(responseBody)
	responsePreview := string(responseBody[:n])

	// Verificar status code
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		logInfo("POST successful", map[string]interface{}{
			"operation":  "post_backend",
			"status_code": resp.StatusCode,
			"url":        backendURL,
		})
		return true, false
	}

	// Status 4xx são erros não temporários (bad request, etc)
	if resp.StatusCode >= 400 && resp.StatusCode < 500 {
		logError("Client error (non-temporary)", nil, map[string]interface{}{
			"operation":      "post_backend",
			"status_code":    resp.StatusCode,
			"url":            backendURL,
			"response_body":  responsePreview,
			"content_length": resp.ContentLength,
		})
		
		// Para 404, adicionar informações adicionais
		if resp.StatusCode == 404 {
			logError("Endpoint not found - verify BACKEND_URL and endpoint path", nil, map[string]interface{}{
				"operation":     "post_backend",
				"expected_path": "/weather/logs",
				"full_url":      backendURL,
				"hint":          "Check if BACKEND_URL is correct and endpoint exists",
			})
		}
		return false, false
	}

	// Status 5xx são erros temporários (server error)
	if resp.StatusCode >= 500 {
		logError("Server error (temporary)", nil, map[string]interface{}{
			"operation":     "post_backend",
			"status_code":   resp.StatusCode,
			"url":           backendURL,
			"response_body": responsePreview,
		})
		return false, true
	}

	// Outros status codes
	logWarn("Unexpected status code", map[string]interface{}{
		"operation":   "post_backend",
		"status_code": resp.StatusCode,
		"url":         backendURL,
	})
	return false, true // tratar como temporário por padrão
}
