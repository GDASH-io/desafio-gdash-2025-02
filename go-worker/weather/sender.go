package weather

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

const (
	defaultAPIURL      = "http://backend:3001/api/weather/internal"
	httpTimeoutSeconds = 5
	retryDelaySeconds  = 1
)

type Sender struct {
	apiURL   string
	client   *http.Client
	logger   Logger
}

type Logger interface {
	LogInfo(format string, v ...interface{})
	LogError(format string, v ...interface{})
	LogSuccess(format string, v ...interface{})
	LogWarn(format string, v ...interface{})
}

func NewSender(logger Logger) *Sender {
	apiURL := os.Getenv("API_URL")
	if apiURL == "" {
		apiURL = defaultAPIURL
	}

	return &Sender{
		apiURL: apiURL,
		client: &http.Client{
			Timeout: httpTimeoutSeconds * time.Second,
		},
		logger: logger,
	}
}

func (s *Sender) Send(data map[string]interface{}) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("erro ao serializar JSON: %w", err)
	}

	s.logger.LogInfo("📤 Enviando POST para %s", s.apiURL)
	s.logger.LogInfo("📦 Body: %s", string(jsonData))

	req, err := http.NewRequest("POST", s.apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("erro ao executar requisição: %w", err)
	}
	defer resp.Body.Close()

	s.logger.LogInfo("📥 Resposta da API: Status %d", resp.StatusCode)

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		s.logger.LogSuccess("✅ Sucesso ao enviar para API")
		return nil
	}

	var errorBody bytes.Buffer
	errorBody.ReadFrom(resp.Body)

	return &HTTPError{
		StatusCode: resp.StatusCode,
		Message:    fmt.Sprintf("API retornou status %d: %s", resp.StatusCode, errorBody.String()),
	}
}

func (s *Sender) SendWithRetry(data map[string]interface{}, maxRetries int) error {
	var lastErr error

	for attempt := 0; attempt < maxRetries; attempt++ {
		if attempt > 0 {
			s.logger.LogWarn("🔄 Tentativa %d/%d", attempt+1, maxRetries)
			time.Sleep(retryDelaySeconds * time.Second)
		}

		err := s.Send(data)
		if err == nil {
			return nil
		}

		lastErr = err
		s.logger.LogError("❌ Falha na tentativa %d: %v", attempt+1, err)

		if httpErr, ok := err.(*HTTPError); ok {
			if httpErr.StatusCode < 400 {
				return err
			}
		}
	}

	return fmt.Errorf("falhou após %d tentativas: %w", maxRetries, lastErr)
}

type HTTPError struct {
	StatusCode int
	Message    string
}

func (e *HTTPError) Error() string {
	return e.Message
}

