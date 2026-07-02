from pydantic import BaseModel


class AdminCreateRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "admin"  # only admin allowed, super_admin created via seed only


class AdminUpdateRequest(BaseModel):
    email: str | None = None
    phone: str | None = None


class AdminConfigUpdateRequest(BaseModel):
    admin_max_count: int


class AdminProductCreateRequest(BaseModel):
    name: str
    brand: str
    price: float
    original_price: float
    category_id: int
    tag: str | None = None
    description: str | None = None
    stock: int = 100


class AdminProductUpdateRequest(BaseModel):
    name: str | None = None
    brand: str | None = None
    price: float | None = None
    original_price: float | None = None
    category_id: int | None = None
    tag: str | None = None
    description: str | None = None
    stock: int | None = None


class ProductStatusUpdate(BaseModel):
    is_active: bool