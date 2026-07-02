from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.category import Category


def get_products(db: Session, category_id: int | None = None, search: str | None = None):
    query = db.query(Product).filter(Product.is_active == True)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if search:
        query = query.filter(Product.name.like(f"%{search}%") | Product.brand.like(f"%{search}%"))
    return query.order_by(Product.id.desc()).all()


def get_product(db: Session, product_id: int):
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        return None, None
    category = db.query(Category).filter(Category.id == product.category_id).first()
    return product, category


def get_categories(db: Session):
    return db.query(Category).order_by(Category.sort_order).all()