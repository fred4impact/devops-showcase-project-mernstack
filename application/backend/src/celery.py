from celery import Celery
import os

# Create Celery app
app = Celery('ticketnow')

# Configure Celery
app.conf.update(
    broker_url=os.getenv('REDIS_URL', 'redis://:redis123@localhost:6379/0'),
    result_backend=os.getenv('REDIS_URL', 'redis://:redis123@localhost:6379/0'),
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Import tasks
from .tasks import *
