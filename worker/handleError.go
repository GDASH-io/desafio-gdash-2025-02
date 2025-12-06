package main

import (
	"log"
	"os"
	"time"
)

func SetupLogFile() {
	filename := time.Now().Format("logs/2006-01-02") + ".log"

	file, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatal("Falha ao criar arquivo de log:", err)
	}

	log.Printf("Arquivo %s criado", filename)

	log.SetOutput(file)
}

func PanicOnError(err error, message string) {
	if err != nil {
		log.Panicf("%s: %v", message, err)
	}
}

func MsgOnErr(err error, message string) bool {
	if err != nil {
		log.Printf("%s: %v", message, err)
		return true
	}
	return false
}
