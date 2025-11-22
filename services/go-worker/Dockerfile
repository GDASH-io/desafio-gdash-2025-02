FROM golang:1.21-alpine AS build
ENV CGO_ENABLED=0
WORKDIR /src

RUN apk add --no-cache git build-base

COPY go.mod ./
RUN go mod download

COPY . .

RUN go build -ldflags='-s -w' -o /worker ./cmd

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
WORKDIR /app

COPY --from=build /worker /app/worker

COPY --from=build /src/configs /app/configs

CMD ["/app/worker"]