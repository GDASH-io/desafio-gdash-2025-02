package main

import "log"

func main() {
    if err := consumeMessages(); err != nil {
        log.Fatal("Erro no worker:", err)
    }
}
