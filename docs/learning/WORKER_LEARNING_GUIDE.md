# Guia de Aprendizado: Worker (Go)

Este guia vai te ensinar como o nosso "Operário" funciona. Ele é escrito em **Go (Golang)**, uma linguagem famosa pela sua velocidade e capacidade de fazer várias coisas ao mesmo tempo.

## 1. O Pacote e as Importações (`package` e `import`)

Em Go, todo arquivo pertence a um pacote.

```go
package main

import (
    "log"
    "time"
    amqp "github.com/rabbitmq/amqp091-go" // Apelidamos de 'amqp'
)
```

*   **`package main`**: Diz que este arquivo é um programa executável, não apenas uma biblioteca.
*   **`import`**: Traz ferramentas de fora. O `amqp` é a biblioteca que sabe falar com o RabbitMQ.

## 2. Tratamento de Erros (`failOnError`)

Go não usa `try/catch` como outras linguagens. Ele checa erros explicitamente.

```go
func failOnError(err error, msg string) {
    if err != nil {
        log.Printf("%s: %s", msg, err)
    }
}
```

*   **Filosofia do Go**: "Erros são valores". Se algo der errado, a função retorna um erro e você decide o que fazer (aqui, apenas logamos o problema).

## 3. Conectando com Teimosia (`connectRabbitMQ`)

O Worker precisa do RabbitMQ. Se ele cair, o Worker tenta conectar de novo.

```go
func connectRabbitMQ() (*amqp.Connection, error) {
    // ... pega usuário e senha ...
    for {
        conn, err := amqp.Dial(connStr) // Tenta discar
        if err == nil {
            return conn, nil // Sucesso!
        }
        
        // Falhou? Espera um pouco e tenta de novo (Backoff)
        time.Sleep(backOff)
    }
}
```

*   **Loop Infinito (`for`)**: O Worker é persistente. Ele não desiste até conseguir conectar.

## 4. O Coração: Processando Mensagens (`main`)

Aqui é onde a mágica da velocidade acontece.

```go
func main() {
    // 1. Conecta e abre um canal
    conn, _ := connectRabbitMQ()
    ch, _ := conn.Channel()

    // 2. Começa a consumir a fila
    msgs, _ := ch.Consume(
        "weather_data", // Nome da fila
        // ...
    )

    // 3. Goroutine (O Segredo do Go!)
    go func() {
        for d := range msgs {
            log.Printf("Recebi: %s", d.Body)
            postToBackend(d.Body) // Envia para o Backend
            d.Ack(false)          // Avisa o RabbitMQ: "Já terminei esse!"
        }
    }()

    // 4. Mantém o programa rodando
    <-forever
}
```

*   **`go func() { ... }()`**: Isso cria uma **Goroutine**. É como contratar um funcionário extra para fazer esse trabalho em paralelo. O programa principal continua livre enquanto essa função roda em segundo plano. É isso que faz o Go ser tão rápido!
*   **`d.Ack(false)`**: É o carimbo de "Feito". Só depois disso o RabbitMQ tira a mensagem da fila.

## Resumo da Aula

*   **Go** é simples e direto (sem classes complexas).
*   **Tratamento de Erros** é explícito (`if err != nil`).
*   **Goroutines (`go`)** permitem fazer tarefas pesadas em paralelo sem travar o computador.
*   **Ack** garante que nenhuma tarefa seja perdida, mesmo se o Worker desligar no meio.

Agora você entende por que escolhemos Go para o trabalho pesado! 🚀
