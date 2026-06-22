import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from auth import token
from api.v1 import (user,room_types, room_images
    , rooms, services, products,
    reservations, equiments, formules, product_types)
from core.config import config

app = FastAPI()

# # Chemin absolu vers le dossier uploads (à la racine du projet)
# UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
# os.makedirs(UPLOADS_DIR, exist_ok=True) # verifier que le dossier existe, sinon le créer

#Servir les fichiers uploadés (images)

app.mount(config.uploads_url, StaticFiles(directory=str(config.UPLOADS_DIR)), name="uploads")

# a modifier pour mettre l'url du front end
origins = [

]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(token.router)
app.include_router(user.router)
app.include_router(room_types.router)
app.include_router(room_images.router)
app.include_router(rooms.router)
app.include_router(reservations.router)
app.include_router(services.router)
app.include_router(equiments.router)
app.include_router(formules.router)
app.include_router(products.router)
app.include_router(product_types.router)