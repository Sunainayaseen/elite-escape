"""The SMTP check command reports success and each kind of failure clearly."""

import smtplib

from app import send_test_email
from app.config import settings


def _configure(monkeypatch):
    monkeypatch.setattr(settings, "smtp_host", "smtp.test")
    monkeypatch.setattr(settings, "smtp_port", 587)
    monkeypatch.setattr(settings, "smtp_user", "website@example.com")
    monkeypatch.setattr(settings, "smtp_password", "secret")
    monkeypatch.setattr(settings, "smtp_from", "")
    monkeypatch.setattr(settings, "notify_email", "team@example.com")


def _fake_smtp(sent, fail_login=False):
    class FakeSMTP:
        def __init__(self, *args, **kwargs):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

        def starttls(self):
            pass

        def login(self, user, password):
            if fail_login:
                raise smtplib.SMTPAuthenticationError(535, b"bad credentials")

        def send_message(self, msg):
            sent.append(msg)

    return FakeSMTP


def test_sends_to_notify_email_by_default(monkeypatch, capsys):
    _configure(monkeypatch)
    sent = []
    monkeypatch.setattr(send_test_email.smtplib, "SMTP", _fake_smtp(sent))
    monkeypatch.setattr("sys.argv", ["send_test_email"])

    assert send_test_email.main() == 0
    assert sent[0]["To"] == "team@example.com"
    assert sent[0]["From"] == "website@example.com"
    assert "Sent." in capsys.readouterr().out


def test_reports_rejected_password(monkeypatch, capsys):
    _configure(monkeypatch)
    monkeypatch.setattr(send_test_email.smtplib, "SMTP", _fake_smtp([], fail_login=True))
    monkeypatch.setattr("sys.argv", ["send_test_email", "--to", "x@example.com"])

    assert send_test_email.main() == 1
    assert "rejected SMTP_USER / SMTP_PASSWORD" in capsys.readouterr().out


def test_reports_missing_settings(monkeypatch, capsys):
    _configure(monkeypatch)
    monkeypatch.setattr(settings, "smtp_host", "")
    monkeypatch.setattr("sys.argv", ["send_test_email"])

    assert send_test_email.main() == 1
    assert "SMTP_HOST is empty" in capsys.readouterr().out
