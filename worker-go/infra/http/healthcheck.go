package http

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

// HealthCheckServer servidor HTTP para healthcheck
type HealthCheckServer struct {
	server     *http.Server
	port       int
	kafkaCheck func() bool
	apiCheck   func() bool
	mu         sync.RWMutex
	healthy    bool
}

// NewHealthCheckServer cria um novo servidor de healthcheck
func NewHealthCheckServer(port int, kafkaCheck, apiCheck func() bool) *HealthCheckServer {
	return &HealthCheckServer{
		port:       port,
		kafkaCheck: kafkaCheck,
		apiCheck:   apiCheck,
		healthy:    true,
	}
}

// Start inicia o servidor de healthcheck
func (h *HealthCheckServer) Start() error {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", h.handleHealthcheck)
	
	h.server = &http.Server{
		Addr:    fmt.Sprintf(":%d", h.port),
		Handler: mux,
	}
	
	go func() {
		if err := h.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Printf("Erro no servidor healthcheck: %v\n", err)
		}
	}()
	
	return nil
}

// handleHealthcheck trata requisições de healthcheck
func (h *HealthCheckServer) handleHealthcheck(w http.ResponseWriter, r *http.Request) {
	status := http.StatusOK
	response := map[string]interface{}{
		"status": "healthy",
	}
	
	// Verificar Kafka
	if h.kafkaCheck != nil {
		if h.kafkaCheck() {
			response["kafka"] = "connected"
		} else {
			response["kafka"] = "disconnected"
			status = http.StatusServiceUnavailable
		}
	}
	
	// Verificar API
	if h.apiCheck != nil {
		if h.apiCheck() {
			response["api"] = "connected"
		} else {
			response["api"] = "disconnected"
			status = http.StatusServiceUnavailable
		}
	}
	
	h.mu.Lock()
	h.healthy = status == http.StatusOK
	h.mu.Unlock()
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(response)
}

// Stop para o servidor
func (h *HealthCheckServer) Stop(ctx context.Context) error {
	return h.server.Shutdown(ctx)
}

// IsHealthy retorna status de saúde
func (h *HealthCheckServer) IsHealthy() bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return h.healthy
}

