import os

REDIS_CONFIG = {
  "host": os.getenv("REDIS_HOST", "localhost"),
  "password": os.getenv("REDIS_PASSWORD", None),
  "port": int(os.getenv("REDIS_PORT", 6379)),
  "db": int(os.getenv("REDIS_DB", 0)),
  "decode_responses": True,
}

if REDIS_CONFIG["password"] == None:
  raise Exception("Erro ao carregar senha do redis!\nEncerrando...")

API_URL = os.getenv("API_URL")
API_KEY = os.getenv("API_KEY")
CITY = os.getenv("CITY")