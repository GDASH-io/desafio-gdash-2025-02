"""
Logger estruturado para o collector.
"""
import json
import logging
import sys
from datetime import datetime
from typing import Any, Dict
from src.shared.config import Config


class StructuredFormatter(logging.Formatter):
    """Formatter que gera logs em formato JSON."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "service": "collector-openweather",
            "message": record.getMessage(),
        }
        
        # Adicionar contexto se existir
        if hasattr(record, "context"):
            log_data["context"] = record.context
        
        # Adicionar campos extras
        if hasattr(record, "extra_fields"):
            log_data.update(record.extra_fields)
        
        # Adicionar exception se existir
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data, ensure_ascii=False)


def setup_logger() -> logging.Logger:
    """Configura e retorna o logger estruturado."""
    logger = logging.getLogger("collector")
    logger.setLevel(getattr(logging, Config.LOG_LEVEL.upper(), logging.INFO))
    
    # Remover handlers existentes
    logger.handlers.clear()
    
    # Handler para stdout
    handler = logging.StreamHandler(sys.stdout)
    
    if Config.LOG_FORMAT == "json":
        handler.setFormatter(StructuredFormatter())
    else:
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
        )
    
    logger.addHandler(handler)
    return logger

