from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.product import ProductResponse, ProductDetailResponse
from app.services.product import get_products, get_product, get_categories
from app.models.category import Category

router = APIRouter(prefix="/api/products", tags=["商品"])


@router.get("/", response_model=list[ProductResponse])
def list_products(
    category_id: int | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    products = get_products(db, category_id=category_id, search=search)
    return [ProductResponse.model_validate(p) for p in products]


@router.get("/{product_id}", response_model=ProductDetailResponse)
def detail(product_id: int, db: Session = Depends(get_db)):
    product, category = get_product(db, product_id)
    if not product:
        return None
    resp = ProductDetailResponse.model_validate(product)
    resp.category_name = category.name if category else None
    return resp


@router.get("/categories/", response_model=list)
def categories(db: Session = Depends(get_db)):
    cats = get_categories(db)
    return [{"id": c.id, "name": c.name, "icon": c.icon} for c in cats]