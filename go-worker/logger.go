package main

import (
	"log"
	"os"
)

type Logger struct {
	*log.Logger
}

func NewLogger() *Logger {
	return &Logger{
		Logger: log.New(os.Stdout, "", log.LstdFlags|log.Lshortfile),
	}
}

func (l *Logger) LogInfo(format string, v ...interface{}) {
	if len(v) > 0 {
		l.Printf("[INFO] "+format, v...)
	} else {
		l.Printf("[INFO] " + format)
	}
}

func (l *Logger) LogError(format string, v ...interface{}) {
	if len(v) > 0 {
		l.Printf("[ERROR] "+format, v...)
	} else {
		l.Printf("[ERROR] " + format)
	}
}

func (l *Logger) LogSuccess(format string, v ...interface{}) {
	if len(v) > 0 {
		l.Printf("[SUCCESS] "+format, v...)
	} else {
		l.Printf("[SUCCESS] " + format)
	}
}

func (l *Logger) LogWarn(format string, v ...interface{}) {
	if len(v) > 0 {
		l.Printf("[WARN] "+format, v...)
	} else {
		l.Printf("[WARN] " + format)
	}
}

