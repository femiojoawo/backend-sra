from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select, func

from models.models import (
    ProductType, CreateProductType, ReadProductType, UpdateProductType,
    Product, # Importé pour la vérification de suppression
    PaginatedResponse, FilterParams, User, RoleEnum
)
from dependencies import get_session
from auth import auth_utils

router = APIRouter(prefix="/product-types", tags=["Types de Produits"])

class ProductTypeFilters(FilterParams):
    name: str | None = None

@router.get("/", response_model=PaginatedResponse[ReadProductType], summary="Lister les types de produits")
def get_product_types(
    filters: Annotated[ProductTypeFilters, Query()],
    session: Session = Depends(get_session)
):
    statement = select(ProductType)
    total_statement = select(func.count(ProductType.id))
    
    if filters.name:
        statement = statement.where(ProductType.name.ilike(f"%{filters.name}%"))
        total_statement = total_statement.where(ProductType.name.ilike(f"%{filters.name}%"))
        
    total = session.exec(total_statement).one()
    product_types = session.exec(statement.offset(filters.get_page).limit(filters.limit)).all()
    
    return PaginatedResponse[ReadProductType](
        total_pages=(total + filters.limit - 1) // filters.limit if total > 0 else 1,
        total=total,
        active_page=filters.page,
        data=product_types
    )

@router.post("/", response_model=ReadProductType, status_code=status.HTTP_201_CREATED, summary="Créer un type de produit")
def create_product_type(
    product_type_data: CreateProductType,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    db_product_type = ProductType.model_validate(product_type_data)
    session.add(db_product_type)
    session.commit()
    session.refresh(db_product_type)
    return db_product_type

@router.patch("/{product_type_id}", response_model=ReadProductType, summary="Modifier un type de produit")
def update_product_type(
    product_type_id: int,
    update_data: UpdateProductType,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    db_product_type = session.get(ProductType, product_type_id)
    if not db_product_type:
        raise HTTPException(status_code=404, detail="Type de produit introuvable")
        
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_product_type, key, value)
        
    session.add(db_product_type)
    session.commit()
    session.refresh(db_product_type)
    return db_product_type

@router.delete("/{product_type_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Supprimer un type de produit")
def delete_product_type(
    product_type_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    db_product_type = session.get(ProductType, product_type_id)
    if not db_product_type:
        raise HTTPException(status_code=404, detail="Type de produit introuvable")
        
    # Vérification de sécurité : on ne supprime pas un type si des produits l'utilisent encore
    products_using_this_type = session.exec(select(Product).where(Product.product_type_id == product_type_id)).first()
    if products_using_this_type:
        raise HTTPException(
            status_code=400, 
            detail="Impossible de supprimer cette catégorie car des produits y sont encore rattachés. Veuillez d'abord modifier ou supprimer ces produits."
        )
        
    session.delete(db_product_type)
    session.commit()