from typing import Annotated, List, Optional
from sqlalchemy.exc import IntegrityError
from fastapi import APIRouter, Depends, Query, HTTPException, Body, status
from sqlmodel import Session, select, func

from auth import auth_utils
from dependencies import get_session
from models.models import (
    ReadRoomWithType, Room, CreateRoom, ReadRoom, UpdateRoom, RoomStatusEnum, 
    RoomType, RoomFilters, PaginatedResponse, RoleEnum, User,
    AvailabilityFilters, RoomReservation, ReadRoomWithType, RoomType, RoomStatusEnum, Reservation
)

router = APIRouter(
    prefix="/rooms",
    tags=["Chambres"],
)

@router.get("/", response_model=PaginatedResponse[ReadRoomWithType], summary="Récupérer les chambres", description="Récupère une liste paginée de chambres avec des filtres optionnels.")
def get_rooms(*, 
    session: Session = Depends(get_session),
    filters: Annotated[RoomFilters, Query()]
    ):
    total = len(session.exec(select(Room)).all())
    statement = select(Room)
    
    if filters.room_number:
        statement = statement.where(Room.room_number == filters.room_number)
    if filters.status:
        statement = statement.where(Room.status == filters.status)
    if filters.room_type_id:
        statement = statement.where(Room.room_type_id == filters.room_type_id)
        
    rooms = session.exec(statement.offset(filters.get_page).limit(filters.limit)).all()
    
    return PaginatedResponse[ReadRoomWithType](
        total_pages= 1 if total <= filters.limit else (total // filters.limit) ,
        total=total,
        active_page=filters.page,
        data=rooms
    )

@router.get("/available", response_model=PaginatedResponse[ReadRoomWithType], summary="Chambres disponibles", description="Récupère la liste des chambres disponibles pour une période donnée, filtrée par type et capacité.")
def get_available_rooms(
    *,
    session: Session = Depends(get_session),
    filters: Annotated[AvailabilityFilters, Query()]
):
    # Sous-requête pour trouver les chambres occupées (déjà réservées)
    # On cherche les réservations qui chevauchent la période demandée
    
    
    occupied_rooms_statement = (
        select(Room.id)
        .join(RoomReservation, Room.id == RoomReservation.room_id)
        .join(Reservation, RoomReservation.reservation_id == Reservation.id)
        .where(
            (filters.check_in < Reservation.check_out) & 
            (filters.check_out > Reservation.check_in)
        )
    )
    
    occupied_room_ids = session.exec(occupied_rooms_statement).all()
    
    # Requête principale pour les chambres DISPONIBLES
    statement = select(Room).where(Room.id.not_in(occupied_room_ids))
    statement = statement.where(Room.status == RoomStatusEnum.DISPONIBLE)
    
    if filters.room_type_id or filters.capacity:
        statement = statement.join(RoomType)
        if filters.room_type_id:
            statement = statement.where(Room.room_type_id == filters.room_type_id)
        if filters.capacity:
            statement = statement.where(RoomType.capacity >= filters.capacity)
            
    rooms = session.exec(statement).all()
    total = len(rooms)
    return PaginatedResponse[ReadRoomWithType](
        total_pages= 1 if total <= filters.limit else (total // filters.limit) ,
        total=total,
        active_page=filters.page,
        data=rooms
    )

@router.get("/{room_id}", response_model=ReadRoom, summary="Récupérer une chambre", description="Récupère les détails d'une chambre spécifique par son ID.")
def get_room_by_id(*, room_id: int, session: Session = Depends(get_session)):
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Chambre introuvable")
    return room

@router.post("/", response_model=ReadRoom, summary="Créer une chambre", description="Crée une nouvelle chambre. Seuls les administrateurs peuvent effectuer cette action.")
def create_room(*, 
    room: Annotated[CreateRoom, Body()], 
    session: Session = Depends(get_session), 
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    db_room = Room.model_validate(room)
    session.add(db_room)
    try:
        session.commit()
        session.refresh(db_room)
    except IntegrityError as e:
        raise HTTPException(
            status_code=409,
            detail="Une chambre avec ce numéro existe déjà."
        )
    return db_room

@router.patch("/{room_id}", response_model=ReadRoom, summary="Mettre à jour une chambre", description="Met à jour une chambre spécifique par son ID. Seuls les administrateurs peuvent effectuer cette action.")
def update_room(*, 
    room_id: int, 
    room: Annotated[UpdateRoom, Body()], 
    session: Session = Depends(get_session), 
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    db_room = session.get(Room, room_id)
    if not db_room:
        raise HTTPException(status_code=404, detail="Chambre introuvable")
    
    room_data = room.model_dump(exclude_unset=True)
    db_room.sqlmodel_update(room_data)
    session.add(db_room)
    try:
        session.commit()
        session.refresh(db_room)
    except IntegrityError as e:
        raise HTTPException(
            status_code=409,
            detail="Erreur d'intégrité lors de la mise à jour."
        )
    return db_room

@router.delete("/{room_id}", summary="Supprimer une chambre", description="Supprime une chambre spécifique par son ID. Seuls les administrateurs peuvent effectuer cette action.")
def delete_room(*, 
    room_id: int, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Chambre introuvable")
    session.delete(room)
    session.commit()
    return {"detail": "Chambre supprimée avec succès"}