import random
from datetime import datetime, timedelta
from sqlmodel import Session
from faker import Faker

# Import de votre configuration DB
from models.db import engine, create_tables

# IMPORTANT : On importe TOUT pour forcer SQLModel à détecter et créer toutes les tables
from models.models import *

# Initialisation de Faker en français
fake = Faker('fr_FR')

def generate_ivorian_phone() -> str:
    """Valide un numéro ivoirien : 10 chiffres, commence par 01/05/07."""
    prefix = random.choice(["01", "05", "07"])
    suffix = f"{random.randint(0, 99999999):08d}"
    return prefix + suffix

def run_seed():
    print("Création de TOUTES les tables...")
    create_tables()

    print("Début du remplissage de la base de données...")
    with Session(engine) as session:
        
        # 1. Équipements
        equipements_data = [
            {"name": "Wi-Fi Haut Débit", "icon_url": "/icons/wifi.png"},
            {"name": "Climatisation", "icon_url": "/icons/ac.png"},
            {"name": "Télévision 4K", "icon_url": "/icons/tv.png"}
        ]
        equipements = [Equipement(**data) for data in equipements_data]
        session.add_all(equipements)
        
        # 2. Types de Chambres
        room_types_data = [
            {"name": "Standard", "capacity": 2, "price": 50000, "description": "Confortable."},
            {"name": "Deluxe", "capacity": 2, "price": 85000, "description": "Spacieuse."},
            {"name": "Suite", "capacity": 4, "price": 150000, "description": "Luxueuse."}
        ]
        room_types = [RoomType(**data) for data in room_types_data]
        session.add_all(room_types)
        session.commit()
        for rt in room_types: session.refresh(rt)
        room_prices = {rt.id: rt.price for rt in room_types}

        # 3. Chambres
        rooms = [Room(room_number=100+i, status=random.choice(list(RoomStatusEnum)), room_type_id=random.choice(room_types).id) for i in range(1, 21)]
        session.add_all(rooms)

        # 4. Utilisateurs
        users = []
        for _ in range(20):
            users.append(User(
                email=fake.unique.email(),
                phone_number=generate_ivorian_phone(),
                last_name=fake.last_name(),
                first_name=fake.first_name(),
                password="password_provisoire_123", 
                role_name=random.choice(list(RoleEnum)),
                is_active=True
            ))
        session.add_all(users)
        session.commit()
        for u in users: session.refresh(u)

        # 5. Services & Produits (pour vérifier la création des autres tables)
        services_data = [
            {"name": "Petit déjeuner complet", "price": 10000},
            {"name": "Blanchisserie", "price": 5000}
        ]
        services = [Service(**data) for data in services_data]
        session.add_all(services)

        pt_boisson = ProductType(name="Boissons")
        session.add(pt_boisson)
        session.commit()
        session.refresh(pt_boisson)

        produits = [
            Product(name="Coca-Cola", price=1500, product_type_id=pt_boisson.id),
            Product(name="Eau Minérale Awa", price=1000, product_type_id=pt_boisson.id)
        ]
        session.add_all(produits)
        session.commit()
        for s in services: session.refresh(s)

        # 6. Réservations
        print("Génération des réservations...")
        for i in range(20):
            days_ahead = random.randint(1, 30)
            stay_duration = random.randint(1, 7)
            check_in_date = datetime.now() + timedelta(days=days_ahead)
            check_out_date = check_in_date + timedelta(days=stay_duration)

            current_user = random.choice(users)

            # Création de la réservation parente (Correction de l'erreur assigned_to ici)
            reservation = Reservation(
                user_id=current_user.id,
                assigned_to=current_user.id,  # Rempli obligatoirement pour contrer le NOT NULL
                check_in=check_in_date,
                check_out=check_out_date,
                status=random.choice(list(StatusResrvationEnum)),
                description=f"Séjour #{i+1}"
            )
            session.add(reservation)
            session.commit()
            session.refresh(reservation)

            total_reservation_price = 0

            # Lier une chambre
            room = random.choice(rooms)
            unit_price_room = room_prices[room.room_type_id]
            total_room_price = unit_price_room * stay_duration
            total_reservation_price += total_room_price

            session.add(RoomReservation(
                room_id=room.id, reservation_id=reservation.id,
                unit_price=unit_price_room, total_price=total_room_price,
                stay_status=random.choice(list(payementStatusEnum))
            ))

            # Lier un service aléatoire
            if random.choice([True, False]):
                service = random.choice(services)
                qty = random.randint(1, 3)
                total_service_price = service.price * qty
                total_reservation_price += total_service_price

                session.add(ServiceRequest(
                    reservation_id=reservation.id, service_id=service.id, quantity=qty,
                    unit_price=service.price, total_price=total_service_price,
                    status=random.choice(list(payementStatusEnum))
                ))

            # Update du prix final
            reservation.total_price = total_reservation_price
            session.add(reservation)

        # Sauvegarde finale
        session.commit()
        
    print("✅ Le Seeding est terminé avec succès !")

if __name__ == "__main__":
    try:
        run_seed()
    except Exception as e:
        print(f"❌ Une erreur s'est produite lors du seeding : {e}")