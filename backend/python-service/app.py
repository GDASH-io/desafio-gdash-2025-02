from config import REDIS_CONFIG, CITY
import redis
import json
from worker import start
import time
import schedule
from datetime import datetime
import pytz

state = {
  "lastDailyData": None
}

if __name__ == "__main__":
  pool = redis.ConnectionPool(**REDIS_CONFIG)
  message_broker = redis.Redis(connection_pool=pool)

  # testa a conexao
  try:
    message_broker.ping()
    message_broker.close() # fecha conexao depois de testar
  except redis.ConnectionError as e:
    print("Erro ao tentar conexão com redis:",e)
    print("Encerrando...")
    exit()
  

  def main() :
    needDaily = False
    if state["lastDailyData"] != datetime.now(pytz.timezone("America/Sao_Paulo")).date():
      needDaily = True
      state["lastDailyData"] = datetime.now(pytz.timezone("America/Sao_Paulo")).date()
    weather_data = start(CITY, needDaily)
    # publica os dados via Redis Streams
    message_broker.xadd("weather:data",{"weatherData": json.dumps(weather_data)})
    print("Dados publicados no redis")
    print("Próxima consulta em 30 minutos...")
  
  # consulta o clima a cada 1 hora
  main()
  schedule.every(1800).seconds.do(main)

  while True:
    schedule.run_pending()
    time.sleep(1)
