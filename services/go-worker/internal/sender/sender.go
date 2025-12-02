package sender

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "log"
    "net/http"
    "time"
)

func SendToAPI(data interface{}, url string) error {
    jsonData, err := json.Marshal(data)
    if err != nil {
        log.Printf("[ERROR] Falha ao serializar dados para JSON: %v", err)
        return fmt.Errorf("erro ao serializar JSON: %w", err)
    }

    log.Printf("[INFO] Preparando envio para API (tamanho: %d bytes)", len(jsonData))

    client := &http.Client{
        Timeout: 30 * time.Second,
    }

    maxRetries := 3
    var resp *http.Response
    
    for attempt := 1; attempt <= maxRetries; attempt++ {
        req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
        if err != nil {
            log.Printf("[ERROR] Falha ao criar requisição HTTP: %v", err)
            return fmt.Errorf("erro ao criar requisição: %w", err)
        }
        
        req.Header.Set("Content-Type", "application/json")
        
        resp, err = client.Do(req)
        if err != nil {
            if attempt < maxRetries {
                log.Printf("[WARN] Tentativa %d/%d falhou: %v. Tentando novamente em 2s...", attempt, maxRetries, err)
                time.Sleep(2 * time.Second)
                continue
            }
            log.Printf("[ERROR] Todas as tentativas falharam: %v", err)
            return fmt.Errorf("erro após %d tentativas: %w", maxRetries, err)
        }
        
        break // Sucesso, sair do loop
    }
    
    defer resp.Body.Close()

    if resp.StatusCode < 200 || resp.StatusCode >= 300 {
        body, _ := io.ReadAll(resp.Body)
        log.Printf("[ERROR] API retornou status %d: %s - Body: %s", resp.StatusCode, resp.Status, string(body))
        return fmt.Errorf("erro HTTP: status %d", resp.StatusCode)
    }

    log.Printf("[SUCCESS] Dados enviados com sucesso - Status: %d", resp.StatusCode)
    return nil
}