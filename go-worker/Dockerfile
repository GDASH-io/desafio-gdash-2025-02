FROM golang:1.21-alpine

WORKDIR /app

# 1. Copia TODO o código fonte primeiro (main.go, go.mod, etc)
COPY . .

# 2. Agora que o main.go está dentro do container, o Go consegue ler os imports
# e baixar exatamente o que precisa, atualizando o go.mod lá dentro
RUN go get github.com/streadway/amqp
RUN go mod tidy

# 3. Compila
RUN go build -o worker .

CMD ["./worker"]