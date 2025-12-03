FROM golang:1.21-alpine

WORKDIR /app
COPY . .

RUN go mod init go_producer
RUN go get github.com/streadway/amqp

RUN go build -o main

CMD ["./main"]