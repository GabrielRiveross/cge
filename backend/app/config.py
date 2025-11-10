# app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    APP_NAME: str = "CGE Backend"
    ENV: str = "dev"

    DB_DIALECT: str
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    SMTP_HOST: str | None = None
    SMTP_PORT: int | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_TLS: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", env_ignore_empty=True)

    # convierte strings vacíos en None (antes de validar tipos)
    @field_validator("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", mode="before")
    @classmethod
    def _empty_str_to_none_str(cls, v):
        return None if v == "" else v

    @field_validator("SMTP_PORT", mode="before")
    @classmethod
    def _empty_str_to_none_int(cls, v):
        return None if v == "" else v

    @property
    def DATABASE_URL(self) -> str:
        return (f"{self.DB_DIALECT}://{self.DB_USER}:{self.DB_PASSWORD}"
                f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}")

settings = Settings()
