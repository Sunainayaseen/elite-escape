import logging
import smtplib
from email.message import EmailMessage

from app.config import settings

logger = logging.getLogger("eliteescape.mailer")


def send_email(to: str, subject: str, body: str) -> bool:
    """Send a plain-text email. Returns False (never raises) when SMTP is unconfigured or fails, so
    callers can keep their response identical whether or not the address exists."""
    if not settings.smtp_host:
        return False
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from or settings.smtp_user or settings.notify_email
    msg["To"] = to
    msg.set_content(body)
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            server.starttls()
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        return True
    except Exception:
        logger.exception("Failed to send email")
        return False
