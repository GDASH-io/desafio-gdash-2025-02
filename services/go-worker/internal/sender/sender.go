package sender

import (
    "bytes"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
)

func SendToAPI(data interface{}, url string) error {
    jsonData, err := json.Marshal(data)
    if err != nil {
        log.Printf("Erro ao converter dados para JSON: %v", err)
        return fmt.Errorf("erro ao converter dados para JSON: %w", err)
    }

    resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
    if err != nil {
        log.Printf("Erro ao enviar dados para a API: %v", err)
        return fmt.Errorf("erro ao enviar dados para a API: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
        log.Printf("API retornou status inesperado: %s", resp.Status)
        return fmt.Errorf("API retornou status inesperado: %s", resp.Status)
    }

    return nil
}