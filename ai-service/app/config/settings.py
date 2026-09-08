from pathlib import Path
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict

_SERVICE_ENV = Path(__file__).resolve().parent.parent.parent / '.env'
_ROOT_ENV = Path(__file__).resolve().parent.parent.parent.parent / '.env.local'

class Settings(BaseSettings):
    # Provider: openai | gemini | anthropic | ollama | mock
    AI_PROVIDER: Literal['openai', 'gemini', 'anthropic', 'ollama', 'mock'] = 'mock'
    
    # Provider Keys
    OPENAI_API_KEY: str = ''
    OPENAI_BASE_URL: str = 'https://api.openai.com/v1'
    OPENAI_MODEL: str = 'gpt-4o-mini'
    GEMINI_API_KEY: str = ''
    ANTHROPIC_API_KEY: str = ''
    OLLAMA_BASE_URL: str = 'http://localhost:11434'
    
    # Security
    AI_SERVICE_API_KEY: str = 'forgeiq_internal_service_key_2026'
    JWT_SECRET: str = 'forgeiq_jwt_secret_change_in_production'
    
    # Vector DB & Storage
    DATABASE_URL: str = ''
    VECTOR_DIMENSION: int = 768
    VECTOR_BACKEND: Literal['memory', 'pgvector'] = 'memory'
    
    # Runtime
    ENVIRONMENT: str = 'development'
    LOG_LEVEL: str = 'INFO'
    PORT: int = 8000
    
    model_config = SettingsConfigDict(
        env_file=(str(_ROOT_ENV), str(_SERVICE_ENV), '.env'),
        env_file_encoding='utf-8',
        extra='ignore'
    )

settings = Settings()
