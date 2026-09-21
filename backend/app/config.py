from pydantic_settings import BaseSettings, SettingsConfigDict

INSECURE_DEFAULT_SECRETS = {"dev-secret-change-me", "change-this-to-a-long-random-secret", ""}


class Settings(BaseSettings):
    environment: str = "development"
    database_url: str = "postgresql+psycopg2://eliteescape:eliteescape@localhost:5432/eliteescape"
    jwt_secret_key: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: str = "http://localhost:3000"

    admin_email: str = "admin@eliteescape.com"
    admin_password: str = ""
    admin_name: str = "Elite Escape Admin"

    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    notify_email: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    def assert_production_safe(self) -> None:
        if not self.is_production:
            return
        problems = []
        if self.jwt_secret_key in INSECURE_DEFAULT_SECRETS or len(self.jwt_secret_key) < 32:
            problems.append("JWT_SECRET_KEY must be a random string of at least 32 characters")
        if len(self.admin_password) < 12:
            problems.append("ADMIN_PASSWORD must be set to a strong password of at least 12 characters")
        if problems:
            raise RuntimeError("Unsafe production configuration: " + "; ".join(problems))


settings = Settings()
