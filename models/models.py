from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Annotated, Optional, List, Sequence, TypeVar, Generic
import secrets


from pydantic import BaseModel, BeforeValidator, EmailStr
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, String, Boolean, DECIMAL, Text


# ---------- unique reference generator ----------
def gen_reference() -> str:
    return f"SRA-{date.today().__str__()}-{secrets.token_urlsafe(3).upper().replace('_', '')}"


class payementStatusEnum(str, Enum):
    pAYEE = "pAYEE"
    IMpAYEE = "IMpAYEE"

# ====================== ASSOCIATION / JUNCTION TABLES ======================

class RoomTypeEquipement(SQLModel, table=True):            # was detenir
  
    __tablename__ = "room_type_equipements"

    room_type_id: int = Field(foreign_key="room_types.id", primary_key=True)
    equipement_id: int = Field(foreign_key="equipements.id", primary_key=True)


class RoomApartment(SQLModel, table=True):              # was composer
  
    __tablename__ = "room_apartments"

    room_id: int = Field(foreign_key="rooms.id", primary_key=True)
    apartment_id: int = Field(foreign_key="apartments.id", primary_key=True)


class FormuleProduct(SQLModel, table=True):             # was former

    __tablename__ = "formules_products"

    product_id: int = Field(foreign_key="products.id", primary_key=True)
    formule_id: int = Field(foreign_key="formule.id", primary_key=True)
    quantity: int




class ServiceRequest(SQLModel, table=True):             # was demander
    __tablename__ = "service_requests"

    reservation_id: int = Field(foreign_key="reservations.id", primary_key=True)
    service_id: int = Field(foreign_key="services.id", primary_key=True)
    request_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime))
    quantity: int
    status: payementStatusEnum = payementStatusEnum.IMpAYEE


class RoomReservation(SQLModel, table=True):            # was contenir
    __tablename__ = "room_reservations"

    room_id: int = Field(foreign_key="rooms.id", primary_key=True)
    reservation_id: int = Field(foreign_key="reservations.id", primary_key=True)
    stay_status: payementStatusEnum = payementStatusEnum.IMpAYEE
    payment_date: Optional[datetime] = Field(default=None, sa_column=Column(DateTime))

# ====================== MAIN ENTITIES ======================



# =========================================
# Models for Users, Roles, and Authentication
# =========================================
class RoleEnum(str, Enum):
    ADMIN = "Admin"
    RECEPTIONISTE = "Receptioniste"
    ENTRETIENT = "Entretient"
    CLIENT = "Client"

# fonction de validation du numéro de téléphone ivoirien
def _validate_phone(value: str) -> str:
    """Valide un numéro ivoirien : 10 chiffres, commence par 01/05/07, pas de lettres."""
    if not isinstance(value, str):
        raise ValueError("Le numéro de téléphone doit être une chaîne de caractères")
    cleaned = value.strip().replace(" ", "").replace("-", "")
    if not cleaned.isdigit():
        raise ValueError("Le numéro de téléphone ne doit contenir que des chiffres")
    if len(cleaned) != 10:
        raise ValueError("Le numéro de téléphone doit contenir exactement 10 chiffres")
    if not cleaned.startswith(("01", "05", "07")):
        raise ValueError("Le numéro de téléphone doit commencer par 01, 05 ou 07")
    return cleaned

PhoneStr = Annotated[str, BeforeValidator(_validate_phone)]

class BaseUser(SQLModel):
    email: EmailStr
    phone_number: PhoneStr
    is_active: bool = Field(default=True)
    last_name: str                 # was nom_user
    first_name: str # was prenom_user

class User(BaseUser, table=True):
    __tablename__ = "users"

    id: int|None = Field(default=None, primary_key=True)
    password: str 
    role_name: RoleEnum =  RoleEnum.CLIENT               # was nom_role
    created_at: datetime = Field(default_factory=datetime.now)
    # relationships
    reservations: List["Reservation"] = Relationship(back_populates="user") # la liste des reservation pour un utilisateur

class CreateUser(BaseUser):
    password: str 

class ReadUser(BaseUser):
    id: int
    role_name: RoleEnum

class UpdateUser(SQLModel):
    email: EmailStr = None
    phone_number: PhoneStr= None
    is_active: bool = None
    created_at: datetime = None
    last_name: str  = None               
    first_name: str = None
    role_name: RoleEnum = None

class JWTInfoUser(SQLModel):
    id: int
    role_name: RoleEnum

class LoginUser(SQLModel):
    email: EmailStr
    password: str
# =========================================
# Models Room Types
# =========================================
class BaseRoomType(SQLModel):
    name: str
    capacity: int
    price: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    description: str | None = Field(default=None)   # plus de Optional


