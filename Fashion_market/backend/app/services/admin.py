from sqlalchemy.orm import Session

from app.config import ADMIN_MAX_COUNT
from app.models.user import User
from app.models.product import Product
from app.services.auth import hash_password


def get_admin_users(db: Session):
    return db.query(User).filter(User.role.in_(["admin", "super_admin"])).all()


def get_admin_count(db: Session):
    return db.query(User).filter(User.role == "admin").count()


def create_admin(db: Session, username: str, email: str, password: str, role: str = "admin"):
    if role not in ("admin",):
        raise ValueError("仅可创建普通管理员")
    if db.query(User).filter(User.username == username).first():
        raise ValueError("用户名已存在")
    if db.query(User).filter(User.email == email).first():
        raise ValueError("邮箱已被注册")

    current_count = get_admin_count(db)
    if current_count >= ADMIN_MAX_COUNT:
        raise ValueError(f"管理员数量已达上限（{ADMIN_MAX_COUNT}人）")

    user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_admin(db: Session, user_id: int, email: str | None = None, phone: str | None = None):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role not in ("admin", "super_admin"):
        raise ValueError("用户不存在或不是管理员")
    if email:
        user.email = email
    if phone:
        user.phone = phone
    db.commit()
    db.refresh(user)
    return user


def delete_admin(db: Session, user_id: int, current_user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role not in ("admin", "super_admin"):
        raise ValueError("用户不存在或不是管理员")
    if user.id == current_user_id:
        raise ValueError("不能删除自己")
    if user.role == "super_admin":
        raise ValueError("不能删除超级管理员")
    db.delete(user)
    db.commit()


def get_admin_config():
    return {"admin_max_count": ADMIN_MAX_COUNT}


def get_all_products(db: Session, include_inactive=True):
    query = db.query(Product)
    if not include_inactive:
        query = query.filter(Product.is_active == True)
    return query.order_by(Product.id.desc()).all()


def admin_create_product(db: Session, **kwargs):
    product = Product(**kwargs)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def admin_update_product(db: Session, product_id: int, **kwargs):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise ValueError("商品不存在")
    for key, value in kwargs.items():
        if value is not None:
            setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


def admin_delete_product(db: Session, product_id: int):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise ValueError("商品不存在")
    db.delete(product)
    db.commit()


def admin_toggle_product_status(db: Session, product_id: int, is_active: bool):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise ValueError("商品不存在")
    product.is_active = is_active
    db.commit()
    db.refresh(product)
    return product