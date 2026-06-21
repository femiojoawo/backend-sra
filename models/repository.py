import sys
from pathlib import Path

# Ajoute le dossier parent (app/) au chemin Python


from .db import engine, create_tables
from .models import *


def main():
    create_tables()
    print("Tables created successfully!")

if __name__ == "__main__":
    main()
