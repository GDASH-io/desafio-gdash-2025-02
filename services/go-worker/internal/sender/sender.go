package sender

import (
	"bytes"
	"fmt"
	"net/http"
)

// SendToAPI sends the processed payload to the NestJS API endpoint (placeholder)
func SendToAPI(url string, payload []byte) error {
	resp, err := http.Post(url, "application/json", bytes.NewReader(payload))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	fmt.Printf("sender: sent to %s, status=%s\n", url, resp.Status)
	return nil
}
