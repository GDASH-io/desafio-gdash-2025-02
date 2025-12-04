import time
import importlib
try:
    schedule = importlib.import_module("schedule")
except Exception:
    schedule = None
from datetime import datetime
from src.config import Config
from src.weather_api import WeatherAPI
from src.queue_publisher import QueuePublisher

class WeatherCollector:
    """Orquestrador para coleta e publicação de dados meteorológicos."""

    def __init__(self):
        self.weather_api = WeatherAPI()
        self.queue_publisher = QueuePublisher()
        self.is_running = False
        if not self.queue_publisher.connect():
            print("❌ Canal não está aberto. Conecte-se ao RabbitMQ primeiro.")

    def collect_and_publish(self):
        """Coleta dados meteorológicos e publica na fila RabbitMQ."""
        try:
            print("\n" + "=" * 60)
            print(f"🕧 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} Iniciando coleta...")
            print("=" * 60)

            # 1 Buscar dados do clima
            weather_data = self.weather_api.fetch_current_weather()

            if not weather_data:
                print("❌ Falha ao obter dados meteorológicos. Tentando novamente na próxima execução.")
                return

            # 2 Publicar dados na fila RabbitMQ
            if not isinstance(weather_data, dict):
                print("❌ Dados meteorológicos inválidos (não é um dicionário).")
                return
            
            success = self.queue_publisher.publish_message(weather_data)

            if success:
                print("✅ Dados meteorológicos publicados com sucesso na fila RabbitMQ.")
            else:
                print("❌ Falha ao publicar dados na fila RabbitMQ.")

            print("=" * 60)

        except Exception as e:
            print(f"❌ Erro durante a coleta e publicação: {e}")

    def start(self):
        """Inicia o processo de coleta e publicação em intervalos regulares."""
        print("\n")
        print("=" * 60)
        print("🚀 Iniciando o Coletor de Dados Meteorológicos...")
        print("=" * 60)

        # Call Config.display() if it exists (safe)
        display_fn = getattr(Config, "display", None)
        if callable(display_fn):
            try:
                display_fn()
            except Exception as e:
                print(f"⚠️ Erro ao exibir configuração: {e}")

        # Conecta ao RabbitMQ
        if not self.queue_publisher.connect():
            print("❌ Falha ao conectar ao RabbitMQ. Encerrando o coletor.")
            return

        # Executa imediatamente a primeira coleta
        print("⏱️ Executando a primeira coleta imediatamente...")
        self.collect_and_publish()

        # Agenda coletas regulares
        interval = getattr(Config, "COLLECTION_INTERVAL_MINUTES", 5)

        if schedule is not None:
            schedule.every(interval).minutes.do(self.collect_and_publish)
            print(f"⏰ Agendado para coletar dados a cada {interval} minutos.")
            print("💡 Pressione Ctrl+C para interromper o coletor.\n"
                  "=============================================================")

            self.is_running = True

            # loop principal com agendamento
            try:
                while self.is_running:
                    schedule.run_pending()
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n🛑 Coletor interrompido pelo usuário. Encerrando")
                self.stop()
        else:
            # fallback simples caso a biblioteca schedule não esteja instalada
            print(f"⚠️ Biblioteca 'schedule' não encontrada; usando loop simples a cada {interval} minutos.")
            print("💡 Pressione Ctrl+C para interromper o coletor.\n"
                  "=============================================================")

            self.is_running = True
            try:
                while self.is_running:
                    time.sleep(interval * 60)
                    self.collect_and_publish()
            except KeyboardInterrupt:
                print("\n🛑 Coletor interrompido pelo usuário. Encerrando")
                self.stop()

    def stop(self):
        """Parar o coletor de dados meteorológicos e fechar conexões."""
        self.is_running = False
        print("🔒 Fechando conexões...")
        # Fechar conexão se existir
        conn = getattr(self.queue_publisher, "connection", None)
        try:
            if conn is not None:
                conn.close()
                print("✅ Conexão com RabbitMQ fechada.")
        except Exception as e:
            print(f"⚠️ Erro ao fechar conexão: {e}")


def main():
    """Função principal para iniciar o coletor de dados meteorológicos."""
    collector = WeatherCollector()
    collector.start()


if __name__ == "__main__":
    main()