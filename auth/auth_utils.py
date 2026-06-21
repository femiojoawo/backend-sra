from curses import use_default_colors
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlmodel import Session
from dependencies import get_session
from core.config import config
from models.models import RoleEnum, User, JWTInfoUser

# Outil pour hacher et vérifier les mots de passe
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# C'est ici qu'on dit à FastAPI où se trouve la route de login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: JWTInfoUser):
    to_encode = {"sub": str(data.id), "role": data.role_name}
    expire = datetime.now() + timedelta(minutes=config.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    # On crée le JWT ici
    encoded_jwt = jwt.encode(to_encode, config.secret_key, algorithm=config.algorithm)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # On décode le token
        print(token)
        payload = jwt.decode(token, config.secret_key, algorithms=[config.algorithm])
        user_id: int = int(payload.get("sub"))
        user = session.get(User, user_id)
        if user is None:
            raise credentials_exception
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Utilisateur inactif",
            )
    except jwt.exceptions.DecodeError:
        raise credentials_exception
        
    return user

# def verify_role(user: User, allowed_roles: list[RoleEnum] = [RoleEnum.ADMIN]):
#     if user.role_name not in allowed_roles:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Vous n'avez pas les permissions nécessaires pour accéder à cette ressource",
#         )

class RoleChecker:
    def __init__(self, allowed_roles: list[RoleEnum] = [RoleEnum.ADMIN]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)):
        if current_user.role_name not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Accès refusé. Rôles requis: {self.allowed_roles}"
            )
        return current_user