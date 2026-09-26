"""Check the SMTP settings by sending one test email, and say plainly what went wrong if it fails.

    python -m app.send_test_email --to manager@eliteescapetourism.com

Uses the same SMTP_* values (from the environment or backend/.env) and the same STARTTLS connection
as enquiry notifications and password-reset emails. With no --to it sends to NOTIFY_EMAIL.
"""

import argparse
import smtplib
import socket
import sys
from email.message import EmailMessage

from app.config import settings


def main() -> int:
    parser = argparse.ArgumentParser(description="Send a test email with the configured SMTP settings.")
    parser.add_argument("--to", default=settings.notify_email, help="recipient (default: NOTIFY_EMAIL)")
    args = parser.parse_args()

    missing = [
        name
        for name, value in [("SMTP_HOST", settings.smtp_host), ("SMTP_USER", settings.smtp_user)]
        if not value
    ]
    if missing:
        print(f"Not configured: {', '.join(missing)} is empty.")
        return 1
    if not args.to:
        print("No recipient: pass --to or set NOTIFY_EMAIL.")
        return 1

    sender = settings.smtp_from or settings.smtp_user
    print(f"Connecting to {settings.smtp_host}:{settings.smtp_port} as {settings.smtp_user} ...")

    msg = EmailMessage()
    msg["Subject"] = "Elite Escape website: SMTP test"
    msg["From"] = sender
    msg["To"] = args.to
    msg.set_content(
        "This is a test from the Elite Escape website server.\n\n"
        "If you can read it, enquiry notifications and admin password-reset emails will be delivered."
    )

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
    except smtplib.SMTPAuthenticationError:
        print("FAILED: the mailbox rejected SMTP_USER / SMTP_PASSWORD. Check the password, and that the")
        print("mailbox is not suspended in hPanel.")
        return 1
    except (socket.gaierror, ConnectionRefusedError, TimeoutError, OSError) as exc:
        print(f"FAILED: could not reach {settings.smtp_host}:{settings.smtp_port} ({exc}).")
        print("Check SMTP_HOST, and that port 587 is open for outgoing traffic on this server.")
        return 1
    except smtplib.SMTPException as exc:
        print(f"FAILED: the mail server refused the message: {exc}")
        return 1

    print(f"Sent. Check the inbox (and spam folder) of {args.to}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
