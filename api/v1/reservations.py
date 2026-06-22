from decimal import Decimal
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body, Query, BackgroundTasks
from sqlmodel import Session, select, func
from datetime import date, datetime, timedelta
from pydantic import BaseModel

from .utils import is_room_available
from auth import auth_utils
from dependencies import get_session
from models.models import (
    Formule, Product, Reservation, CreateReservation, ReadReservation, RoomType, Service,
    User, RoleEnum, Room, RoomReservation, StatusResrvationEnum,
    PaginatedResponse, FilterParams, ServiceRequest, OrderItem, StatusResrvationEnum,
    ReadRoomWithType, ReadService, ReadOrderItem,ReadServiceRequest,ReadRoomReservation
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
    rooms: List[ReadRoomReservation]
    services: List[ReadServiceRequest]
    order_items: List[ReadOrderItem]

class ReservationFullUpdateInput(BaseModel):
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    nb_adults: Optional[int] = None
    nb_children: Optional[int] = None
    description: Optional[str] = None
    
    room_ids: Optional[List[int]] = None
    services: Optional[List[ServiceRequestInput]] = None
    order_items: Optional[List[OrderItemInput]] = None

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
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.get_current_user)
):
    # 1. VÉRIFICATION DES DATES (Règle métier)
    days = (reservation_data.check_out.date() - reservation_data.check_in.date()).days
    if days < 1:
        raise HTTPException(
            status_code=400,
            detail="La date de départ doit être au moins un jour après la date d'arrivée."
        )

    # 2. Vérification de la disponibilité des chambres
    rooms = session.exec(select(Room).where(Room.id.in_(room_ids))).all()
    if not is_room_available(session, room_ids, reservation_data.check_in, reservation_data.check_out):
        raise HTTPException(
            status_code=409, 
            detail="Désolé, une ou plusieurs chambres sélectionnées sont déjà occupées pour ces dates."
        )

    if len(rooms) != len(room_ids):
        raise HTTPException(status_code=404, detail="Une ou plusieurs chambres sont introuvables.")

    grand_total = Decimal(0)

    # 3. Initialisation de la réservation principale
    reservation_data.user_id = current_user.id
    if current_user.role_name == RoleEnum.CLIENT:
        reservation_data.assigned_to = current_user.id
    else:
        if not reservation_data.assigned_to:
            raise HTTPException(status_code=422, detail="Veuillez ajouter le client de la réservation")
        
    db_reservation = Reservation.model_validate(reservation_data)
    session.add(db_reservation)
    session.commit()
    session.refresh(db_reservation)

    # 4. Association des chambres et calcul
    for room in rooms:
        room_type = session.get(RoomType, room.room_type_id)
        room_unit_price = room_type.price if room_type else Decimal(0)
        room_total_price = room_unit_price * days
        grand_total += room_total_price

        room_reservation = RoomReservation(
            room_id=room.id,
            reservation_id=db_reservation.id,
            unit_price=room_unit_price,
            total_price=room_total_price
        )
        session.add(room_reservation)

    # 5. Association des services et calcul
    if services != []:
        for svc in services:
            db_service = session.get(Service, svc.service_id)
            if db_service:
                tot = db_service.price * svc.quantity
                grand_total += tot
                service_req = ServiceRequest(
                    reservation_id=db_reservation.id,
                    service_id=svc.service_id,
                    quantity=svc.quantity,
                    unit_price=db_service.price,
                    total_price=tot
                )
                session.add(service_req)

    # 6. Association des produits/formules et calcul
    if order_items != []:
        for item in order_items:
            if not item.product_id and not item.formule_id:
                raise HTTPException(
                    status_code=400, 
                    detail="Un OrderItem doit avoir au moins un product_id ou un formule_id."
                )
                
            price = Decimal(0)
            if item.product_id:
                prod = session.get(Product, item.product_id)
                if prod: price = prod.price
            elif item.formule_id:
                form = session.get(Formule, item.formule_id)
                if form: price = form.price
                
            tot = price * item.quantity_ordered
            grand_total += tot
            
            order_item = OrderItem(
                reservation_id=db_reservation.id,
                product_id=item.product_id,
                formule_id=item.formule_id,
                quantity_ordered=item.quantity_ordered,
                unit_price=price,
                total_price=tot
            )
            session.add(order_item)

    # 7. Sauvegarde du prix final consolidé
    db_reservation.total_price = grand_total
    session.add(db_reservation)
    session.commit()
    session.refresh(db_reservation)

    # 8. Envoi de l'e-mail en arrière-plan
    email_data = build_email_context(session, current_user, db_reservation)
    background_tasks.add_task(
        send_reservation_email,
        email=current_user.email,
        reservation_details=email_data,
        message_title="Votre demande de réservation a été enregistrée",
        template_name="reservations/reservation_pending.html"
    )

    return db_reservation



