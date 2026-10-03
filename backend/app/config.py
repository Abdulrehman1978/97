import json
from typing import List, Union
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    APP_NAME: str = "Livelihood Intelligence Platform"
    APP_VERSION: str = "3.0.0"

    # Database
    DATABASE_URL: str = "sqlite:///./lip.db"
    
    # Security
    SECRET_KEY: str = "lip-super-secret-key-development-minimum-32-chars-long"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALLOWED_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000"]

    # Truth States & Testing
    DEMO_MODE: bool = True
    ENABLE_MOCK_SPEECH: bool = True
    ENABLE_MOCK_TELEPHONY: bool = True

    # Configurable AI Provider Gateway (Optional / Fallback)
    AI_PROVIDER: str = "deterministic"  # deterministic, deepseek, qwen, openai, gemini
    AI_API_KEY: str = ""
    AI_MODEL: str = ""
    SARVAM_API_KEY: str = ""
    BHASHINI_API_KEY: str = ""
    BHASHINI_USER_ID: str = ""
    BHASHINI_PIPELINE_ID: str = ""
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Storage
    STORAGE_BACKEND: str = "local"
    LOCAL_STORAGE_PATH: str = "./data/storage"

    @model_validator(mode="after")
    def validate_production_security(self):
        if self.ENVIRONMENT.lower() == "production":
            if self.DEMO_MODE:
                raise ValueError("Production cannot enable DEMO_MODE; use the explicit demo environment")
            if not self.SECRET_KEY or len(self.SECRET_KEY) < 32 or self.SECRET_KEY.startswith(("lip-", "demo-")):
                raise ValueError("Production requires a unique SECRET_KEY of at least 32 characters")
        return self

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_url(cls, v: str) -> str:
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    @field_validator("ALLOWED_ORIGINS")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return [str(item).strip() for item in v if str(item).strip()]
        return ["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000"]

    model_config = {
        "env_file": ".env",
        "extra": "allow"
    }

settings = Settings()
