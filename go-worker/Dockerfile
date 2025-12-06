FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /go-worker

FROM alpine:latest

WORKDIR /
COPY --from=builder /go-worker /go-worker

ENTRYPOINT ["/go-worker"]