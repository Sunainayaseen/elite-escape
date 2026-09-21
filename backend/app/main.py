import mimetypes

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.core.media import upload_root
from app.routers import (
    admin_catalog,
    admin_content,
    admin_destinations,
    admin_leads,
    admin_media,
    auth,
    health,
    public,
    public_destinations,
)

settings.assert_production_safe()

# Uploads are WebP/AVIF. The OS MIME table may not know them (Windows often does not), and
# StaticFiles would then serve them as text/plain, which next/image refuses. Register them explicitly.
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("image/avif", ".avif")

app = FastAPI(
    title="Elite Escape Tourism API",
    version="1.0.0",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None,
    openapi_url=None if settings.is_production else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    if request.url.path.startswith("/api/admin"):
        # Admin responses hold private data; never let a browser or proxy cache them.
        response.headers["Cache-Control"] = "no-store"
    elif request.url.path.startswith("/uploads/"):
        # File names are random and never reused, so uploads can be cached for a long time.
        response.headers.setdefault("Cache-Control", "public, max-age=31536000, immutable")
    return response


app.include_router(health.router, prefix="/api")
app.include_router(auth.router)
app.include_router(public.router)
app.include_router(public_destinations.router)
app.include_router(admin_catalog.router)
app.include_router(admin_leads.router)
app.include_router(admin_content.router)
app.include_router(admin_destinations.router)
app.include_router(admin_media.router)

# Uploaded images (already re-encoded to WebP/AVIF by the media pipeline).
app.mount("/uploads", StaticFiles(directory=str(upload_root())), name="uploads")
