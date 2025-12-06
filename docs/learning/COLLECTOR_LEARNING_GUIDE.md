# Guia de Aprendizado: Collector (Python)

Este guia vai te ensinar como o nosso "Coletor" funciona. Ele é um script em Python simples, mas poderoso, que age como um robô buscando informações.

## 1. As Ferramentas (`imports`)

No começo do arquivo, importamos as ferramentas que vamos usar. Pense nelas como uma caixa de ferramentas.

```python
import requests  # Para navegar na internet (fazer chamadas HTTP)
import pika      # Para falar com o RabbitMQ (mensageria)
import schedule  # Para agendar tarefas (ex: rodar a cada minuto)
import json      # Para lidar com dados no formato JSON
```

*   **`requests`**: É o navegador do Python. Usamos para acessar a API de clima.
*   **`pika`**: É o telefone que liga para o RabbitMQ.

## 2. Organizando os Dados (`@dataclass`)

Para não deixar os dados soltos, criamos uma "forma" para eles.

```python
@dataclass
class WeatherData:
    city: str
    temperature: float
    humidity: int
    # ...
```

*   **`@dataclass`**: É um jeito moderno e fácil do Python criar classes que servem apenas para guardar dados. É como definir um formulário padrão.

## 3. Buscando os Dados (`fetch_weather_data`)

Aqui é onde o robô vai até a fonte buscar a informação.

```python
def fetch_weather_data():
    # ... pega latitude e longitude ...
    url = f"https://api.open-meteo.com/v1/forecast?..."
    
    response = requests.get(url) # Faz o pedido para a API
    data = response.json()       # Lê a resposta
    
    # ... organiza os dados na nossa dataclass ...
    return WeatherData(...)
```

*   **`requests.get(url)`**: É como digitar o site no navegador e dar Enter.
*   **`response.json()`**: Transforma o texto que o site devolveu em um objeto Python que podemos mexer.

## 4. Enviando para a Fila (`publish_to_rabbitmq`)

Depois de pegar o dado, não guardamos ele aqui. Enviamos para o correio (RabbitMQ).

```python
def publish_to_rabbitmq(data):
    # 1. Conecta no RabbitMQ
    connection = pika.BlockingConnection(...) 
    channel = connection.channel()
    
    # 2. Garante que a fila existe
    channel.queue_declare(queue='weather_data')
    
    # 3. Envia a mensagem
    channel.basic_publish(
        exchange='',
        routing_key='weather_data',
        body=json.dumps(asdict(data)) # Transforma em texto para enviar
    )
```

*   **`queue_declare`**: "Ei RabbitMQ, cria a caixa de correio 'weather_data' se ela não existir".
*   **`basic_publish`**: Coloca a carta na caixa.

## 5. O Loop Infinito (`job` e `schedule`)

Um coletor precisa rodar para sempre, ou em intervalos definidos.

```python
# Agenda a tarefa 'job' para rodar a cada 1 minuto
schedule.every(1).minutes.do(job)

while True:
    schedule.run_pending() # Verifica se tem tarefa agendada para agora
    time.sleep(1)          # Descansa 1 segundo para não gastar CPU à toa
```

*   **`while True`**: Cria um loop que nunca acaba. O programa fica rodando até alguém mandar parar.
*   **`schedule`**: É o despertador. Ele cuida de chamar a função `job` na hora certa.

## Resumo da Aula

*   **Python** é ótimo para scripts e automação.
*   **Requests** busca dados da web.
*   **RabbitMQ (Pika)** permite enviar dados para outros sistemas sem travar o script.
*   **Schedule** permite criar rotinas automáticas.

Agora você sabe como nosso robô coletor trabalha! 🤖
