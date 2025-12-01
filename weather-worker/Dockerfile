FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod ./
COPY go.sum* ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o weather-worker main.go

FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/


COPY --from=builder /app/weather-worker .


CMD ["./weather-worker"]