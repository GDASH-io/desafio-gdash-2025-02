FROM golang:1.20 as builder
WORKDIR /src
COPY . .
RUN go build -o /go/bin/worker

FROM golang:1.20
COPY --from=builder /go/bin/worker /go/bin/worker
ENTRYPOINT ["/go/bin/worker"]
