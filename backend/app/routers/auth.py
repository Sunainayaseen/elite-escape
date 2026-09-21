import logging
from datetime import timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.core.cms_config import cms
from app.core.deps import get_session
from app.core.http import client_ip, enforce_origin
from app.core.mailer import send_email
from app.core.rate_limit import RateLimiter
from app.core.security import (
    burn_password_check,
    hash_password,
    hash_token,
    new_token,
    verify_password,
)
from app.core.timeutil import utcnow
from app.database import get_db
from app.models.admin_session import AdminSession
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
    SessionOut,
    UserOut,
)
from app.schemas.leads import OkResponse

logger = logging.getLogger("eliteescape.auth")

router = APIRouter(prefix="/api/admin", tags=["admin-auth"])

login_limiter = RateLimiter(max_requests=10, window_seconds=300)
forgot_limiter = RateLimiter(max_requests=5, window_seconds=900)
reset_limiter = RateLimiter(max_requests=10, window_seconds=900)

# One message for every failure (unknown email, wrong password, locked, disabled) so the endpoint
# cannot be used to discover which addresses have an account.
LOGIN_FAILED = "Invalid email or password, or the account is temporarily locked."


def _set_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        cms.session_cookie_name,
        token,
        max_age=cms.session_absolute_hours * 3600,
        httponly=True,
        secure=cms.secure_cookies,
        samesite="lax",
        path="/",
    )


def _clear_cookie(response: Response) -> None:
    response.delete_cookie(
        cms.session_cookie_name, path="/", httponly=True, secure=cms.secure_cookies, samesite="lax"
    )


def _session_out(user: User, session: AdminSession) -> SessionOut:
    return SessionOut(user=UserOut.model_validate(user), csrf_token=session.csrf_token)


@router.post(
    "/login",
    response_model=SessionOut,
    dependencies=[Depends(login_limiter), Depends(enforce_origin)],
)
def login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    now = utcnow()
    user = db.query(User).filter(func.lower(User.email) == payload.email.lower()).first()
    failure = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=LOGIN_FAILED)

    if user is None or (user.locked_until is not None and user.locked_until > now):
        burn_password_check(payload.password)
        raise failure

    if not verify_password(payload.password, user.hashed_password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= cms.max_failed_logins:
            user.locked_until = now + timedelta(minutes=cms.lockout_minutes)
            user.failed_login_attempts = 0
            logger.warning("Admin account %s locked after repeated failed logins", user.email)
        db.commit()
        raise failure

    if not user.is_active:
        raise failure

    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = now

    # Drop this user's expired sessions, then start a fresh one (a new token on every login).
    db.query(AdminSession).filter(
        AdminSession.user_id == user.id, AdminSession.expires_at <= now
    ).delete(synchronize_session=False)

    token = new_token()
    session = AdminSession(
        user_id=user.id,
        token_hash=hash_token(token),
        csrf_token=new_token(),
        created_at=now,
        last_seen_at=now,
        expires_at=now + timedelta(hours=cms.session_absolute_hours),
        ip=client_ip(request),
        user_agent=(request.headers.get("user-agent") or "")[:255] or None,
    )
    db.add(session)
    db.commit()
    _set_cookie(response, token)
    return _session_out(user, session)


@router.post("/logout", response_model=OkResponse, dependencies=[Depends(enforce_origin)])
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    """Ends the session server-side (so a copied cookie stops working) and clears the cookie.
    Deliberately tolerant: logging out with an already-expired session must still succeed."""
    token = request.cookies.get(cms.session_cookie_name)
    if token:
        db.query(AdminSession).filter(AdminSession.token_hash == hash_token(token)).delete(
            synchronize_session=False
        )
        db.commit()
    _clear_cookie(response)
    return OkResponse()


@router.get("/me", response_model=SessionOut)
def me(ctx: tuple[AdminSession, User] = Depends(get_session)):
    session, user = ctx
    return _session_out(user, session)


@router.post("/change-password", response_model=OkResponse)
def change_password(
    payload: ChangePasswordRequest,
    ctx: tuple[AdminSession, User] = Depends(get_session),
    db: Session = Depends(get_db),
):
    session, user = ctx
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if verify_password(payload.new_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Choose a password you have not used before")
    user.hashed_password = hash_password(payload.new_password)
    # Sign out every other device; this one stays logged in.
    db.query(AdminSession).filter(
        AdminSession.user_id == user.id, AdminSession.id != session.id
    ).delete(synchronize_session=False)
    db.commit()
    return OkResponse()


def _send_reset_email(email: str, link: str) -> None:
    body = (
        "We received a request to reset the password for your Elite Escape admin account.\n\n"
        f"Open this link to choose a new password (valid for {cms.reset_token_minutes} minutes):\n{link}\n\n"
        "If you did not ask for this, you can ignore this email; your password will not change."
    )
    sent = send_email(email, "Reset your Elite Escape admin password", body)
    if not sent:
        if settings.is_production:
            logger.error("Password reset requested but email could not be sent (check SMTP settings)")
        else:
            # Development convenience only: with no SMTP server configured, show the link in the console.
            logger.warning("SMTP not configured. Password reset link for %s: %s", email, link)


@router.post(
    "/forgot-password",
    response_model=OkResponse,
    dependencies=[Depends(forgot_limiter), Depends(enforce_origin)],
)
def forgot_password(payload: ForgotPasswordRequest, background: BackgroundTasks, db: Session = Depends(get_db)):
    """Always answers the same way, whether or not the address belongs to an admin."""
    now = utcnow()
    user = db.query(User).filter(func.lower(User.email) == payload.email.lower()).first()
    if user is not None and user.is_active:
        recent = (
            db.query(PasswordResetToken)
            .filter(PasswordResetToken.user_id == user.id, PasswordResetToken.created_at > now - timedelta(seconds=60))
            .first()
        )
        if recent is None:
            db.query(PasswordResetToken).filter(
                PasswordResetToken.user_id == user.id, PasswordResetToken.used_at.is_(None)
            ).delete(synchronize_session=False)
            token = new_token()
            db.add(
                PasswordResetToken(
                    user_id=user.id,
                    token_hash=hash_token(token),
                    created_at=now,
                    expires_at=now + timedelta(minutes=cms.reset_token_minutes),
                )
            )
            db.commit()
            link = f"{cms.frontend_url.rstrip('/')}/admin/reset-password?token={token}"
            background.add_task(_send_reset_email, user.email, link)
    return OkResponse()


@router.post(
    "/reset-password",
    response_model=OkResponse,
    dependencies=[Depends(reset_limiter), Depends(enforce_origin)],
)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    now = utcnow()
    record = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == hash_token(payload.token))
        .first()
    )
    if record is None or record.used_at is not None or record.expires_at <= now:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")
    user = db.get(User, record.user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")

    user.hashed_password = hash_password(payload.new_password)
    user.failed_login_attempts = 0
    user.locked_until = None
    record.used_at = now
    # A password reset signs the account out everywhere.
    db.query(AdminSession).filter(AdminSession.user_id == user.id).delete(synchronize_session=False)
    db.commit()
    return OkResponse()
