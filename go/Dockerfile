FROM golang:1.21-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o /worker ./main.go

FROM alpine:latest
RUN apk add --no-cache ca-certificates

WORKDIR /app
COPY --from=build /worker /worker

ENTRYPOINT ["/worker"]