# ---------- Table SQL ----------
class RoomType(BaseRoomType, table=True):
    __tablename__ = "room_types"

    id: int | None = Field(default=None, primary_key=True)

    # relations
    rooms: List["Room"] = Relationship(back_populates="room_type")
    equipements: List["Equipement"] = Relationship(back_populates="room_types", link_model=RoomTypeEquipement)
    images: List["RoomImage"] = Relationship(back_populates="room_type")


class CreateRoomType(BaseRoomType):
    pass


class ReadRoomType(BaseRoomType):
    id: int   # id obligatoire en sortie


class UpdateRoomType(SQLModel):
    name: str | None = None
    capacity: int | None = None
    price: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    description: str | None = None

 # =====================================
 # Models for Formule
 # =====================================

class BaseFormule(SQLModel):
    name: str
    description: str | None = Field(default=None)
    price: Decimal = Field(default=0, max_digits=10, decimal_places=2)



class Formule(BaseFormule, table=True):
    __tablename__ = "formule"

    id: int | None = Field(default=None, primary_key=True)

    # relations
    products: List["Product"] = Relationship(back_populates="formule", link_model=FormuleProduct)
    order_items: List["OrderItem"] = Relationship(back_populates="formule")



class CreateFormule(BaseFormule):
    """Schéma de création, identique à la base."""
    pass


class ReadFormule(BaseFormule):
    """Schéma de lecture, inclut l'id."""
    id: int


class UpdateFormule(SQLModel):
    """Mise à jour partielle : tous les champs optionnels."""
    name: str | None = None
    description: str | None = None
    price: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)

# =====================================
# Models for Reservations
# =====================================
class StatusResrvationEnum(str, Enum):
    CONFIRMEE = "Confirmée"
    ANNULEE = "Annulée"
    EN_ATTENTE = "En attente"
    FINE = "Finie"



class BaseReservation(SQLModel):
    reference: str = Field(default_factory=gen_reference, index=True)
    check_in: datetime
    check_out: datetime
    description: str | None = Field(default=None)
    status: StatusResrvationEnum
    total_price: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    assigned_to: int  


class Reservation(BaseReservation, table=True):
    __tablename__ = "reservations"

    id: int | None = Field(default=None, primary_key=True)

    # FK vers User
    user_id: int = Field(foreign_key="users.id")
    user: User = Relationship(back_populates="reservations")

    # relations many-to-many
    rooms: List["Room"] = Relationship(back_populates="reservations", link_model=RoomReservation)
    services: List["Service"] = Relationship(back_populates="reservations", link_model=ServiceRequest)
    order_items: List["OrderItem"] = Relationship(back_populates="reservation")



class CreateReservation(BaseReservation):
    user_id: int


class ReadReservation(BaseReservation):
    id: int
    user_id: int


class UpdateReservation(SQLModel):
    reference: str | None = None
    check_in: datetime | None = None
    check_out: datetime | None = None
    description: str | None = None
    status: StatusResrvationEnum | None = None
    total_price: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    assigned_to: int | None = None
    user_id: int | None = None

class OrderItem(SQLModel, table=True):                  # was commander

    __tablename__ = "order_items"

    id: int | None = Field(default=None, primary_key=True)
    product_id: int|None = Field(default=None, foreign_key="products.id")
    formule_id: int|None = Field(default=None, foreign_key="formule.id")
    reservation_id: int = Field(foreign_key="reservations.id")
    quantity_ordered: int
    order_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime))
    status: payementStatusEnum = payementStatusEnum.IMpAYEE

    # relationships
    reservation: "Reservation" = Relationship(back_populates="order_items")
    product: "Product" = Relationship(back_populates="order_items")
    formule: "Formule" = Relationship(back_populates="order_items")
# =====================================
# Models for Services
# =====================================
class BaseService(SQLModel):
    name: str
    price: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    description: str | None = Field(default=None)


class Service(BaseService, table=True):
    __tablename__ = "services"

    id: int | None = Field(default=None, primary_key=True)

    # relationship
    reservations: List[Reservation] = Relationship(back_populates="services", link_model=ServiceRequest)

class CreateService(BaseService):
    pass

class ReadService(BaseService):
    id: int

class UpdateService(SQLModel):
    name: str | None = None
    price: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    description: str | None = None


# =====================================
# Models for Equipements
# =====================================
class BaseEquipement(SQLModel):
    name: str
    icon_url: str

class Equipement(BaseEquipement, table=True):
    __tablename__ = "equipements"

    id: int | None = Field(default=None, primary_key=True)

    # relation many‑to‑many
    room_types: List[RoomType] = Relationship(back_populates="equipements", link_model=RoomTypeEquipement)

