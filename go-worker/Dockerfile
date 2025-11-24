# build stage
FROM golang:1.21-alpine AS build
WORKDIR /app

# copie todo o contexto (pode estar vazio no início)
COPY . .

# se existir main.go, compile o binário
RUN if [ -f main.go ]; then \
      GOOS=linux go build -o /app/go-worker main.go; \
    else \
      echo "main.go não encontrado — build do binário pulado"; \
    fi

# runtime stage
FROM alpine:3.18
WORKDIR /app

RUN apk add --no-cache ca-certificates

# copie todo o diretório /app do estágio build (sempre existirá)
COPY --from=build /app /app

# copie o entrypoint e torne executável
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
