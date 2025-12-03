#!/usr/bin/env python3
"""
Collector de dados climáticos que obtém informações de APIs e envia
para o backend (modo direct) ou RabbitMQ (modo rabbit).
"""

import os
import time
import json
import logging
import requests
import pika
import pika.exceptions
from datetime import datetime, UTC
from typing import Dict, Optional, List
from dotenv import load_dotenv
from pathlib import Path

# Configurar logging estruturado
class StructuredFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': datetime.now(UTC).isoformat(),
            'level': record.levelname,
            'service': 'collector',
            'message': record.getMessage(),
        }
        # Adicionar campos extras se existirem
        if hasattr(record, 'module'):
            log_data['module'] = record.module
        if hasattr(record, 'operation'):
            log_data['operation'] = record.operation
        if hasattr(record, 'extra_data'):
            log_data.update(record.extra_data)
        return json.dumps(log_data)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(levelname)s] [collector] %(message)s'
)
logger = logging.getLogger(__name__)

# Handler customizado para logs estruturados (opcional, para produção)
if os.getenv('STRUCTURED_LOGS', 'false').lower() == 'true':
    handler = logging.StreamHandler()
    handler.setFormatter(StructuredFormatter())
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Carregar variáveis de ambiente do arquivo .env (se existir)
# Procura na raiz do projeto (../.env) e no diretório atual (./.env)
env_paths = [
    Path(__file__).parent.parent / '.env',  # Raiz do projeto
    Path(__file__).parent / '.env',          # Diretório collector-python
]
env_loaded = False
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        logger.info(f"[collector] Carregado .env de: {env_path}")
        env_loaded = True
        break

if not env_loaded:
    # Se nenhum .env encontrado, tenta carregar do diretório atual (comportamento padrão)
    load_dotenv()

# Variáveis de ambiente
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:3000')
RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672/')
COLLECTOR_MODE = os.getenv('COLLECTOR_MODE', 'rabbit')
COLLECT_INTERVAL = int(os.getenv('COLLECT_INTERVAL', '60'))
OPENWEATHER_KEY = os.getenv('OPENWEATHER_KEY', '')

# Detectar se está rodando localmente (Windows não tem /.dockerenv)
def is_running_locally() -> bool:
    """Detecta se está rodando localmente (não em Docker)."""
    # Verificar se existe o arquivo /.dockerenv (presente em containers Docker)
    if Path('/.dockerenv').exists():
        return False
    # Verificar variável de ambiente DOCKER_CONTAINER
    if os.getenv('DOCKER_CONTAINER') == 'true':
        return False
    # Windows não tem /proc, então se chegou aqui e não está em Docker, é local
    return True

# Ajustar RABBITMQ_URL se necessário (detectar uso de nome de serviço Docker quando rodando localmente)
if is_running_locally() and 'rabbitmq:' in RABBITMQ_URL and 'localhost' not in RABBITMQ_URL:
    logger.warning(f"[collector] Detectado: rodando localmente mas RABBITMQ_URL usa nome de serviço Docker")
    logger.warning(f"[collector] Ajustando automaticamente para localhost...")
    RABBITMQ_URL = RABBITMQ_URL.replace('rabbitmq:', 'localhost:')
    logger.info(f"[collector] RABBITMQ_URL ajustada para: {RABBITMQ_URL}")

def ensure_protocol(url: str) -> str:
    """
    Garante que a URL tenha um protocolo válido (http:// ou https://).
    Se não tiver protocolo, adiciona https:// por padrão (assumindo produção).
    Para URLs locais/Docker (localhost, backend:3000, etc), usa http://
    """
    url = url.strip()
    if not url:
        return url
    
    # Se já tem protocolo, retornar como está
    if url.startswith('http://') or url.startswith('https://'):
        return url
    
    # Verificar se é uma URL local/Docker que deve usar http://
    local_hosts = ['localhost', '127.0.0.1', 'backend:']
    for host in local_hosts:
        if url.startswith(host):
            return f'http://{url}'
    
    # Se contém "backend" no início e não tem ponto (provavelmente nome de serviço Docker)
    if url.startswith('backend') and '.' not in url:
        return f'http://{url}'
    
    # Para todas as outras URLs (assumindo produção com domínio externo), usar https://
    return f'https://{url}'

