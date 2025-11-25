# Build stage
FROM golang:1.22-alpine AS builder
WORKDIR /app
# Copia declarações primeiro para cache e gera go.sum
COPY go.mod ./
COPY main.go ./
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o worker ./main.go

# Runtime stage
FROM alpine:3.20
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /app/worker /app/worker
ENTRYPOINT ["/app/worker"]
