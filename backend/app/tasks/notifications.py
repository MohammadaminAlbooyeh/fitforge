import smtplib
from email.mime.text import MIMEText

from app.config import get_settings
from app.core.celery_app import celery_app


@celery_app.task(name="app.tasks.notifications.send_email")
def send_email_task(to: str, subject: str, body: str) -> None:
    settings = get_settings()
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["To"] = to
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
        smtp.sendmail(settings.SMTP_USER, [to], msg.as_string())