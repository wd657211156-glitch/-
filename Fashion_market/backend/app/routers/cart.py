from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.cart import CartAddRequest, CartUpdateRequest, CartResponse, CartItemResponse
from app.services.auth import decode_token
from app.services.cart import get_cart, add_to_cart, update_cart_item, remove_cart_item

router = APIRouter(prefix="/api/cart", tags=["购物车"])


def get_current_user_id(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "未登录")
    token = authorization.removeprefix("Bearer ")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "token 无效")
    return payload["sub"]


@router.get("/", response_model=CartResponse)
def view_cart(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    items, total = get_cart(db, user_id)
    return CartResponse(
        items=[CartItemResponse(**item) for item in items],
        total=total,
    )


@router.post("/add")
def add(req: CartAddRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    add_to_cart(db, user_id, req.product_id, req.quantity)
    return {"message": "已加入购物车"}


@router.put("/update")
def update(req: CartUpdateRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    ok = update_cart_item(db, req.cart_item_id, req.quantity, user_id)
    if not ok:
        raise HTTPException(404, "购物车商品不存在")
    return {"message": "已更新数量"}


@router.delete("/remove/{cart_item_id}")
def remove(cart_item_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    ok = remove_cart_item(db, cart_item_id, user_id)
    if not ok:
        raise HTTPException(404, "购物车商品不存在")
    return {"message": "已删除"}