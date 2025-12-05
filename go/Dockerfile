FROM golang:1.21-alpine as build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /go-worker

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=build /go-worker /go-worker
ENTRYPOINT ["/go-worker"]
