package logger

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"
)

// LogLevel representa o nível de log
type LogLevel string

const (
	LogLevelDebug LogLevel = "DEBUG"
	LogLevelInfo  LogLevel = "INFO"
	LogLevelWarn  LogLevel = "WARN"
	LogLevelError LogLevel = "ERROR"
)

// Logger estruturado
type Logger struct {
	level  LogLevel
	format string
}

// LogEntry representa uma entrada de log estruturada
type LogEntry struct {
	Timestamp string                 `json:"timestamp"`
	Level     string                 `json:"level"`
	Service   string                 `json:"service"`
	Message   string                 `json:"message"`
	Context   map[string]interface{} `json:"context,omitempty"`
}

// New cria um novo logger
func New(level, format string) *Logger {
	return &Logger{
		level:  LogLevel(level),
		format: format,
	}
}

// log escreve uma entrada de log
func (l *Logger) log(level LogLevel, message string, context map[string]interface{}) {
	if !l.shouldLog(level) {
		return
	}

	entry := LogEntry{
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Level:     string(level),
		Service:   "worker-go",
		Message:   message,
		Context:   context,
	}

	if l.format == "json" {
		jsonData, _ := json.Marshal(entry)
		fmt.Println(string(jsonData))
	} else {
		log.Printf("[%s] %s - %s", level, message, formatContext(context))
	}
}

// shouldLog verifica se deve logar baseado no nível
func (l *Logger) shouldLog(level LogLevel) bool {
	levels := map[LogLevel]int{
		LogLevelDebug: 0,
		LogLevelInfo:  1,
		LogLevelWarn:  2,
		LogLevelError: 3,
	}
	return levels[level] >= levels[l.level]
}

// formatContext formata contexto para texto
func formatContext(context map[string]interface{}) string {
	if len(context) == 0 {
		return ""
	}
	result := ""
	for k, v := range context {
		result += fmt.Sprintf("%s=%v ", k, v)
	}
	return result
}

// Debug loga em nível debug
func (l *Logger) Debug(message string, context map[string]interface{}) {
	l.log(LogLevelDebug, message, context)
}

// Info loga em nível info
func (l *Logger) Info(message string, context map[string]interface{}) {
	l.log(LogLevelInfo, message, context)
}

// Warn loga em nível warn
func (l *Logger) Warn(message string, context map[string]interface{}) {
	l.log(LogLevelWarn, message, context)
}

// Error loga em nível error
func (l *Logger) Error(message string, context map[string]interface{}) {
	l.log(LogLevelError, message, context)
}

// Fatal loga e encerra o programa
func (l *Logger) Fatal(message string, context map[string]interface{}) {
	l.log(LogLevelError, message, context)
	os.Exit(1)
}

