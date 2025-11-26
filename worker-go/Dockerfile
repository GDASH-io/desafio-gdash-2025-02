FROM golang:1.22-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o worker ./cmd/worker/main.go

FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

ENV TZ=America/Fortaleza

RUN addgroup -g 1000 appgroup && \
    adduser -D -u 1000 -G appgroup appuser

WORKDIR /home/appuser

COPY --from=builder /app/worker .

RUN chown -R appuser:appgroup /home/appuser

USER appuser

CMD ["./worker"]