FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod main.go ./
RUN go get github.com/rabbitmq/amqp091-go && go mod tidy

RUN CGO_ENABLED=0 GOOS=linux go build -o worker main.go

FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/worker .

CMD ["./worker"]

