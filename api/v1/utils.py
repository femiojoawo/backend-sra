from datetime import datetime
from typing import List
from sqlmodel import Session, select
from models.models import Reservation, RoomReservation, StatusResrvationEnum

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