@router.patch("/{reservation_id}", response_model=ReadReservationWithDetails, summary="Modifier une réservation (incluant chambres et services)")
def update_full_reservation(
    *,
    reservation_id: int,
    update_data: ReservationFullUpdateInput, 
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    db_reservation = session.get(Reservation, reservation_id)
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Réservation introuvable")

    # 1. Mise à jour des attributs directs
    update_dict = update_data.model_dump(exclude_unset=True, exclude={"room_ids", "services", "order_items"})
    for key, value in update_dict.items():
        setattr(db_reservation, key, value)
        
    # 2. VÉRIFICATION DES DATES APRÈS MODIFICATION (Règle métier)
    days = (db_reservation.check_out.date() - db_reservation.check_in.date()).days
    if days < 1: 
        raise HTTPException(
            status_code=400,
            detail="La date de départ doit être au moins un jour après la date d'arrivée."
        )
        
    grand_total = Decimal(0)

    # 3. Gestion des chambres
    if update_data.room_ids is not None:
        # On vérifie la disponibilité si les chambres ou les dates ont changé
        if not is_room_available(session, update_data.room_ids, db_reservation.check_in, db_reservation.check_out, exclude_reservation_id=db_reservation.id):
             raise HTTPException(status_code=409, detail="Une ou plusieurs chambres sont occupées pour ces nouvelles dates.")

        # Suppression des anciennes liaisons
        old_rooms = session.exec(select(RoomReservation).where(RoomReservation.reservation_id == reservation_id)).all()
        for r in old_rooms: session.delete(r)
        
        rooms = session.exec(select(Room).where(Room.id.in_(update_data.room_ids))).all()
        if len(rooms) != len(update_data.room_ids):
            raise HTTPException(status_code=404, detail="Une ou plusieurs chambres sont introuvables.")

        for room in rooms:
            room_type = session.get(RoomType, room.room_type_id)
            room_unit_price = room_type.price if room_type else Decimal(0)
            room_total_price = room_unit_price * days
            grand_total += room_total_price
            
            session.add(RoomReservation(
                room_id=room.id, 
                reservation_id=db_reservation.id,
                unit_price=room_unit_price,
                total_price=room_total_price
            ))
    else:
        # Recalcul des chambres existantes si les dates ont changé
        existing_rooms = session.exec(select(RoomReservation).where(RoomReservation.reservation_id == reservation_id)).all()
        for er in existing_rooms:
            room = session.get(Room, er.room_id)
            if room:
                room_type = session.get(RoomType, room.room_type_id)
                room_unit_price = room_type.price if room_type else Decimal(0)
                er.unit_price = room_unit_price
                er.total_price = room_unit_price * days
                grand_total += er.total_price
                session.add(er)

    # 4. Gestion des services
    if update_data.services is not None:
        old_services = session.exec(select(ServiceRequest).where(ServiceRequest.reservation_id == reservation_id)).all()
        for s in old_services: session.delete(s)
        
        for svc in update_data.services:
            db_service = session.get(Service, svc.service_id)
            if db_service:
                tot = db_service.price * svc.quantity
                grand_total += tot
                session.add(ServiceRequest(
                    reservation_id=db_reservation.id, 
                    service_id=svc.service_id,
                    quantity=svc.quantity, 
                    unit_price=db_service.price, 
                    total_price=tot
                ))
    else:
        existing_services = session.exec(select(ServiceRequest).where(ServiceRequest.reservation_id == reservation_id)).all()
        for es in existing_services:
            grand_total += es.total_price

    # 5. Gestion des commandes (OrderItems)
    if update_data.order_items is not None:
        old_orders = session.exec(select(OrderItem).where(OrderItem.reservation_id == reservation_id)).all()
        for o in old_orders: session.delete(o)
        
        for item in update_data.order_items:
            if not item.product_id and not item.formule_id:
                raise HTTPException(status_code=400, detail="Un OrderItem doit avoir au moins un product_id ou un formule_id.")
            
            price = Decimal(0)
            if item.product_id:
                prod = session.get(Product, item.product_id)
                if prod: price = prod.price
            elif item.formule_id:
                form = session.get(Formule, item.formule_id)
                if form: price = form.price
                
            tot = price * item.quantity_ordered
            grand_total += tot
            session.add(OrderItem(
                reservation_id=db_reservation.id, 
                product_id=item.product_id,
                formule_id=item.formule_id, 
                quantity_ordered=item.quantity_ordered,
                unit_price=price, 
                total_price=tot
            ))
    else:
        existing_orders = session.exec(select(OrderItem).where(OrderItem.reservation_id == reservation_id)).all()
        for eo in existing_orders:
            grand_total += eo.total_price

    # 6. Validation finale
    db_reservation.total_price = grand_total
    session.add(db_reservation)
    session.commit()
    session.refresh(db_reservation)
    
    return db_reservation




