from fastapi import HTTPException, Request, status

from app.config import settings
from app.core.cms_config import cms


def client_ip(request: Request) -> str:
    """Client address. X-Forwarded-For is only honoured behind a proxy we control, and then only the
    last entry (the one our own proxy appended) is trusted, because earlier entries are client-supplied."""
    if cms.behind_proxy:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"


def _allowed_origins() -> set[str]:
    origins = {o.rstrip("/") for o in settings.cors_origins_list}
    origins.add(cms.frontend_url.rstrip("/"))
    return origins


def enforce_origin(request: Request) -> None:
    """Defence in depth against CSRF: a browser always sends Origin on cross-site state-changing
    requests, and it must be one of our own sites. Requests without Origin (curl, server-side) pass
    here and still have to present the CSRF token."""
    origin = request.headers.get("origin")
    if origin and origin.rstrip("/") not in _allowed_origins():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cross-site request blocked")
