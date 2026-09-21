from datetime import timedelta

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.cms_config import cms
from app.core.http import enforce_origin
from app.core.security import hash_token, tokens_match
from app.core.timeutil import utcnow
from app.database import get_db
from app.models.admin_session import AdminSession
from app.models.user import User, UserRole

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}
CSRF_HEADER = "x-csrf-token"


def _unauthorized() -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")


def get_session(request: Request, db: Session = Depends(get_db)) -> tuple[AdminSession, User]:
    """Resolve the logged-in admin from the session cookie.

    Every admin endpoint goes through this: it checks the cookie against the server-side session
    table, enforces idle and absolute expiry, and, for anything that changes data, requires an
    Origin from our own site and a matching CSRF token."""
    token = request.cookies.get(cms.session_cookie_name)
    if not token:
        raise _unauthorized()

    session = db.query(AdminSession).filter(AdminSession.token_hash == hash_token(token)).first()
    if session is None:
        raise _unauthorized()

    now = utcnow()
    idle_limit = session.last_seen_at + timedelta(minutes=cms.session_idle_minutes)
    if session.expires_at <= now or idle_limit <= now:
        db.delete(session)
        db.commit()
        raise _unauthorized()

    user = db.get(User, session.user_id)
    if user is None or not user.is_active:
        db.delete(session)
        db.commit()
        raise _unauthorized()

    if request.method not in SAFE_METHODS:
        enforce_origin(request)
        supplied = request.headers.get(CSRF_HEADER, "")
        if not supplied or not tokens_match(supplied, session.csrf_token):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid or missing CSRF token")

    if now - session.last_seen_at > timedelta(seconds=60):
        session.last_seen_at = now
        db.commit()

    return session, user


def get_current_user(ctx: tuple[AdminSession, User] = Depends(get_session)) -> User:
    return ctx[1]


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
