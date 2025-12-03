FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY . .

# Ensure dependencies are downloaded and go.sum is generated
# We run this AFTER copy to ensure we use the latest code and overwrite any stale go.mod from host if needed (though we want to fix it)
# Actually, we should rely on the host's go.mod but generate go.sum here.
RUN go mod tidy

ENV CGO_ENABLED=0 GOOS=linux
RUN go build -o weather-worker main.go

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/weather-worker .

CMD ["./weather-worker"]
