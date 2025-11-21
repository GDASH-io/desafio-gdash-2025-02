"""
Servidor HTTP simples para healthcheck.
"""
import json
import threading
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Optional
from src.shared.config import Config
from src.infra.messaging.kafka_producer import KafkaProducerImpl

logger = logging.getLogger("collector")


class HealthCheckHandler(BaseHTTPRequestHandler):
    """Handler para endpoint de healthcheck."""
    
    def __init__(self, kafka_producer: Optional[KafkaProducerImpl], *args, **kwargs):
        self.kafka_producer = kafka_producer
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Responde requisições GET."""
        if self.path == "/healthz":
            self.handle_healthcheck()
        else:
            self.send_response(404)
            self.end_headers()
    
    def handle_healthcheck(self):
        """Verifica saúde do serviço."""
        status_code = 200
        response = {"status": "healthy"}
        
        # Verificar conexão Kafka (não bloqueia se falhar)
        if self.kafka_producer:
            try:
                if self.kafka_producer.is_connected():
                    response["kafka"] = "connected"
                else:
                    response["kafka"] = "disconnected"
                    # Não retornar 503 apenas por Kafka desconectado,
                    # o serviço em si está saudável
            except Exception as e:
                response["kafka"] = "error"
                logger.warning(f"Erro ao verificar Kafka no healthcheck: {e}")
        else:
            response["kafka"] = "not_initialized"
        
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())
    
    def log_message(self, format, *args):
        """Suprime logs do servidor HTTP."""
        pass


def start_healthcheck_server(
    port: int,
    kafka_producer: Optional[KafkaProducerImpl] = None,
) -> HTTPServer:
    """
    Inicia servidor de healthcheck em thread separada.
    
    Args:
        port: Porta do servidor
        kafka_producer: Instância do Kafka producer para verificação
    
    Returns:
        Instância do servidor HTTP
    """
    def handler_factory(*args, **kwargs):
        return HealthCheckHandler(kafka_producer, *args, **kwargs)
    
    server = HTTPServer(("0.0.0.0", port), handler_factory)
    
    def run_server():
        logger.info(f"Healthcheck server iniciado na porta {port}")
        server.serve_forever()
    
    thread = threading.Thread(target=run_server, daemon=True)
    thread.start()
    
    return server

