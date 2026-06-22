from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select, func

from models.models import (
    Product, CreateProduct, ReadProduct, UpdateProduct, ProductType,
    PaginatedResponse, FilterParams, User, RoleEnum
)
from dependencies import get_session
from auth import auth_utils

router = APIRouter(prefix="/products", tags=["Produits"])

class ProductFilters(FilterParams):
    name: str | None = None
    product_type_id: int | None = None

@router.get("/", response_model=PaginatedResponse[ReadProduct], summary="Lister les produits")
def get_products(
    filters: Annotated[ProductFilters, Query()],
    session: Session = Depends(get_session)
):
    statement = select(Product)
    total_statement = select(func.count(Product.id))
    
    if filters.name:
        statement = statement.where(Product.name.ilike(f"%{filters.name}%"))
        total_statement = total_statement.where(Product.name.ilike(f"%{filters.name}%"))
    if filters.product_type_id:
        statement = statement.where(Product.product_type_id == filters.product_type_id)
        total_statement = total_statement.where(Product.product_type_id == filters.product_type_id)
        
    total = session.exec(total_statement).one()
    products = session.exec(statement.offset(filters.get_page).limit(filters.limit)).all()
    
    return PaginatedResponse[ReadProduct](
        total_pages=(total + filters.limit - 1) // filters.limit if total > 0 else 1,
        total=total,
        active_page=filters.page,
        data=products
    )

@router.post("/", response_model=ReadProduct, status_code=status.HTTP_201_CREATED, summary="Créer un produit")
def create_product(
    product_data: CreateProduct,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    # Vérification de l'existence du type de produit
    product_type = session.get(ProductType, product_data.product_type_id)
    if not product_type:
        raise HTTPException(status_code=400, detail="Le type de produit (product_type_id) n'existe pas.")

    db_product = Product.model_validate(product_data)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

@router.patch("/{product_id}", response_model=ReadProduct, summary="Modifier un produit")
def update_product(
    product_id: int,
    update_data: UpdateProduct,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN, RoleEnum.RECEPTIONISTE]))
):
    db_product = session.get(Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Produit introuvable")

    if update_data.product_type_id is not None:
        product_type = session.get(ProductType, update_data.product_type_id)
        if not product_type:
            raise HTTPException(status_code=400, detail="Le type de produit (product_type_id) n'existe pas.")
        
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_product, key, value)
        
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Supprimer un produit")
def delete_product(
    product_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.RoleChecker([RoleEnum.ADMIN]))
):
    db_product = session.get(Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Produit introuvable")
        
    session.delete(db_product)
    session.commit()