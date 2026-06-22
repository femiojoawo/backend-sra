from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select, func

from models.models import (
    Service, CreateService, ReadService, UpdateService,
    PaginatedResponse, FilterParams, User, RoleEnum
)
from dependencies import get_session
from auth import auth_utils

router = APIRouter(prefix="/services", tags=["Services"])

class ServiceFilters(FilterParams):
    name: str | None = None

@router.get("/", response_model=PaginatedResponse[ReadService], summary="Lister les services")
def get_services(
    filters: Annotated[ServiceFilters, Query()],
    session: Session = Depends(get_session)
):
    statement = select(Service)
    total_statement = select(func.count(Service.id))
    
    if filters.name:
        statement = statement.where(Service.name.ilike(f"%{filters.name}%"))
        total_statement = total_statement.where(Service.name.ilike(f"%{filters.name}%"))
        
    total = session.exec(total_statement).one()
    services = session.exec(statement.offset(filters.get_page).limit(filters.limit)).all()
    
    return PaginatedResponse[ReadService](
        total_pages=(total + filters.limit - 1) // filters.limit if total > 0 else 1,
        total=total,
        active_page=filters.page,
        data=services
    )

@router.post("/", response_model=ReadService, status_code=status.HTTP_201_CREATED, summary="Créer un service")
def create_service(
    service_data: CreateService,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    db_service = Service.model_validate(service_data)
    session.add(db_service)
    session.commit()
    session.refresh(db_service)
    return db_service

@router.patch("/{service_id}", response_model=ReadService, summary="Modifier un service")
def update_service(
    service_id: int,
    update_data: UpdateService,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    db_service = session.get(Service, service_id)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service introuvable")
        
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_service, key, value)
        
    session.add(db_service)
    session.commit()
    session.refresh(db_service)
    return db_service

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Supprimer un service")
def delete_service(
    service_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    db_service = session.get(Service, service_id)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service introuvable")
        
    session.delete(db_service)
    session.commit()