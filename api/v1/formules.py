from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select, func

from models.models import (
    Formule, CreateFormule, ReadFormule, UpdateFormule,
    PaginatedResponse, FilterParams, User, RoleEnum
)
from dependencies import get_session
from auth import auth_utils

router = APIRouter(prefix="/formules", tags=["Formules"])

class FormuleFilters(FilterParams):
    name: str | None = None

@router.get("/", response_model=PaginatedResponse[ReadFormule], summary="Lister les formules")
def get_formules(
    filters: Annotated[FormuleFilters, Query()],
    session: Session = Depends(get_session)
):
    statement = select(Formule)
    total_statement = select(func.count(Formule.id))
    
    if filters.name:
        statement = statement.where(Formule.name.ilike(f"%{filters.name}%"))
        total_statement = total_statement.where(Formule.name.ilike(f"%{filters.name}%"))
        
    total = session.exec(total_statement).one()
    formules = session.exec(statement.offset(filters.get_page).limit(filters.limit)).all()
    
    return PaginatedResponse[ReadFormule](
        total_pages=(total + filters.limit - 1) // filters.limit if total > 0 else 1,
        total=total,
        active_page=filters.page,
        data=formules
    )

@router.post("/", response_model=ReadFormule, status_code=status.HTTP_201_CREATED, summary="Créer une formule")
def create_formule(
    formule_data: CreateFormule,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    db_formule = Formule.model_validate(formule_data)
    session.add(db_formule)
    session.commit()
    session.refresh(db_formule)
    return db_formule

@router.patch("/{formule_id}", response_model=ReadFormule, summary="Modifier une formule")
def update_formule(
    formule_id: int,
    update_data: UpdateFormule,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    db_formule = session.get(Formule, formule_id)
    if not db_formule:
        raise HTTPException(status_code=404, detail="Formule introuvable")
        
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_formule, key, value)
        
    session.add(db_formule)
    session.commit()
    session.refresh(db_formule)
    return db_formule

@router.delete("/{formule_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Supprimer une formule")
def delete_formule(
    formule_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    db_formule = session.get(Formule, formule_id)
    if not db_formule:
        raise HTTPException(status_code=404, detail="Formule introuvable")
        
    session.delete(db_formule)
    session.commit()