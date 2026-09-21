from datetime import timedelta

import pytest

from app.core.cms_config import cms
from app.core.security import hash_token
from app.core.timeutil import utcnow
from app.models.admin_session import AdminSession
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.routers import auth as auth_router
from tests.conftest import login

PROTECTED_GET = [
    "/api/admin/me",
    "/api/admin/stats",
    "/api/admin/packages",
    "/api/admin/destinations",
    "/api/admin/visa",
    "/api/admin/visa-countries",
    "/api/admin/inquiries",
    "/api/admin/blog",
    "/api/admin/blog-categories",
    "/api/admin/media",
    "/api/admin/settings",
    "/api/admin/categories",
    "/api/admin/subscribers",
]


def test_every_admin_endpoint_requires_a_session(client, seeded):
    for path in PROTECTED_GET:
        assert client.get(path).status_code == 401, path
    writes = [
        ("post", "/api/admin/packages"),
        ("post", "/api/admin/destinations"),
        ("post", "/api/admin/visa"),
        ("post", "/api/admin/blog"),
        ("post", "/api/admin/media"),
        ("put", "/api/admin/settings"),
        ("put", "/api/admin/inquiries/00000000-0000-0000-0000-000000000000"),
        ("delete", "/api/admin/packages/00000000-0000-0000-0000-000000000000"),
    ]
    for method, path in writes:
        assert client.request(method.upper(), path, json={}).status_code == 401, (method, path)


def test_login_sets_httponly_cookie_and_returns_csrf(client, seeded):
    res = client.post("/api/admin/login", json={"email": "ADMIN@test.com", "password": "Password123"})
    assert res.status_code == 200
    body = res.json()
    assert body["user"]["email"] == "admin@test.com" and body["user"]["role"] == "admin"
    assert "password" not in res.text and "hashed" not in res.text
    cookie = res.headers["set-cookie"].lower()
    assert cms.session_cookie_name in cookie
    assert "httponly" in cookie and "samesite=lax" in cookie
    assert client.get("/api/admin/me").json()["csrf_token"] == body["csrf_token"]


def test_only_a_hash_of_the_session_token_is_stored(client, seeded, db_session):
    login(client, "admin@test.com")
    raw = client.cookies.get(cms.session_cookie_name)
    stored = db_session.query(AdminSession).one()
    assert raw and stored.token_hash == hash_token(raw) and stored.token_hash != raw


def test_bad_credentials_are_indistinguishable(client, seeded):
    unknown = client.post("/api/admin/login", json={"email": "nobody@test.com", "password": "Password123"})
    wrong = client.post("/api/admin/login", json={"email": "admin@test.com", "password": "wrong-password1"})
    assert unknown.status_code == wrong.status_code == 401
    assert unknown.json() == wrong.json()
    assert cms.session_cookie_name not in unknown.headers.get("set-cookie", "")


def test_login_is_rate_limited(client, seeded):
    codes = [
        client.post("/api/admin/login", json={"email": "nobody@test.com", "password": "bad"}).status_code
        for _ in range(12)
    ]
    assert codes[:10] == [401] * 10
    assert 429 in codes[10:]


def test_account_locks_after_repeated_failures(client, seeded, db_session):
    for _ in range(cms.max_failed_logins):
        assert client.post("/api/admin/login", json={"email": "admin@test.com", "password": "nope-nope1"}).status_code == 401
    # Even the right password is refused while locked, with the same generic answer.
    locked = client.post("/api/admin/login", json={"email": "admin@test.com", "password": "Password123"})
    assert locked.status_code == 401
    user = db_session.query(User).filter(User.email == "admin@test.com").one()
    assert user.locked_until is not None
    user.locked_until = utcnow() - timedelta(minutes=1)
    db_session.commit()
    assert client.post("/api/admin/login", json={"email": "admin@test.com", "password": "Password123"}).status_code == 200


def test_writes_need_the_csrf_token(client, admin_headers):
    body = {"name": "Nope"}
    assert client.post("/api/admin/destinations", json=body).status_code == 403
    assert client.post("/api/admin/destinations", json=body, headers={"X-CSRF-Token": "wrong"}).status_code == 403
    assert client.post("/api/admin/destinations", json=body, headers=admin_headers).status_code == 201
    # Reads never need it.
    assert client.get("/api/admin/destinations").status_code == 200


def test_cross_site_origin_is_rejected(client, admin_headers):
    evil = {**admin_headers, "Origin": "https://evil.example"}
    assert client.post("/api/admin/destinations", json={"name": "X"}, headers=evil).status_code == 403
    assert client.post("/api/admin/login", json={"email": "admin@test.com", "password": "Password123"}, headers={"Origin": "https://evil.example"}).status_code == 403
    ok = {**admin_headers, "Origin": "http://localhost:3000"}
    assert client.post("/api/admin/destinations", json={"name": "Fine"}, headers=ok).status_code == 201


def test_logout_revokes_the_session_server_side(client, admin_headers, db_session):
    stolen_cookie = client.cookies.get(cms.session_cookie_name)
    assert client.post("/api/admin/logout", headers=admin_headers).status_code == 200
    assert db_session.query(AdminSession).count() == 0
    assert client.get("/api/admin/me").status_code == 401
    # Replaying the old cookie no longer works, even though the browser copy was cleared.
    client.cookies.set(cms.session_cookie_name, stolen_cookie)
    assert client.get("/api/admin/me").status_code == 401
    assert client.post("/api/admin/logout").status_code == 200  # tolerant when already signed out


