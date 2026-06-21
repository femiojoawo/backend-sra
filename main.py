import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from auth import token
from api.v1 import user

app = FastAPI()

# # Chemin absolu vers le dossier uploads (à la racine du projet)
# UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
# os.makedirs(UPLOADS_DIR, exist_ok=True) # verifier que le dossier existe, sinon le créer

# Servir les fichiers uploadés (images)
# app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

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