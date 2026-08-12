from app.tasks.notifications import send_email_task


def send_password_reset_email(email: str) -> None:
    send_email_task.delay(
        to=email,
        subject="FitForge password reset",
        body="Use the link to reset your password.",
    )


def send_workout_reminder(email: str, workout_name: str) -> None:
    send_email_task.delay(
        to=email,
        subject="FitForge workout reminder",
        body=f"Don't forget your scheduled workout: {workout_name}",
    )