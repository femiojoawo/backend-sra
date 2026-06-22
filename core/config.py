from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Chemin absolu vers le fichier .env à la racine de app/
ENV_FILE = Path(__file__).resolve().parent.parent / ".env" # a comorendre
load_dotenv(dotenv_path=str(ENV_FILE)) 


class Settings(BaseSettings):
    # DB
    database_url: str 

    # Mail
    mail_username: str 
    mail_password: str 
    mail_server: str  
    mail_port: int 

    # Hotel info
    hotel_name: str 
    hotel_phone: str 
    hotel_email: str 
    hotel_address: str 
    # Frontend
    frontend_url: str 
    # Security
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    model_config = {"env_file": str(ENV_FILE)}

    # chemin
    uploads_url: str = "/uploads/rooms" # URL pour accéder aux images des chambres
    UPLOADS_DIR : Path = Path(__file__).resolve().parent.parent.parent / "uploads" / "rooms"


config = Settings()