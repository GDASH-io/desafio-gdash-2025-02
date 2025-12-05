# Makefile helper to safely run docker-compose
.PHONY: up down build logs

up:
	./scripts/up.sh

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f
