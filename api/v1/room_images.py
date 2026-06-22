from pathlib import Path
import secrets
from typing import Annotated

from fastapi import APIRouter, Depends, File, Query, HTTPException, Body, UploadFile
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from auth import auth_utils
from dependencies import get_session
from models.models import  Room,  RoomImage, CreateRoomImage, ReadRoomImage, User, RoleEnum
from core.config import config

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp" }
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
# Chemin absolu vers le dossier uploads (racine du projet)

def upload_dir_exist():
    config.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

def validate_image(file: UploadFile) -> str:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Format d'image non supporté. Formats acceptés: {', '.join(ALLOWED_EXTENSIONS)}")
    return ext


router = APIRouter(
    prefix="/rooms/{room_id}/images",
    tags=["Les images des chambres"],
)


@router.get("/", response_model=list[ReadRoomImage], summary="Récupérer les images d'une chambre")
def get_room_images(
    room_id: int,
    session: Session = Depends(get_session),
):
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Chambre introuvable")

    images = session.exec(select(RoomImage).where(RoomImage.room_id == room_id)).all()

    return images # je retourne directement les images, car ReadRoomImage est un modèle de lecture qui inclut l'URL de l'image.


@router.post("/", response_model=ReadRoomImage, status_code=201, summary="Uploader une image pour une chambre")
async def upload_room_image(
    room_id: int,
    file: Annotated[UploadFile, File()],
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Chambre introuvable")

    ext = validate_image(file) # valider le format de l'image

    upload_dir_exist() # verifier que le dossier existe, sinon le créer

    # extraire le contenu du fichier pour vérifier sa taille
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux. Taille maximale autorisée: 5 Mo")
    
    unique_filename = f"{room.room_type.name}-{room.room_number}-{secrets.token_urlsafe(3).upper().replace("_","")}{ext}" #Suite-12-UZR.jpg
    file_location = config.UPLOADS_DIR / f"{unique_filename}"
    try:
        file_location.write_bytes(content) # enregistrer le fichier sur le disque
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement du fichier: {str(e)}")
    
    # woww url finale de l'image
    image_url = f"{config.uploads_url}/{file_location.name}"

    new_image = RoomImage(name=unique_filename, url=image_url, room_id=room_id)
    session.add(new_image)
    session.commit()
    session.refresh(new_image)

    return new_image

@router.delete("/{image_id}", status_code=204, summary="Supprimer une image d'une chambre")
def delete_room_image(
    room_id: int,
    image_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Chambre introuvable")

    image = session.get(RoomImage, image_id)
    if not image or image.room_id != room_id:
        raise HTTPException(status_code=404, detail="Image introuvable pour cette chambre")

    # Supprimer le fichier de l'image du disque
    file_path = config.UPLOADS_DIR / image.name
    if file_path.exists():
        print(f"Suppression du fichier: {file_path}")  # Log pour vérifier le chemin
        file_path.unlink()

    session.delete(image)
    session.commit()

    return {"detail": "Image supprimée avec succès"}