def test_sessions_expire(client, admin_headers, db_session):
    session = db_session.query(AdminSession).one()
    session.last_seen_at = utcnow() - timedelta(minutes=cms.session_idle_minutes + 5)
    db_session.commit()
    assert client.get("/api/admin/me").status_code == 401
    assert db_session.query(AdminSession).count() == 0

    login(client, "admin@test.com")
    session = db_session.query(AdminSession).one()
    session.expires_at = utcnow() - timedelta(seconds=1)
    db_session.commit()
    assert client.get("/api/admin/me").status_code == 401


def test_disabled_user_loses_access(client, admin_headers, db_session):
    user = db_session.query(User).filter(User.email == "admin@test.com").one()
    user.is_active = False
    db_session.commit()
    assert client.get("/api/admin/me").status_code == 401


def test_change_password_rules_and_other_sessions_signed_out(client, seeded, db_session):
    headers = login(client, "admin@test.com")
    other = client.__class__(client.app)  # a second browser
    login(other, "admin@test.com")
    assert db_session.query(AdminSession).count() == 2

    weak = client.post("/api/admin/change-password", headers=headers, json={"current_password": "Password123", "new_password": "short1"})
    assert weak.status_code == 422
    wrong = client.post("/api/admin/change-password", headers=headers, json={"current_password": "nope", "new_password": "NewPassword456"})
    assert wrong.status_code == 400
    same = client.post("/api/admin/change-password", headers=headers, json={"current_password": "Password123", "new_password": "Password123"})
    assert same.status_code == 400

    ok = client.post("/api/admin/change-password", headers=headers, json={"current_password": "Password123", "new_password": "NewPassword456"})
    assert ok.status_code == 200
    assert client.get("/api/admin/me").status_code == 200  # this device stays signed in
    assert other.get("/api/admin/me").status_code == 401  # the other one does not
    assert db_session.query(AdminSession).count() == 1
    assert client.post("/api/admin/login", json={"email": "admin@test.com", "password": "Password123"}).status_code == 401
    assert client.post("/api/admin/login", json={"email": "admin@test.com", "password": "NewPassword456"}).status_code == 200


@pytest.fixture()
def sent_emails(monkeypatch):
    sent: list[tuple[str, str, str]] = []
    monkeypatch.setattr(auth_router, "send_email", lambda to, subject, body: sent.append((to, subject, body)) or True)
    return sent


def _token_from(sent) -> str:
    body = sent[-1][2]
    return body.split("token=")[1].split()[0]


def test_forgot_and_reset_password(client, seeded, db_session, sent_emails):
    login(client, "admin@test.com")
    unknown = client.post("/api/admin/forgot-password", json={"email": "nobody@test.com"})
    known = client.post("/api/admin/forgot-password", json={"email": "admin@test.com"})
    assert unknown.status_code == known.status_code == 200 and unknown.json() == known.json()
    assert [to for to, _, _ in sent_emails] == ["admin@test.com"]  # only the real account got an email

    token = _token_from(sent_emails)
    assert token not in known.text
    stored = db_session.query(PasswordResetToken).one()
    assert stored.token_hash == hash_token(token) and stored.token_hash != token

    assert client.post("/api/admin/reset-password", json={"token": token, "new_password": "weak"}).status_code == 422
    assert client.post("/api/admin/reset-password", json={"token": "x" * 40, "new_password": "BrandNew789"}).status_code == 400
    ok = client.post("/api/admin/reset-password", json={"token": token, "new_password": "BrandNew789"})
    assert ok.status_code == 200
    assert client.get("/api/admin/me").status_code == 401  # reset signs everyone out
    assert client.post("/api/admin/reset-password", json={"token": token, "new_password": "Another789x"}).status_code == 400  # single use
    assert client.post("/api/admin/login", json={"email": "admin@test.com", "password": "BrandNew789"}).status_code == 200


def test_reset_token_expires(client, seeded, db_session, sent_emails):
    client.post("/api/admin/forgot-password", json={"email": "admin@test.com"})
    token = _token_from(sent_emails)
    record = db_session.query(PasswordResetToken).one()
    record.expires_at = utcnow() - timedelta(minutes=1)
    db_session.commit()
    res = client.post("/api/admin/reset-password", json={"token": token, "new_password": "BrandNew789"})
    assert res.status_code == 400


def test_forgot_password_is_rate_limited(client, seeded, sent_emails):
    codes = [client.post("/api/admin/forgot-password", json={"email": "admin@test.com"}).status_code for _ in range(7)]
    assert codes[:5] == [200] * 5 and 429 in codes[5:]


def test_reset_locked_account_unlocks(client, seeded, db_session, sent_emails):
    for _ in range(cms.max_failed_logins):
        client.post("/api/admin/login", json={"email": "admin@test.com", "password": "nope-nope1"})
    client.post("/api/admin/forgot-password", json={"email": "admin@test.com"})
    client.post("/api/admin/reset-password", json={"token": _token_from(sent_emails), "new_password": "BrandNew789"})
    assert client.post("/api/admin/login", json={"email": "admin@test.com", "password": "BrandNew789"}).status_code == 200


def test_security_headers(client, admin_headers):
    res = client.get("/api/admin/stats")
    assert res.headers["cache-control"] == "no-store"
    assert res.headers["x-content-type-options"] == "nosniff"
    assert res.headers["x-frame-options"] == "DENY"
