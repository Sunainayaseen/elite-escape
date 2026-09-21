import logging
import smtplib
from email.message import EmailMessage

from app.config import settings

logger = logging.getLogger("eliteescape.notify")


def send_staff_email(subject: str, body: str) -> None:
    """Email the agency about a new lead. No-op unless SMTP_HOST and NOTIFY_EMAIL are configured.
    Runs as a background task, so failures are logged and never surface to the visitor."""
    if not settings.smtp_host or not settings.notify_email:
        return
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from or settings.smtp_user or settings.notify_email
    msg["To"] = settings.notify_email
    msg.set_content(body)
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            server.starttls()
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
    except Exception:
        logger.exception("Failed to send notification email")
