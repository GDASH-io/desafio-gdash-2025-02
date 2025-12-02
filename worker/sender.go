package main

import (
    "bytes"
    "encoding/json"
    "log"
    "net/http"
)

func sendToAPI(w Weather) bool {
    body, err := json.Marshal(w)
    if err != nil {
        log.Println("Falha ao serializar JSON:", err)
        return false
    }

    resp, err := http.Post(ApiURL, "application/json", bytes.NewBuffer(body))
    if err != nil {
        log.Println("Erro ao enviar para API:", err)
        return false
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
        log.Println("API respondeu status:", resp.StatusCode)
        return false
    }
    return true
}