# Garantir que BACKEND_URL tenha protocolo
BACKEND_URL = ensure_protocol(BACKEND_URL)

# Ajustar BACKEND_URL se necessário
if is_running_locally() and 'backend:' in BACKEND_URL and 'localhost' not in BACKEND_URL:
    logger.warning(f"[collector] Detectado: rodando localmente mas BACKEND_URL usa nome de serviço Docker")
    logger.warning(f"[collector] Ajustando automaticamente para localhost...")
    BACKEND_URL = BACKEND_URL.replace('backend:', 'localhost:')
    # Garantir protocolo novamente após ajuste
    BACKEND_URL = ensure_protocol(BACKEND_URL)
    logger.info(f"[collector] BACKEND_URL ajustada para: {BACKEND_URL}")


# Coordenadas das capitais brasileiras
CAPITAL_COORDINATES = {
    'Aracaju': {'lat': -10.9091, 'lon': -37.0677},
    'Belém': {'lat': -1.4558, 'lon': -48.5044},
    'Belo Horizonte': {'lat': -19.9167, 'lon': -43.9345},
    'Boa Vista': {'lat': 2.8197, 'lon': -60.6714},
    'Brasília': {'lat': -15.7942, 'lon': -47.8822},
    'Campo Grande': {'lat': -20.4428, 'lon': -54.6464},
    'Cuiabá': {'lat': -15.6014, 'lon': -56.0979},
    'Curitiba': {'lat': -25.4284, 'lon': -49.2733},
    'Florianópolis': {'lat': -27.5954, 'lon': -48.5480},
    'Fortaleza': {'lat': -3.7172, 'lon': -38.5433},
    'Goiânia': {'lat': -16.6864, 'lon': -49.2643},
    'João Pessoa': {'lat': -7.1150, 'lon': -34.8631},
    'Macapá': {'lat': 0.0349, 'lon': -51.0694},
    'Maceió': {'lat': -9.5713, 'lon': -36.7820},
    'Manaus': {'lat': -3.1190, 'lon': -60.0217},
    'Natal': {'lat': -5.7945, 'lon': -35.2110},
    'Palmas': {'lat': -10.1844, 'lon': -48.3336},
    'Porto Alegre': {'lat': -30.0346, 'lon': -51.2177},
    'Porto Velho': {'lat': -8.7619, 'lon': -63.9039},
    'Recife': {'lat': -8.0476, 'lon': -34.8770},
    'Rio Branco': {'lat': -9.9747, 'lon': -67.8100},
    'Rio de Janeiro': {'lat': -22.9068, 'lon': -43.1729},
    'Salvador': {'lat': -12.9714, 'lon': -38.5014},
    'São Luís': {'lat': -2.5387, 'lon': -44.2825},
    'São Paulo': {'lat': -23.5505, 'lon': -46.6333},
    'Teresina': {'lat': -5.0892, 'lon': -42.8019},
    'Vitória': {'lat': -20.3155, 'lon': -40.3128},
}


