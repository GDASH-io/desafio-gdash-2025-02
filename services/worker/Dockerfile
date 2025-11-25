FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY main.go ./
RUN go mod tidy
RUN go build -o worker main.go

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/worker .
CMD ["./worker"]


