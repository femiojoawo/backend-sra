from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select, func

from models.models import (
    Equipement, CreateEquipement, ReadEquipement, UpdateEquipement,
    PaginatedResponse, FilterParams, User, RoleEnum
)
from dependencies import get_session
from auth import auth_utils

router = APIRouter(prefix="/equipements", tags=["Equipements"])

class EquipementFilters(FilterParams):
    name: str | None = None

@router.get("/", response_model=PaginatedResponse[ReadEquipement], summary="Lister les équipements")
def get_equipements(
    filters: Annotated[EquipementFilters, Query()],
    session: Session = Depends(get_session)
):
    statement = select(Equipement)
    total_statement = select(func.count(Equipement.id))
    
    if filters.name:
        statement = statement.where(Equipement.name.ilike(f"%{filters.name}%"))
        total_statement = total_statement.where(Equipement.name.ilike(f"%{filters.name}%"))
        
    total = session.exec(total_statement).one()
    equipements = session.exec(statement.offset(filters.get_page).limit(filters.limit)).all()
    
    return PaginatedResponse[ReadEquipement](
        total_pages=(total + filters.limit - 1) // filters.limit if total > 0 else 1,
        total=total,
        active_page=filters.page,
        data=equipements
    )

@router.post("/", response_model=ReadEquipement, status_code=status.HTTP_201_CREATED, summary="Créer un équipement")
def create_equipement(
    equipement_data: CreateEquipement,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    db_equipement = Equipement.model_validate(equipement_data)
    session.add(db_equipement)
    session.commit()
    session.refresh(db_equipement)
    return db_equipement

@router.patch("/{equipement_id}", response_model=ReadEquipement, summary="Modifier un équipement")
def update_equipement(
    equipement_id: int,
    update_data: UpdateEquipement,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    db_equipement = session.get(Equipement, equipement_id)
    if not db_equipement:
        raise HTTPException(status_code=404, detail="Équipement introuvable")
        
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_equipement, key, value)
        
    session.add(db_equipement)
    session.commit()
    session.refresh(db_equipement)
    return db_equipement

@router.delete("/{equipement_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Supprimer un équipement")
def delete_equipement(
    equipement_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    db_equipement = session.get(Equipement, equipement_id)
    if not db_equipement:
        raise HTTPException(status_code=404, detail="Équipement introuvable")
        
    session.delete(db_equipement)
    session.commit()