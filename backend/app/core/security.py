import hashlib
import hmac
import secrets

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Verified against when the email is unknown, so "no such user" costs the same time as "wrong password".
_DUMMY_HASH = pwd_context.hash(secrets.token_urlsafe(12))

MIN_PASSWORD_LENGTH = 10
MAX_PASSWORD_BYTES = 72  # bcrypt ignores everything after 72 bytes, so refuse rather than silently truncate


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def burn_password_check(plain_password: str) -> None:
    pwd_context.verify(plain_password, _DUMMY_HASH)


def password_problem(password: str) -> str | None:
    """Return a human-readable reason the password is unacceptable, or None if it is fine."""
    if len(password) < MIN_PASSWORD_LENGTH:
        return f"Password must be at least {MIN_PASSWORD_LENGTH} characters long."
    if len(password.encode("utf-8")) > MAX_PASSWORD_BYTES:
        return f"Password must be at most {MAX_PASSWORD_BYTES} bytes long."
    if not any(c.isalpha() for c in password) or not any(c.isdigit() for c in password):
        return "Password must contain at least one letter and one number."
    return None


def new_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """Only the SHA-256 of a session/reset token is stored, so a database leak cannot be replayed."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def tokens_match(a: str, b: str) -> bool:
    return hmac.compare_digest(a.encode("utf-8"), b.encode("utf-8"))
