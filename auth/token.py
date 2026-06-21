from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from .auth_utils import verify_password, get_password_hash, create_access_token
from models.models import JWTInfoUser, LoginUser, User
from dependencies import get_session

session: Session = Depends(get_session)

router = APIRouter(
    tags=["Auth"],
)

@router.post("/token")
async def login(session: Session = session,form_data: OAuth2PasswordRequestForm = Depends()):

    user_db = session.exec(select(User).where(User.email == form_data.username)).first()
    # 2. Vérification de l'existence et du mot de passe
    if not user_db or not verify_password(form_data.password, user_db.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data=JWTInfoUser(id=user_db.id, role_name=user_db.role_name))
    
    # 4. On retourne le token
    return {"access_token": access_token, "token_type": "bearer"}