def fetch_from_open_meteo(city: str, lat: float, lon: float) -> Dict[str, any]:
    """
    Obtém dados climáticos da API Open-Meteo para uma cidade específica.
    
    Args:
        city: Nome da cidade
        lat: Latitude
        lon: Longitude
    
    Returns:
        dict: Dados normalizados com timestamp, temperature, humidity, city
    """
    logger.info(f"[collector] Coletando dados para {city}...")
    
    # Se não houver chave, usar dados mock
    if not OPENWEATHER_KEY:
        logger.warning(f"[collector] OPENWEATHER_KEY não fornecida, usando dados mock para {city}")
        return {
            "timestamp": datetime.now(UTC).isoformat().replace('+00:00', 'Z'),
            "temperature": 25.5,
            "humidity": 70.0,
            "city": city
        }
    
    try:
        # Chamada para Open-Meteo (API gratuita, não requer chave)
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m",
            "timezone": "America/Sao_Paulo"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        current = data.get('current', {})
        
        payload = {
            "timestamp": datetime.now(UTC).isoformat().replace('+00:00', 'Z'),
            "temperature": current.get('temperature_2m', 0),
            "humidity": current.get('relative_humidity_2m', 0),
            "city": city
        }
        
        logger.info(f"[collector] Dados coletados para {city}: temp={payload['temperature']}°C, humidity={payload['humidity']}%")
        return payload
        
    except Exception as e:
        logger.error(f"[collector] Erro ao buscar dados da API para {city}: {e}")
        # Retornar dados mock em caso de erro
        return {
            "timestamp": datetime.now(UTC).isoformat().replace('+00:00', 'Z'),
            "temperature": 25.0,
            "humidity": 65.0,
            "city": city
        }


def fetch_all_capitals() -> List[Dict[str, any]]:
    """
    Coleta dados climáticos para todas as capitais brasileiras.
    
    Returns:
        Lista de payloads normalizados, um para cada capital
    """
    logger.info("[collector] Iniciando coleta de dados para todas as capitais brasileiras...")
    all_payloads = []
    
    for city, coords in CAPITAL_COORDINATES.items():
        try:
            payload = fetch_from_open_meteo(city, coords['lat'], coords['lon'])
            all_payloads.append(payload)
            # Pequeno delay entre requisições para evitar rate limiting
            time.sleep(0.5)
        except Exception as e:
            logger.error(f"[collector] Erro ao coletar dados para {city}: {e}")
            # Continuar com próxima cidade mesmo em caso de erro
    
    logger.info(f"[collector] Coleta concluída: {len(all_payloads)} capitais processadas")
    return all_payloads


def normalize_payload(raw: Dict) -> Dict:
    """
    Normaliza o payload para o formato esperado pelo backend.
    
    Esta função garante que os dados coletados da API externa (Open-Meteo)
    estejam no formato correto antes de serem enviados:
    - Converte temperature e humidity para float (garante tipo numérico)
    - Preserva timestamp e city como recebidos
    - Usa valores padrão (0) se campos numéricos estiverem ausentes
    
    Decisão de design: Normalização separada permite:
    - Validar dados antes do envio
    - Facilitar mudanças futuras no formato da API externa
    - Manter compatibilidade com diferentes fontes de dados
    
    Args:
        raw: Dados brutos da API
        
    Returns:
        dict: Payload normalizado no formato {timestamp, temperature, humidity, city}
    """
    return {
        "timestamp": raw.get("timestamp"),
        "temperature": float(raw.get("temperature", 0)),
        "humidity": float(raw.get("humidity", 0)),
        "city": raw.get("city")
    }


def post_direct(payload: Dict) -> bool:
    """
    Envia dados diretamente para o backend via HTTP POST.
    
    Args:
        payload: Dados a serem enviados
        
    Returns:
        bool: True se sucesso, False caso contrário
    """
    # Remover barra final se existir antes de adicionar o path
    base_url = BACKEND_URL.rstrip('/')
    url = f"{base_url}/weather/logs"
    
    try:
        logger.info(f"[collector] Enviando dados para {url}")
        response = requests.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        response.raise_for_status()
        logger.info(f"[collector] Dados enviados com sucesso (status {response.status_code})")
        return True
        
    except requests.exceptions.ConnectionError as e:
        error_msg = str(e)
        if "getaddrinfo failed" in error_msg or "Name or service not known" in error_msg:
            logger.error(f"[collector] Erro de DNS: Não foi possível resolver o hostname do backend")
            logger.error(f"[collector] Verifique se BACKEND_URL está correto: {BACKEND_URL}")
            logger.error(f"[collector] Se estiver rodando localmente, use 'localhost' em vez do nome do serviço Docker")
        else:
            logger.error(f"[collector] Erro de conexão ao backend: {e}")
        return False
    except requests.exceptions.RequestException as e:
        logger.error(f"[collector] Erro ao enviar dados para backend: {e}")
        return False


