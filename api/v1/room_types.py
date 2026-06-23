from typing import Annotated
from sqlalchemy.exc import IntegrityError
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlmodel import Session, select

from auth import auth_utils
from dependencies import get_session
from models.models import CreateRoomType, Equipement, PaginatedResponse, ReadRoomType, RoleEnum, RoomType, RoomTypeFilters, User


router = APIRouter(
    prefix="/room_types",
    tags=["Types de chambres"],
)


@router.get("/", response_model=PaginatedResponse[ReadRoomType] ,summary="Récupérer les types de chambres", description="Récupère une liste paginée de types de chambres avec des filtres optionnels pour la capacité, le prix et le nom.")
def get_room_types(*, 
    session: Session = Depends(get_session),
    filters: Annotated[RoomTypeFilters, Query()]
    ):
    total = len(session.exec(select(RoomType)).all())
    statement = select(RoomType).where(
            (RoomType.capacity >= filters.capacity) &
            (RoomType.price >= filters.price_min) &
            (RoomType.price <= filters.price_max)
        )
    if filters.name:
        statement = statement.where(RoomType.name.ilike(f"%{filters.name}%"))
    room_types = session.exec(statement).all()
    return PaginatedResponse[ReadRoomType](
        total_pages= 1 if total <= filters.limit else (total // filters.limit),
        total=total,
        active_page=filters.page,
        data=room_types
    )


@router.get("/{room_type_id}", response_model=ReadRoomType, summary="Récupérer un type de chambre", description="Récupère un type de chambre spécifique par son ID.")
def get_room_type_by_id(*, room_type_id: int, session: Session = Depends(get_session)):
    room_type = session.get(RoomType, room_type_id)
    if not room_type:
        raise HTTPException(status_code=404, detail="Type de chambre Introuvable")
    return room_type


@router.post("/", response_model=ReadRoomType, summary="Créer un type de chambre", description="Crée un nouveau type de chambre. Seuls les administrateurs peuvent effectuer cette action.")
def create_room_type(*, room_type: Annotated[CreateRoomType, Body()], session: Session = Depends(get_session), current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))):
    db_room_type = RoomType.model_validate(room_type)
    session.add(db_room_type)
    try:
        session.commit()
    except IntegrityError as e:
        raise HTTPException(
            status_code=409,
            detail=str(e.orig)
        )
    return db_room_type

router.patch("/{room_type_id}", response_model=ReadRoomType, summary="Mettre à jour un type de chambre", description="Met à jour un type de chambre spécifique par son ID. Seuls les administrateurs peuvent effectuer cette action.")
def update_room_type(*, room_type_id: int, room_type: Annotated[CreateRoomType, Body()], session: Session = Depends(get_session), current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))):
    db_room_type = session.get(RoomType, room_type_id)
    if not db_room_type:
        raise HTTPException(status_code=404, detail="Type de chambre Introuvable")
    db_room_type.sqlmodel_update(room_type.model_dump(exclude_unset=True))
    try:
        session.commit(db_room_type)
    except IntegrityError as e:
        raise HTTPException(
            status_code=409,
            detail=str(e.orig)
        )
    return db_room_type

@router.delete("/{room_type_id}", summary="Supprimer un type de chambre", description="Supprime un type de chambre spécifique par son ID. Seuls les administrateurs peuvent effectuer cette action.")
def delete_room_type(*, room_type_id: int, session: Session = Depends(get_session), current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))):
    room_type = session.get(RoomType, room_type_id)
    if not room_type:
        raise HTTPException(status_code=404, detail="Type de chambre Introuvable")
    session.delete(room_type)
    session.commit()
    return {"detail": "Type de chambre supprimé avec succès"}


@router.post("/{room_type_id}/equipements/{equipement_id}", response_model=ReadRoomType, summary="Associer un équipement à un type de chambre")
def add_equipement_to_room_type(
    room_type_id: int,
    equipement_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    # 1. Vérifier si le type de chambre existe
    db_room_type = session.get(RoomType, room_type_id)
    if not db_room_type:
        raise HTTPException(status_code=404, detail="Type de chambre introuvable")

    # 2. Vérifier si l'équipement existe
    db_equipement = session.get(Equipement, equipement_id)
    if not db_equipement:
        raise HTTPException(status_code=404, detail="Équipement introuvable")

    # 3. Vérifier s'il n'est pas déjà associé pour éviter les doublons
    if db_equipement in db_room_type.equipements:
        raise HTTPException(status_code=400, detail="Cet équipement est déjà associé à ce type de chambre.")

    # 4. Ajouter l'équipement à la liste (SQLModel gère la table de jonction automatiquement)
    db_room_type.equipements.append(db_equipement)
    session.add(db_room_type)
    session.commit()
    session.refresh(db_room_type)

    return db_room_type


@router.delete("/{room_type_id}/equipements/{equipement_id}", response_model=ReadRoomType, summary="Retirer un équipement d'un type de chambre")
def remove_equipement_from_room_type(
    room_type_id: int,
    equipement_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    # 1. Vérifier si le type de chambre existe
    db_room_type = session.get(RoomType, room_type_id)
    if not db_room_type:
        raise HTTPException(status_code=404, detail="Type de chambre introuvable")

    # 2. Vérifier si l'équipement existe
    db_equipement = session.get(Equipement, equipement_id)
    if not db_equipement:
        raise HTTPException(status_code=404, detail="Équipement introuvable")

    # 3. Vérifier si l'association existe bien avant de la supprimer
    if db_equipement not in db_room_type.equipements:
        raise HTTPException(status_code=400, detail="Cet équipement n'est pas associé à ce type de chambre.")

    # 4. Retirer l'équipement de la liste
    db_room_type.equipements.remove(db_equipement)
    session.add(db_room_type)
    session.commit()
    session.refresh(db_room_type)

    return db_room_type