class CreateEquipement(BaseEquipement):
    pass

class ReadEquipement(BaseEquipement):
    id: int

class UpdateEquipement(SQLModel):
    name: str | None = None
    icon_url: str | None = None

# =====================================
# Models for Room Images
# =====================================
class BaseRoomImage(SQLModel):
    name: str
    url: str
    room_type_id: int = Field(foreign_key="room_types.id")

class RoomImage(BaseRoomImage, table=True):
    __tablename__ = "room_images"

    id: int | None = Field(default=None, primary_key=True)

    # relation
    room_type: RoomType = Relationship(back_populates="images")


class CreateRoomImage(BaseRoomImage):
    pass

class ReadRoomImage(BaseRoomImage):
    id: int

class UpdateRoomImage(SQLModel):
    name: str | None = None
    url: str | None = None
    room_type_id: int | None = None

# =====================================
# Models for Apartments
# =====================================
class BaseApartment(SQLModel):
    name: str

class Apartment(BaseApartment, table=True):
    __tablename__ = "apartments"

    id: int | None = Field(default=None, primary_key=True)

    # relation many‑to‑many
    rooms: List["Room"] = Relationship(back_populates="apartments", link_model=RoomApartment)

class CreateApartment(BaseApartment):
    pass

class ReadApartment(BaseApartment):
    id: int

class UpdateApartment(SQLModel):
    name: str | None = None

# =====================================
# Models for Product Types and Products
# =====================================
class BaseProductType(SQLModel):
    name: str

class ProductType(BaseProductType, table=True):
    __tablename__ = "product_types"

    id: int | None = Field(default=None, primary_key=True)

    # relation
    products: List["Product"] = Relationship(back_populates="product_type")

class CreateProductType(BaseProductType):
    pass

class ReadProductType(BaseProductType):
    id: int

class UpdateProductType(SQLModel):
    name: str | None = None

# --------------------------------

class BaseProduct(SQLModel):
    name: str
    price: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    description: str | None = Field(default=None)
    product_type_id: int = Field(foreign_key="product_types.id")

class Product(BaseProduct, table=True):
    __tablename__ = "products"

    id: int | None = Field(default=None, primary_key=True)

    # relations
    product_type: ProductType = Relationship(back_populates="products")
    formule: List[Formule] = Relationship(back_populates="products", link_model=FormuleProduct)
    order_items: List[OrderItem] = Relationship(back_populates="product")


class CreateProduct(BaseProduct):
    pass

class ReadProduct(BaseProduct):
    id: int

class UpdateProduct(SQLModel):
    name: str | None = None
    price: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    description: str | None = None
    product_type_id: int | None = None

# =====================================
# Models for Rooms
# =====================================
class RoomStatusEnum(str, Enum):
    DISPONIBLE = "DISPONIBLE"
    OCCUPEE = "OCCUPÉE"
    MAINTENANCE = "MAINTENANCE"
    RESERVE = "RESERVÉ"


class BaseRoom(SQLModel):
    room_number: int = Field(unique=True)
    status: RoomStatusEnum = RoomStatusEnum.DISPONIBLE
    room_type_id: int = Field(foreign_key="room_types.id")


class Room(BaseRoom, table=True):
    __tablename__ = "rooms"

    id: int | None = Field(default=None, primary_key=True)

    # relations
    room_type: RoomType = Relationship(back_populates="rooms")
    reservations: List[Reservation] = Relationship(back_populates="rooms", link_model=RoomReservation)
    apartments: List[Apartment] = Relationship(back_populates="rooms", link_model=RoomApartment)


class CreateRoom(BaseRoom):
    pass

class ReadRoom(BaseRoom):
    id: int

class UpdateRoom(SQLModel):
    room_number: int | None = None
    status: RoomStatusEnum | None = None
    room_type_id: int | None = None


# models des filtres pour la pagination et le tri
class FilterParams(BaseModel):
    limit: int = Field(5, le=10,ge=1)
    page: int = Field(1, ge=1)
    #order_by: Literal["created_at", "updated_at"] = "created_at"
    #tags: list[str] = []
    @property
    def get_page(self):
        return (self.page - 1) * self.limit

class UserFilters(FilterParams):
    is_active: Optional[bool] = True
    role_name: Optional[RoleEnum] = RoleEnum.CLIENT

# permet de renvoyer une liste d'objets de n'importe quelle entité avec les infos de pagination
T = TypeVar("T")
class PaginatedResponse(
    BaseModel,
    Generic[T]
):
    active_page: int
    total_pages: int
    total: int

    data: Sequence[T]
    