package main

import (
	"weathernator/worker/config"
	"weathernator/worker/worker"
)

func main() {
	cfg := config.Load()
	w := worker.NewWorker(cfg)
	w.Start()
}
