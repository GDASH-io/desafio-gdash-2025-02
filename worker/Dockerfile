FROM golang:1.21

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod tidy && go mod download 

COPY . .

RUN go build -o worker .

CMD ["./worker"]
