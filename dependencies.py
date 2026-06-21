from typing import Annotated

from fastapi import Depends
from sqlmodel import Session
from models.db import engine

def get_session():
    with Session(engine) as session:
        yield session