class RabbitMQConnection:
    """
    Gerencia uma conexão persistente com RabbitMQ para reutilização.
    Evita abrir/fechar conexões a cada mensagem, reduzindo overhead e logs.
    """
    def __init__(self, rabbitmq_url: str):
        self.rabbitmq_url = rabbitmq_url
        self.connection = None
        self.channel = None
        self._is_connected = False
    
    def connect(self) -> bool:
        """
        Estabelece conexão com RabbitMQ.
        
        Returns:
            bool: True se conexão bem-sucedida, False caso contrário
        """
        if self._is_connected and self.connection and not self.connection.is_closed:
            return True
        
        try:
            logger.info(f"[collector] Conectando ao RabbitMQ...")
            params = pika.URLParameters(self.rabbitmq_url)
            self.connection = pika.BlockingConnection(params)
            self.channel = self.connection.channel()
            
            # Declarar fila (durable para persistência)
            self.channel.queue_declare(queue='weather', durable=True)
            
            self._is_connected = True
            logger.info(f"[collector] Conectado ao RabbitMQ com sucesso")
            return True
            
        except (pika.exceptions.AMQPConnectionError, OSError, Exception) as e:
            error_msg = str(e)
            error_type = type(e).__name__
            
            # Detectar erros de DNS/resolução de hostname
            if "getaddrinfo failed" in error_msg or "Name or service not known" in error_msg:
                logger.error(f"[collector] Erro de DNS: Não foi possível resolver o hostname do RabbitMQ")
                logger.error(f"[collector] Verifique se RABBITMQ_URL está correto")
                logger.error(f"[collector] Se estiver rodando localmente, use 'localhost' em vez do nome do serviço Docker")
            else:
                logger.error(f"[collector] Erro ao conectar ao RabbitMQ: {error_type}: {error_msg}")
            
            self._is_connected = False
            self.connection = None
            self.channel = None
            return False
    
    def publish(self, payload: Dict) -> bool:
        """
        Publica uma mensagem na fila RabbitMQ.
        Reconecta automaticamente se a conexão estiver fechada.
        
        Args:
            payload: Dados a serem publicados
            
        Returns:
            bool: True se sucesso, False caso contrário
        """
        # Tentar reconectar se necessário
        if not self._is_connected or not self.connection or self.connection.is_closed:
            if not self.connect():
                return False
        
        try:
            message = json.dumps(payload)
            self.channel.basic_publish(
                exchange='',
                routing_key='weather',
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Tornar mensagem persistente
                )
            )
            return True
            
        except (pika.exceptions.AMQPConnectionError, pika.exceptions.AMQPChannelError, OSError) as e:
            logger.warning(f"[collector] Erro ao publicar mensagem, tentando reconectar: {e}")
            self._is_connected = False
            
            # Tentar reconectar uma vez
            if self.connect():
                try:
                    message = json.dumps(payload)
                    self.channel.basic_publish(
                        exchange='',
                        routing_key='weather',
                        body=message,
                        properties=pika.BasicProperties(
                            delivery_mode=2,
                        )
                    )
                    return True
                except Exception as retry_error:
                    logger.error(f"[collector] Falha ao publicar após reconexão: {retry_error}")
                    return False
            else:
                return False
        except Exception as e:
            logger.error(f"[collector] Erro inesperado ao publicar: {e}")
            return False
    
    def close(self):
        """Fecha a conexão com RabbitMQ."""
        try:
            if self.channel and not self.channel.is_closed:
                self.channel.close()
            if self.connection and not self.connection.is_closed:
                self.connection.close()
            logger.info(f"[collector] Conexão RabbitMQ fechada")
        except Exception as e:
            logger.warning(f"[collector] Erro ao fechar conexão RabbitMQ: {e}")
        finally:
            self._is_connected = False
            self.connection = None
            self.channel = None


