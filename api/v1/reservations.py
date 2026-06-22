from decimal import Decimal
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body, Query, BackgroundTasks
from sqlmodel import Session, select, func
from datetime import date, datetime, timedelta
from pydantic import BaseModel
from core.config import config
from .utils import build_email_context, build_item_payment_context, is_room_available
from auth import auth_utils
from dependencies import get_session
from models.models import (
    Formule, Product, Reservation, CreateReservation, ReadReservation, RoomType, Service,
    User, RoleEnum, Room, RoomReservation, StatusResrvationEnum,
    PaginatedResponse, FilterParams, ServiceRequest, OrderItem, StatusResrvationEnum,
    ReadRoomWithType, ReadService, ReadOrderItem,ReadServiceRequest,ReadRoomReservation
    ,payementStatusEnum
)
from services.email_service import send_reservation_email


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
    room_reservations: List[ReadRoomReservation] = []
    service_requests: List[ReadServiceRequest] = []
    order_items: List[ReadOrderItem] = []
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
    
    return PaginatedResponse[ReadReservationWithDetails](
        total_pages= 1 if total <= filters.limit else (total // filters.limit),
        total=total,
        active_page=filters.page,
        data=reservations
    )

@router.post("/", response_model=ReadReservationWithDetails, summary="Créer une réservation complète")
async def create_reservation(
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

    client_to_email = session.get(User, db_reservation.assigned_to) if db_reservation.assigned_to else current_user

    if client_to_email:
        email_data = build_email_context(session, client_to_email, db_reservation)
        background_tasks.add_task(
            send_reservation_email,
            email=client_to_email.email,
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


@router.post("/{reservation_id}/validate", response_model=ReadReservationWithDetails, summary="Valider et marquer une réservation comme payée")
def validate_reservation(
    reservation_id: int,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    # 1. Récupération de la réservation
    db_reservation = session.get(Reservation, reservation_id)
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Réservation introuvable")

    if db_reservation.status == StatusResrvationEnum.CONFIRMEE:
        raise HTTPException(status_code=400, detail="Cette réservation est déjà confirmée et payée.")

    now = datetime.now()

    # 2. Mise à jour du statut principal
    db_reservation.status = StatusResrvationEnum.CONFIRMEE

    # 3. Validation des paiements pour les Chambres, Services et Commandes
    for room_res in db_reservation.room_reservations:
        room_res.stay_status = payementStatusEnum.pAYEE
        room_res.payment_date = now
        session.add(room_res)

    for service_req in db_reservation.service_requests:
        service_req.status = payementStatusEnum.pAYEE
        service_req.payment_date = now
        session.add(service_req)

    for order_item in db_reservation.order_items:
        order_item.status = payementStatusEnum.pAYEE
        order_item.payment_date = now
        session.add(order_item)

    # 4. Sauvegarde globale en base de données
    session.add(db_reservation)
    session.commit()
    session.refresh(db_reservation)

    # 5. Envoi de l'e-mail de confirmation
    client_to_email = session.get(User, db_reservation.assigned_to)
    if client_to_email:
        email_data = build_email_context(session, client_to_email, db_reservation)
        background_tasks.add_task(
            send_reservation_email,
            email=client_to_email.email,
            reservation_details=email_data,
            message_title=f"Confirmation de votre réservation - {config.hotel_name}",
            template_name="reservations/reservation_confirmed.html"
        )

    return db_reservation





@router.post("/{reservation_id}/services/{service_request_id}/pay", response_model=ReadReservationWithDetails, summary="Payer un service spécifique")
def pay_service_request(
    reservation_id: int,
    service_request_id: int,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    # 1. Vérifications de base
    db_reservation = session.get(Reservation, reservation_id)
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Réservation introuvable")

    service_req = session.get(ServiceRequest, service_request_id)
    if not service_req or service_req.reservation_id != reservation_id:
        raise HTTPException(status_code=404, detail="Demande de service introuvable pour cette réservation")

    if service_req.status == payementStatusEnum.pAYEE:
        raise HTTPException(status_code=400, detail="Ce service a déjà été payé.")

    # 2. Mise à jour du statut
    now = datetime.now()
    service_req.status = payementStatusEnum.pAYEE
    service_req.payment_date = now
    
    session.add(service_req)
    session.commit()
    session.refresh(db_reservation)

    # 3. Récupération du nom du service pour l'e-mail
    service = session.get(Service, service_req.service_id)
    item_name = service.name if service else "Service additionnel"

    # 4. Envoi de l'e-mail de reçu
    client_to_email = session.get(User, db_reservation.assigned_to)
    if client_to_email:
        email_data = build_item_payment_context(client_to_email, db_reservation, item_name, service_req.total_price, now)
        background_tasks.add_task(
            send_reservation_email,
            email=client_to_email.email,
            reservation_details=email_data,
            message_title=f"Reçu de paiement - {item_name}",
            template_name="reservations/payment_receipt.html"
        )

    return db_reservation


@router.post("/{reservation_id}/order_items/{order_item_id}/pay", response_model=ReadReservationWithDetails, summary="Payer un produit ou une formule")
def pay_order_item(
    reservation_id: int,
    order_item_id: int,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    # 1. Vérifications de base
    db_reservation = session.get(Reservation, reservation_id)
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Réservation introuvable")

    order_item = session.get(OrderItem, order_item_id)
    if not order_item or order_item.reservation_id != reservation_id:
        raise HTTPException(status_code=404, detail="Commande introuvable pour cette réservation")

    if order_item.status == payementStatusEnum.pAYEE:
        raise HTTPException(status_code=400, detail="Cet article a déjà été payé.")

    # 2. Mise à jour du statut
    now = datetime.now()
    order_item.status = payementStatusEnum.pAYEE
    order_item.payment_date = now
    
    session.add(order_item)
    session.commit()
    session.refresh(db_reservation)

    # 3. Identification du produit/formule pour l'e-mail
    item_name = "Article commandé"
    if order_item.product_id:
        prod = session.get(Product, order_item.product_id)
        if prod: item_name = prod.name
    elif order_item.formule_id:
        form = session.get(Formule, order_item.formule_id)
        if form: item_name = form.name

    # 4. Envoi de l'e-mail de reçu
    client_to_email = session.get(User, db_reservation.assigned_to)
    if client_to_email:
        email_data = build_item_payment_context(client_to_email, db_reservation, f"Commande : {item_name}", order_item.total_price, now)
        background_tasks.add_task(
            send_reservation_email,
            email=client_to_email.email,
            reservation_details=email_data,
            message_title=f"Reçu de paiement - {item_name}",
            template_name="reservations/payment_receipt.html"
        )

    return db_reservation



@router.post("/{reservation_id}/services", response_model=ReadReservationWithDetails, summary="Ajouter un service à une réservation existante")
def add_service_to_reservation(
    reservation_id: int,
    service_input: ServiceRequestInput,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    # 1. Vérifier si la réservation existe
    db_reservation = session.get(Reservation, reservation_id)
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Réservation introuvable")

    # 2. Vérifier si le service existe
    db_service = session.get(Service, service_input.service_id)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service introuvable")

    # 3. Calcul du prix pour ce service
    tot = db_service.price * service_input.quantity

    # 4. Création de la demande de service
    service_req = ServiceRequest(
        reservation_id=db_reservation.id,
        service_id=db_service.id,
        quantity=service_input.quantity,
        unit_price=db_service.price,
        total_price=tot,
        status=payementStatusEnum.IMpAYEE # Reste impayé par défaut lors de l'ajout
    )
    session.add(service_req)

    # 5. Mise à jour du prix total de la réservation
    db_reservation.total_price += tot
    session.add(db_reservation)

    # 6. Sauvegarde en base de données
    session.commit()
    session.refresh(db_reservation)

    return db_reservation


@router.post("/{reservation_id}/order_items", response_model=ReadReservationWithDetails, summary="Ajouter une commande (produit/formule) à une réservation existante")
def add_order_item_to_reservation(
    reservation_id: int,
    order_input: OrderItemInput,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    # 1. Vérifier si la réservation existe
    db_reservation = session.get(Reservation, reservation_id)
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Réservation introuvable")

    # 2. Vérification de cohérence (il faut au moins un produit ou une formule)
    if not order_input.product_id and not order_input.formule_id:
        raise HTTPException(
            status_code=400, 
            detail="La commande doit contenir au moins un product_id ou un formule_id."
        )

    # 3. Récupération des prix
    price = Decimal(0)
    if order_input.product_id:
        prod = session.get(Product, order_input.product_id)
        if not prod:
            raise HTTPException(status_code=404, detail="Produit introuvable")
        price = prod.price
    elif order_input.formule_id:
        form = session.get(Formule, order_input.formule_id)
        if not form:
            raise HTTPException(status_code=404, detail="Formule introuvable")
        price = form.price

    # Calcul du total pour cet ajout
    tot = price * order_input.quantity_ordered

    # 4. Création de l'OrderItem
    order_item = OrderItem(
        reservation_id=db_reservation.id,
        product_id=order_input.product_id,
        formule_id=order_input.formule_id,
        quantity_ordered=order_input.quantity_ordered,
        unit_price=price,
        total_price=tot,
        status=payementStatusEnum.IMpAYEE # Reste impayé par défaut lors de l'ajout
    )
    session.add(order_item)

    # 5. Mise à jour du prix total de la réservation
    db_reservation.total_price += tot
    session.add(db_reservation)

    # 6. Sauvegarde en base de données
    session.commit()
    session.refresh(db_reservation)

    return db_reservation