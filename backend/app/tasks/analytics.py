from app.core.celery_app import celery_app


@celery_app.task(name="app.tasks.analytics.compute_user_stats")
def compute_user_stats(user_id: int) -> dict:
    return {"user_id": user_id, "status": "computed"}


@celery_app.task(name="app.tasks.analytics.generate_progress_report")
def generate_progress_report(user_id: int) -> dict:
    return {"user_id": user_id, "report": "generated"}