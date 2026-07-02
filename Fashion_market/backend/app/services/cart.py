from sqlalchemy.orm import Session

from app.models.cart import CartItem
from app.models.product import Product


def get_cart(db: Session, user_id: int):
    items = db.query(CartItem).filter(CartItem.user_id == user_id).all()
    result = []
    total = 0.0
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            result.append({
                "id": item.id,
                "product_id": product.id,
                "product_name": product.name,
                "product_brand": product.brand,
                "product_price": product.price,
                "quantity": item.quantity,
            })
            total += product.price * item.quantity
    return result, total


def add_to_cart(db: Session, user_id: int, product_id: int, quantity: int = 1):
    existing = db.query(CartItem).filter(
        CartItem.user_id == user_id, CartItem.product_id == product_id
    ).first()
    if existing:
        existing.quantity += quantity
    else:
        new_item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
        db.add(new_item)
    db.commit()
    db.flush()


def update_cart_item(db: Session, cart_item_id: int, quantity: int, user_id: int):
    item = db.query(CartItem).filter(
        CartItem.id == cart_item_id, CartItem.user_id == user_id
    ).first()
    if not item:
        return False
    if quantity <= 0:
        db.delete(item)
    else:
        item.quantity = quantity
    db.commit()
    return True


def remove_cart_item(db: Session, cart_item_id: int, user_id: int):
    item = db.query(CartItem).filter(
        CartItem.id == cart_item_id, CartItem.user_id == user_id
    ).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True