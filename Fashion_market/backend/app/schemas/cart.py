from pydantic import BaseModel


class CartAddRequest(BaseModel):
    product_id: int
    quantity: int = 1


class CartUpdateRequest(BaseModel):
    cart_item_id: int
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_brand: str
    product_price: float
    quantity: int

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    total: float