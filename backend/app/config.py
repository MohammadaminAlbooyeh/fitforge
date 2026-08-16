from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    PROJECT_NAME: str = "FitForge API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+psycopg://fitforge:fitforge@localhost:5432/fitforge"

    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 1025
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None

    REVENUECAT_WEBHOOK_SECRET: str | None = None

    CORS_ORIGINS: list[str] = ["*"]

    OTEL_ENABLED: bool = False
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://localhost:4317"
    OTEL_SERVICE_NAME: str = "fitforge-backend"

    @model_validator(mode="after")
    def _require_secret_key_outside_debug(self) -> "Settings":
        if not self.DEBUG and self.SECRET_KEY == "change-me":
            raise ValueError(
                "SECRET_KEY must be set to a non-default value when DEBUG is False"
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()