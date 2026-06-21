from sqlmodel import SQLModel, create_engine
from core.config import config

engine = create_engine(config.database_url, echo=True)

def create_tables():
    SQLModel.metadata.create_all(engine)
