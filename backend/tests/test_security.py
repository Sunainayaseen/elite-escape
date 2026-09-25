"""Regression tests for the security review fixes."""

from app.config import settings
from app.core import notify


def _honeypot_payload():
    # The honeypot branch returns before touching the database, but the rate limiter runs first,
    # so this exercises the limiter without needing packages or a real inquiry.
    return {"name": "Bot", "email": "bot@example.com", "message": "hello", "website": "spam"}


def test_rate_limit_ignores_spoofed_forwarded_for(client):
    """A caller that can reach the API directly must not dodge the limit by rotating X-Forwarded-For."""
    statuses = [
        client.post(
            "/api/inquiries",
            json=_honeypot_payload(),
            headers={"X-Forwarded-For": f"203.0.113.{i}"},
        ).status_code
        for i in range(12)
    ]
    assert 429 in statuses, "rotating X-Forwarded-For bypassed the rate limit"
    assert statuses.index(429) <= 8


def test_staff_email_subject_is_single_line(monkeypatch):
    """A visitor name with a line break must not make the notification fail or add headers."""
    sent = []

    class FakeSMTP:
        def __init__(self, *args, **kwargs):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

        def starttls(self):
            pass

        def login(self, *args):
            pass

        def send_message(self, msg):
            sent.append(msg)

    monkeypatch.setattr(settings, "smtp_host", "smtp.test")
    monkeypatch.setattr(settings, "notify_email", "staff@test.example")
    monkeypatch.setattr(notify.smtplib, "SMTP", FakeSMTP)

    notify.send_staff_email("New enquiry from Ali\r\nBcc: attacker@example.com", "body")

    assert len(sent) == 1, "the notification was dropped"
    subject = sent[0]["Subject"]
    assert "\n" not in subject and "\r" not in subject
    assert sent[0]["Bcc"] is None
