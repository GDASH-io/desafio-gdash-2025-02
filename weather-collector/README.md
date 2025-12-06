# 🌤️ Weather Collector - Coletor de Dados Climáticos

## 📁 Estrutura do Projeto

```
weather-collector/
├── main.py                    # Entry point da aplicação
├── requirements.txt           # Dependências Python
├── Dockerfile                # Configuração Docker
│
└── src/                      # Código fonte organizado
    ├── __init__.py
    │
    ├── config/               # Configurações
    │   ├── __init__.py
    │   └── settings.py       # Classes de configuração
    │
    ├── services/             # Serviços de negócio
    │   ├── __init__.py
    │   ├── weather_service.py    # Coleta de dados climáticos
    │   └── queue_service.py     # Comunicação com RabbitMQ
    │
    └── utils/                # Utilitários
        ├── __init__.py
        └── logger.py         # Configuração de logging
```

## 🎯 Responsabilidades

### **WeatherService**
- Coleta dados climáticos da API Open-Meteo
- Normaliza dados para formato padrão
- Processa previsões horárias

### **QueueService**
- Gerencia conexão com RabbitMQ
- Envia mensagens para a fila
- Implementa retry automático

### **Config (Settings)**
- Centraliza todas as configurações
- Carrega variáveis de ambiente
- Define valores padrão

## 🔧 Configuração

Variáveis de ambiente (`.env`):
```env
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASS=admin123
RABBITMQ_QUEUE=weather_data
COLLECTION_INTERVAL=3600
LATITUDE=-23.5505
LONGITUDE=-46.6333
CITY_NAME=São Paulo
```

## 🚀 Execução

```bash
# Local
python main.py

# Docker
docker-compose up weather-collector
```

## 📝 Boas Práticas Implementadas

✅ Separação de responsabilidades  
✅ Classes de configuração centralizadas  
✅ Tratamento de erros robusto  
✅ Logging estruturado  
✅ Retry automático para conexões  
✅ Type hints para melhor legibilidade  
✅ Documentação com docstrings  

