from pydantic import BaseModel


class ProductResponse(BaseModel):
    id: int
    name: str
    brand: str
    price: float
    original_price: float
    category_id: int
    tag: str | None = None
    description: str | None = None
    stock: int
    is_active: bool = True

    class Config:
        from_attributes = True


class ProductDetailResponse(ProductResponse):
    category_name: str | None = None