# Instância global da conexão (será inicializada no main)
_rabbitmq_connection: Optional[RabbitMQConnection] = None


def publish_to_rabbit(payload: Dict) -> bool:
    """
    Publica dados na fila RabbitMQ 'weather' usando conexão persistente.
    
    Args:
        payload: Dados a serem publicados
        
    Returns:
        bool: True se sucesso, False caso contrário
    """
    global _rabbitmq_connection
    
    if not _rabbitmq_connection:
        _rabbitmq_connection = RabbitMQConnection(RABBITMQ_URL)
    
    return _rabbitmq_connection.publish(payload)


def main():
    """
    Loop principal de coleta de dados.
    Coleta dados para todas as capitais brasileiras.
    """
    global _rabbitmq_connection
    
    logger.info("[collector] Iniciando collector...")
    logger.info(f"[collector] Modo: {COLLECTOR_MODE}")
    logger.info(f"[collector] Intervalo de coleta: {COLLECT_INTERVAL} segundos")
    logger.info(f"[collector] Coletando dados para {len(CAPITAL_COORDINATES)} capitais brasileiras")
    
    # Validar configuração
    if COLLECTOR_MODE not in ['direct', 'rabbit']:
        logger.error(f"[collector] Modo inválido: {COLLECTOR_MODE}. Use 'direct' ou 'rabbit'")
        return
    
    if COLLECTOR_MODE == 'rabbit':
        if not RABBITMQ_URL:
            logger.error("[collector] RABBITMQ_URL não configurada!")
            return
        # Inicializar conexão RabbitMQ persistente
        _rabbitmq_connection = RabbitMQConnection(RABBITMQ_URL)
        if not _rabbitmq_connection.connect():
            logger.error("[collector] Falha ao conectar ao RabbitMQ. Encerrando...")
            return
    else:
        logger.info(f"[collector] Backend URL: {BACKEND_URL}")
        if not BACKEND_URL:
            logger.error("[collector] BACKEND_URL não configurada!")
            return
    
    try:
        while True:
            try:
                # Coletar dados para todas as capitais
                all_payloads = fetch_all_capitals()
                
                # Enviar dados de cada capital
                success_count = 0
                for idx, payload in enumerate(all_payloads):
                    normalized = normalize_payload(payload)
                    
                    # Enviar dados conforme o modo configurado
                    if COLLECTOR_MODE == 'rabbit':
                        success = publish_to_rabbit(normalized)
                    else:
                        success = post_direct(normalized)
                        # Adicionar delay entre requisições no modo direct para evitar rate limiting
                        # Delay de 0.5 segundos entre requisições (exceto na última)
                        if idx < len(all_payloads) - 1:
                            time.sleep(0.5)
                    
                    if success:
                        success_count += 1
                    else:
                        logger.warning(f"[collector] Falha ao enviar dados para {normalized.get('city', 'cidade desconhecida')}, mas continuando...")
                
                logger.info(f"[collector] Enviados {success_count}/{len(all_payloads)} registros com sucesso")
                
                # Aguardar intervalo antes da próxima coleta
                logger.info(f"[collector] Aguardando {COLLECT_INTERVAL} segundos até próxima coleta...")
                time.sleep(COLLECT_INTERVAL)
                
            except KeyboardInterrupt:
                logger.info("[collector] Interrompido pelo usuário")
                break
            except Exception as e:
                logger.error(f"[collector] Erro inesperado: {e}")
                logger.info(f"[collector] Aguardando {COLLECT_INTERVAL} segundos antes de tentar novamente...")
                time.sleep(COLLECT_INTERVAL)
    finally:
        # Fechar conexão RabbitMQ ao encerrar
        if _rabbitmq_connection:
            _rabbitmq_connection.close()


if __name__ == "__main__":
    main()

