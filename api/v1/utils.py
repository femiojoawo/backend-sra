from datetime import datetime
from typing import List
from sqlmodel import Session, select
from models.models import (
    Reservation, RoomReservation, StatusResrvationEnum, User,
    
)
from sqlmodel import Session
from core.config import config

def is_room_available(
    session: Session, 
    room_ids: List[int], 
    check_in: datetime, 
    check_out: datetime
) -> bool:
    """
    Vérifie si la ou les chambres demandées sont disponibles pour les dates spécifiées.
    Retourne True si toutes les chambres sont libres, False si au moins une est occupée.
    """
    # Requête pour trouver si l'une des chambres est déjà réservée sur ces dates
    statement = (
        select(RoomReservation.room_id)
        .join(Reservation, RoomReservation.reservation_id == Reservation.id)
        .where(RoomReservation.room_id.in_(room_ids))
        .where(
            # Condition mathématique de chevauchement de dates
            (Reservation.check_in < check_out) & 
            (Reservation.check_out > check_in)
        )
        .where(
            # On ignore les réservations qui ont été annulées
            Reservation.status != StatusResrvationEnum.ANNULEE
        )
    )
    
    occupied_rooms = session.exec(statement).all()
    
    # Si la liste est vide, aucune chambre n'est occupée, donc c'est disponible
    return len(occupied_rooms) == 0
def build_email_context(session: Session, user: User, reservation: Reservation) -> dict:
    """
    Construit le dictionnaire de données injecté dans les templates d'e-mail HTML.
    Adapté au modèle Reservation actuel (sans nb_adults / nb_children).
    """
    return {
        "client_name": f"{user.first_name} {user.last_name}",
        "hotel_name": config.hotel_name,
        "reservation_reference": reservation.reference,
        
        # Formatage des dates au format français (ex: 29/06/2026 à 14:00)
        "check_in_date": reservation.check_in.strftime("%d/%m/%Y à %H:%M"),
        "check_out_date": reservation.check_out.strftime("%d/%m/%Y à %H:%M"),
        
        # Formatage du prix avec séparateur de milliers
        "total_price": f"{reservation.total_price:,.0f}".replace(",", " "),
        
        # Infos de l'hôtel tirées du fichier de config (.env)
        "payment_phone": config.hotel_phone,
        "payment_email": config.hotel_email,
        "hotel_address": config.hotel_address,
        "hotel_phone": config.hotel_phone,
        "hotel_email": config.hotel_email,
        "current_year": datetime.now().year
    }

from decimal import Decimal
# ... (tes autres imports) ...

def build_item_payment_context(user: User, reservation: Reservation, item_name: str, item_price: Decimal, payment_date: datetime) -> dict:
    """
    Construit le contexte pour l'e-mail de reçu d'un paiement ciblé (Service ou Produit).
    """
    return {
        "client_name": f"{user.first_name} {user.last_name}",
        "hotel_name": config.hotel_name,
        "reservation_reference": reservation.reference,
        "item_name": item_name,
        "item_price": f"{item_price:,.0f}".replace(",", " "),
        "payment_date": payment_date.strftime("%d/%m/%Y à %H:%M"),
        "hotel_address": config.hotel_address,
        "hotel_phone": config.hotel_phone,
        "hotel_email": config.hotel_email,
        "current_year": datetime.now().year
    }