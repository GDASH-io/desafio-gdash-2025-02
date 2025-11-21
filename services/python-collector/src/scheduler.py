from apscheduler.schedulers.background import BackgroundScheduler
import time
from src.queue_sender import connect_rmq, publish_message 


def main():
    conn, ch = connect_rmq()
    publish_message(ch)
    conn.close()


scheduler = BackgroundScheduler()
scheduler.add_job(main, "interval", hours=1)
scheduler.start()

try:
    while True:
        time.sleep(2)
except (KeyboardInterrupt, SystemExit):
    scheduler.shutdown()