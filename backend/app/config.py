from typing import List
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
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000"]

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

    model_config = {
        "env_file": ".env",
        "extra": "allow"
    }

settings = Settings()
