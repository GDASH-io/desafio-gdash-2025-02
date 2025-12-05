FROM golang:1.19-alpine
WORKDIR /app
COPY . .
RUN go mod tidy
RUN go build -o worker main.go
CMD ["./worker"]