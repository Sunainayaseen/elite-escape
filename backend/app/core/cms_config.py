"""Settings for the admin dashboard / CMS. Kept apart from config.py so both can evolve independently.
All values come from environment variables (or backend/.env) and none of them are secrets baked into code."""

from pydantic_settings import BaseSettings, SettingsConfigDict

from app.config import settings as core_settings


class CmsSettings(BaseSettings):
    # Public URL of the website. Used to build the link in password-reset emails.
    frontend_url: str = "http://localhost:3000"

    session_cookie_name: str = "ee_admin_session"
    session_idle_minutes: int = 120
    session_absolute_hours: int = 12
    # None = follow the environment: Secure cookies in production, plain cookies for local http.
    cookie_secure: bool | None = None

    max_failed_logins: int = 5
    lockout_minutes: int = 15
    reset_token_minutes: int = 60

    # Set true when the API sits behind a reverse proxy (Caddy/nginx/Next rewrite) that appends the
    # real client address as the LAST X-Forwarded-For entry.
    behind_proxy: bool = False

    upload_dir: str = "uploads"
    max_upload_mb: int = 8
    max_image_pixels: int = 40_000_000

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def secure_cookies(self) -> bool:
        return core_settings.is_production if self.cookie_secure is None else self.cookie_secure

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


cms = CmsSettings()
