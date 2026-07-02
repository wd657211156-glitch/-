from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import ADMIN_MAX_COUNT
from app.models.user import User
from app.schemas.user import UserResponse
from app.schemas.admin import (
    AdminCreateRequest, AdminUpdateRequest, AdminConfigUpdateRequest,
    AdminProductCreateRequest, AdminProductUpdateRequest, ProductStatusUpdate,
)
from app.schemas.product import ProductResponse
from app.services.auth import require_role
from app.services.admin import (
    get_admin_users, create_admin, update_admin, delete_admin,
    get_admin_config, get_all_products, admin_create_product,
    admin_update_product, admin_delete_product, admin_toggle_product_status,
)

router = APIRouter(prefix="/api/admin", tags=["管理后台"])


# ========== 管理员管理（仅 super_admin） ==========

@router.get("/users", response_model=list[UserResponse])
def list_admin_users(
    auth: dict = Depends(require_role(["super_admin"])),
    db: Session = Depends(get_db),
):
    return [UserResponse.model_validate(u) for u in get_admin_users(db)]


@router.post("/users", response_model=UserResponse)
def create_admin_user(
    req: AdminCreateRequest,
    auth: dict = Depends(require_role(["super_admin"])),
    db: Session = Depends(get_db),
):
    try:
        user = create_admin(db, req.username, req.email, req.password, req.role)
        return UserResponse.model_validate(user)
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.put("/users/{user_id}", response_model=UserResponse)
def update_admin_user(
    user_id: int,
    req: AdminUpdateRequest,
    auth: dict = Depends(require_role(["super_admin"])),
    db: Session = Depends(get_db),
):
    try:
        user = update_admin(db, user_id, req.email, req.phone)
        return UserResponse.model_validate(user)
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.delete("/users/{user_id}")
def delete_admin_user(
    user_id: int,
    auth: dict = Depends(require_role(["super_admin"])),
    db: Session = Depends(get_db),
):
    try:
        delete_admin(db, user_id, auth["user_id"])
        return {"message": "已删除"}
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.get("/config")
def get_config(auth: dict = Depends(require_role(["super_admin"]))):
    return get_admin_config()


@router.put("/config")
def update_config(
    req: AdminConfigUpdateRequest,
    auth: dict = Depends(require_role(["super_admin"])),
):
    global ADMIN_MAX_COUNT
    ADMIN_MAX_COUNT = req.admin_max_count
    return {"admin_max_count": ADMIN_MAX_COUNT, "message": "上限已更新"}


# ========== 商品管理（admin + super_admin） ==========

@router.get("/products", response_model=list[ProductResponse])
def admin_list_products(
    auth: dict = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db),
):
    products = get_all_products(db, include_inactive=True)
    return [ProductResponse.model_validate(p) for p in products]


@router.post("/products", response_model=ProductResponse)
def admin_add_product(
    req: AdminProductCreateRequest,
    auth: dict = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db),
):
    product = admin_create_product(db, **req.model_dump())
    return ProductResponse.model_validate(product)


@router.put("/products/{product_id}", response_model=ProductResponse)
def admin_edit_product(
    product_id: int,
    req: AdminProductUpdateRequest,
    auth: dict = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db),
):
    try:
        product = admin_update_product(db, product_id, **req.model_dump(exclude_none=True))
        return ProductResponse.model_validate(product)
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.delete("/products/{product_id}")
def admin_remove_product(
    product_id: int,
    auth: dict = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db),
):
    try:
        admin_delete_product(db, product_id)
        return {"message": "已删除"}
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.put("/products/{product_id}/status", response_model=ProductResponse)
def admin_toggle_status(
    product_id: int,
    req: ProductStatusUpdate,
    auth: dict = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db),
):
    try:
        product = admin_toggle_product_status(db, product_id, req.is_active)
        return ProductResponse.model_validate(product)
    except ValueError as e:
        raise HTTPException(400, str(e))