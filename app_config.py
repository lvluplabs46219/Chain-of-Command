import os
from dataclasses import dataclass
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

@dataclass
class SupabaseConfig:
    url: Optional[str] = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    anon_key: Optional[str] = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    service_role_key: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    database_url: Optional[str] = os.getenv("DATABASE_URL")

@dataclass
class AIProvidersConfig:
    gemini_api_key: Optional[str] = os.getenv("GEMINI_API_KEY")
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = os.getenv("ANTHROPIC_API_KEY")
    huggingface_api_key: Optional[str] = os.getenv("HUGGINGFACE_API_KEY")

@dataclass
class ConnectorsConfig:
    courtlistener_token: Optional[str] = os.getenv("COURTLISTENER_API_TOKEN")

@dataclass
class AppConfig:
    supabase: SupabaseConfig = SupabaseConfig()
    ai: AIProvidersConfig = AIProvidersConfig()
    connectors: ConnectorsConfig = ConnectorsConfig()
    env: str = os.getenv("NODE_ENV", "development")

config = AppConfig()

def validate_config():
    """Validates that essential configuration is present."""
    missing = []
    if not config.supabase.database_url:
        missing.append("DATABASE_URL")
    if not config.ai.gemini_api_key:
        missing.append("GEMINI_API_KEY")
        
    if missing:
        print(f"⚠️ WARNING: Missing recommended environment variables: {', '.join(missing)}")
        print("Please check your .env file or environment configuration.")

if __name__ == "__main__":
    validate_config()
    print("Configuration loaded successfully.")
