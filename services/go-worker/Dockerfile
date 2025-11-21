# Etapa de build: compilar um binário Go estático
FROM golang:1.21-alpine AS build
ENV CGO_ENABLED=0
WORKDIR /src

# Instala dependências de build
RUN apk add --no-cache git build-base

# Copia arquivos de módulo primeiro para aproveitar cache de camadas do Docker
COPY go.mod ./
RUN go mod download

# Copia o restante do código-fonte
COPY . .

# Compila com otimizações para reduzir o tamanho do binário
RUN go build -ldflags='-s -w' -o /worker ./cmd

# Etapa de runtime: imagem pequena com certificados CA
FROM alpine:3.18
RUN apk add --no-cache ca-certificates
WORKDIR /app

# Cria usuário não-root
RUN addgroup -S worker && adduser -S worker -G worker

# Copia o binário do estágio de build e ajusta permissões
COPY --from=build /worker /usr/local/bin/worker
RUN chown worker:worker /usr/local/bin/worker

USER worker

# Nenhuma porta específica exposta (worker consome/envia); deixar EXPOSE opcional
ENTRYPOINT ["/usr/local/bin/worker"]

