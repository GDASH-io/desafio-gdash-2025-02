import pika
import json

connection = pika.BlockingConnection(
    pika.ConnectionParameters(host="rabbitmq")
)
channel = connection.channel()

channel.queue_declare(queue="tasks")

print("Worker iniciado. Aguardando mensagens...")

def process(ch, method, properties, body):
    message = json.loads(body)
    print("Mensagem recebida:", message)

    # TODO: chamar API externa, salvar no banco, etc

channel.basic_consume(
    queue="tasks",
    on_message_callback=process,
    auto_ack=True,
)

channel.start_consuming()
