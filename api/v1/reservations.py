from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from sqlmodel import Session, select, func
from datetime import date, datetime, timedelta
from pydantic import BaseModel

from .utils import is_room_available
from auth import auth_utils
from dependencies import get_session
from models.models import (
    Reservation, CreateReservation, ReadReservation,
    User, RoleEnum, Room, RoomReservation, StatusResrvationEnum,
    PaginatedResponse, FilterParams, ServiceRequest, OrderItem, StatusResrvationEnum,
    ReadRoomWithType, ReadService, ReadOrderItem,ReadServiceRequest
)

router = APIRouter(
    prefix="/reservations",
    tags=["Réservations"],
)

# ==========================================
# Schémas supplémentaires pour les requêtes
# ==========================================
class ReservationFilters(FilterParams):
    check_in_from: date = date.today()
    check_out_to: date = date.today() + timedelta(days=5)
    status: StatusResrvationEnum = StatusResrvationEnum.CONFIRMEE

class ServiceRequestInput(BaseModel):
    service_id: int
    quantity: int = 1

class OrderItemInput(BaseModel):
    product_id: Optional[int] = None
    formule_id: Optional[int] = None
    quantity_ordered: int = 1

class ReadReservationWithDetails(ReadReservation):
    rooms: List[ReadRoomWithType]
    services: List[ReadServiceRequest]
    order_items: List[ReadOrderItem]

# ==========================================
# Routes CRUD Réservations
# ==========================================

@router.get("/", response_model=PaginatedResponse[ReadReservationWithDetails], summary="Lister et filtrer les réservations")
def get_reservations(
    *,
    session: Session = Depends(get_session),
    filters: Annotated[ReservationFilters, Query()],
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    statement = select(Reservation)
    
    # Application des filtres

    statement = statement.where(Reservation.check_in >= filters.check_in_from).where(Reservation.check_out <= filters.check_out_to)
    if filters.status:
        statement = statement.where(Reservation.status == filters.status)
        
    reservations = session.exec(statement.offset(filters.get_page).limit(filters.limit)).all()
    
    # Calcul du total pour la pagination
    total_statement = select(func.count(Reservation.id))
    total_statement = total_statement.where(Reservation.check_in >= filters.check_in_from).where(Reservation.check_out <= filters.check_out_to)
    if filters.status:
        total_statement = total_statement.where(Reservation.status == filters.status)
        
    total = session.exec(total_statement).one()
    
    return PaginatedResponse[ReadReservation](
        total_pages= 1 if total <= filters.limit else (total // filters.limit),
        total=total,
        active_page=filters.page,
        data=reservations
    )

@router.post("/", response_model=ReadReservationWithDetails, summary="Créer une réservation complète")
def create_reservation(
    *,
    reservation_data: Annotated[CreateReservation, Body(...)],
    room_ids: List[int] = Body(..., description="Liste des IDs des chambres"),
    services: List[ServiceRequestInput] = Body(default=[], description="Services demandés au moment de la réservation"),
    order_items: List[OrderItemInput] = Body(default=[], description="Produits ou formules commandés"),
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.get_current_user)
):
    # 1. Vérification des chambres
    rooms = session.exec(select(Room).where(Room.id.in_(room_ids))).all()
    if not is_room_available(session, room_ids, reservation_data.check_in, reservation_data.check_out):
        raise HTTPException(
            status_code=409, # 409 Conflict est idéal pour ce type d'erreur métier
            detail="Désolé, une ou plusieurs chambres sélectionnées sont déjà occupées pour ces dates."
        )

    if len(rooms) != len(room_ids):
        raise HTTPException(status_code=404, detail="Une ou plusieurs chambres sont introuvables.")

    
    
    # 2. Création de la réservation principale
    reservation_data.user_id = current_user.id
    if current_user.role_name == RoleEnum.CLIENT:
        reservation_data.assigned_to = current_user.id  # Pas d'assignation pour les clients
    else:
        if not reservation_data.assigned_to:
            raise HTTPException(status_code=422, detail="Veiller ajouter le client de la reservation") # Assignation à l'admin/réceptionniste qui crée la réservation
        
    db_reservation = Reservation.model_validate(reservation_data)
    session.add(db_reservation)
    session.commit()
    session.refresh(db_reservation) # On récupère l'ID généré de la réservation

    # 3. Association des chambres (Table RoomReservation)
    for room in rooms:
        room_reservation = RoomReservation(
            room_id=room.id,
            reservation_id=db_reservation.id
        )
        session.add(room_reservation)
        
    # 4. Association des services (Table ServiceRequest)
    for svc in services:
        service_req = ServiceRequest(
            reservation_id=db_reservation.id,
            service_id=svc.service_id,
            quantity=svc.quantity
        )
        session.add(service_req)
        
    # 5. Association des produits/formules (Table OrderItem)
    for item in order_items:
        if not item.product_id and not item.formule_id:
            raise HTTPException(
                status_code=400, 
                detail="Un OrderItem doit avoir au moins un product_id ou un formule_id."
            )
            
        order_item = OrderItem(
            reservation_id=db_reservation.id,
            product_id=item.product_id,
            formule_id=item.formule_id,
            quantity_ordered=item.quantity_ordered
        )
        session.add(order_item)
    
    # 6. Sauvegarde de toutes les tables de liaison
    session.commit()
    session.refresh(db_reservation)
    return db_reservation

@router.patch("/{reservation_id}/status", response_model=ReadReservation, summary="Mettre à jour le statut de la réservation")
def update_reservation_status(
    *,
    reservation_id: int,
    status: StatusResrvationEnum = Body(..., embed=True),
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    reservation = session.get(Reservation, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    
    reservation.status = status
    session.add(reservation)
    session.commit()
    session.refresh(reservation)
    return reservation