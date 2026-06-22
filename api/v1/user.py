from typing import Annotated

from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from auth import auth_utils
from dependencies import get_session
from models.models import  UpdateUser, User, CreateUser, ReadUser, UserFilters, PaginatedResponse, RoleEnum

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.get("/", response_model=PaginatedResponse[ReadUser])
def get_users(*,
    session: Session = Depends(get_session),
    filters: Annotated[UserFilters, Query()],
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))):

    users = session.exec(
    select(User)
    .where(
        (User.is_active == filters.is_active) &
        (User.role_name == filters.role_name)
    ).offset(filters.get_page)
    .limit(filters.limit)
    ).all()
    total = len(session.exec(select(User)).all())
    return PaginatedResponse(
        total= total,
        active_page= filters.page,
        total_pages= 1 if total <= filters.limit else (total // filters.limit),
        data= users
    )


@router.get("/me", response_model=ReadUser)
def get_current_user(current_user: User = Depends(auth_utils.get_current_user)):
    return current_user


@router.get("/{user_id}", response_model=ReadUser)
def get_user_by_id(*, user_id: int, session: Session = Depends(get_session), current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur Introuvable")
    return user

@router.post("/", response_model=ReadUser)
def create_user(*, user: Annotated[CreateUser, Body()], session: Session = Depends(get_session)):
    user.password = auth_utils.get_password_hash(user.password)  # Hash the password before storing it
    db_user = User.model_validate(user)
    session.add(db_user)
    try:
        session.commit()
    except IntegrityError as e:
        raise HTTPException(
            status_code=409,
            detail=str(e.orig)
        )
    session.refresh(db_user)
    return db_user

@router.patch("/{user_id}", response_model=ReadUser)
def update_user(user_id: int, 
    user_update: Annotated[UpdateUser, Body()], 
    session: Session = Depends(get_session), 
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))):
    user_db = session.get(User, user_id)
    if not user_db:
        raise HTTPException(status_code=404, detail="Utilisateur Introuvable")
    

    if user_update.password:
        user_update.password = auth_utils.get_password_hash(user_update.password)

    user_db.sqlmodel_update(user_update.model_dump(exclude_unset=True))  # Update only the fields that were provided

    session.add(user_db)
    try:
        session.commit()
    except IntegrityError as e:
        raise HTTPException(
            status_code=409,
            detail=str(e.orig)
        )
    session.refresh(user_db)
    return user_db

@router.delete("/{user_id}", response_model=ReadUser)
def delete_user(user_id: int, session: Session = Depends(get_session)):
    user_db = session.get(User, user_id)
    if not user_db:
        raise HTTPException(status_code=404, detail="Utilisateur Introuvable")
    session.delete(user_db)
    session.commit()
    return user_db


@router.post("/{user_id}/make-admin", response_model=ReadUser, summary="Promouvoir un utilisateur au rang d'Administrateur")
def make_user_admin(
    user_id: int,
    session: Session = Depends(get_session),
    # SÉCURITÉ : Seul un ADMIN peut promouvoir un autre utilisateur
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.CLIENT,  RoleEnum.ADMIN]))
):
    # 1. Vérifier si l'utilisateur cible existe
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    # 2. Vérifier s'il n'est pas déjà administrateur
    if db_user.role_name == RoleEnum.ADMIN:
        raise HTTPException(status_code=400, detail="Cet utilisateur a déjà le rôle d'Administrateur.")

    # 3. Mettre à jour le rôle
    db_user.role_name = RoleEnum.ADMIN
    session.add(db_user)
    session.commit()
    session.refresh(db_user)