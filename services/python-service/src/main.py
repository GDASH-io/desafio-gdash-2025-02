from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import time
from src.queue_sender import connect_rmq, publish_message


def main():
    conn, channel = connect_rmq()
    publish_message(channel)
    conn.close()

scheduler = BackgroundScheduler()
scheduler.add_job(main, "interval", hours=1, next_run_time=datetime.now())
scheduler.start()
try:
    while True:
        time.sleep(2)
except (KeyboardInterrupt, SystemExit):
    scheduler.shutdown()

if __name__ == "__main__":
    main()