from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlmodel import Session, select, func

from models.models import (
    Formule, CreateFormule, ReadFormule, UpdateFormule, 
    Product, FormuleProduct, # <--- Nouveaux imports nécessaires
    PaginatedResponse, FilterParams, User, RoleEnum
)
from dependencies import get_session
from auth import auth_utils

router = APIRouter(prefix="/formules", tags=["Formules"])

# ==========================================
# Schémas spécifiques pour la création de Formule
# ==========================================
class ProductQuantityInput(BaseModel):
    product_id: int
    quantity: int = 1

class FormuleCreateInput(CreateFormule):
    products: List[ProductQuantityInput] = []

# ==========================================

class FormuleFilters(FilterParams):
    name: str | None = None

@router.get("/", response_model=PaginatedResponse[ReadFormule], summary="Lister les formules")
def get_formules(
    filters: Annotated[FormuleFilters, Query()],
    session: Session = Depends(get_session)
):
    # ... (Garde ton code existant pour le GET) ...
    statement = select(Formule)
    total_statement = select(func.count(Formule.id))
    
    if filters.name:
        statement = statement.where(Formule.name.ilike(f"%{filters.name}%"))
        total_statement = total_statement.where(Formule.name.ilike(f"%{filters.name}%"))
        
    total = session.exec(total_statement).one()
    formules = session.exec(statement.offset(filters.get_page).limit(filters.limit)).all()
    
    return PaginatedResponse[ReadFormule](
        total_pages=(total + filters.limit - 1) // filters.limit if total > 0 else 1,
        total=total,
        active_page=filters.page,
        data=formules
    )

@router.post("/", response_model=ReadFormule, status_code=status.HTTP_201_CREATED, summary="Créer une formule et ses produits")
def create_formule(
    formule_data: FormuleCreateInput, # <--- On utilise le nouveau schéma
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    # 1. Vérification stricte : s'assurer que tous les produits existent AVANT de créer la formule
    if formule_data.products:
        product_ids = [p.product_id for p in formule_data.products]
        # On récupère tous les produits demandés en une seule requête SQL
        db_products = session.exec(select(Product).where(Product.id.in_(product_ids))).all()
        
        if len(db_products) != len(product_ids):
            raise HTTPException(
                status_code=404, 
                detail="Un ou plusieurs produits spécifiés sont introuvables. La formule n'a pas été créée."
            )

    # 2. Création de la Formule de base
    db_formule = Formule(
        name=formule_data.name,
        description=formule_data.description,
        price=formule_data.price
    )
    session.add(db_formule)
    session.commit()
    session.refresh(db_formule)

    # 3. Création des liaisons dans la table de jonction FormuleProduct
    if formule_data.products:
        for item in formule_data.products:
            formule_product = FormuleProduct(
                formule_id=db_formule.id,
                product_id=item.product_id,
                quantity=item.quantity
            )
            session.add(formule_product)
        
        # Un seul commit pour toutes les liaisons (optimisation des performances de la base de données)
        session.commit()
        session.refresh(db_formule)

    return db_formule

@router.patch("/{formule_id}", response_model=ReadFormule, summary="Modifier une formule")
def update_formule(
    formule_id: int,
    update_data: UpdateFormule,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    db_formule = session.get(Formule, formule_id)
    if not db_formule:
        raise HTTPException(status_code=404, detail="Formule introuvable")
        
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_formule, key, value)
        
    session.add(db_formule)
    session.commit()
    session.refresh(db_formule)
    return db_formule

@router.delete("/{formule_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Supprimer une formule")
def delete_formule(
    formule_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    db_formule = session.get(Formule, formule_id)
    if not db_formule:
        raise HTTPException(status_code=404, detail="Formule introuvable")
        
    session.delete(db_formule)
    session.commit()