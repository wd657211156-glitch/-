from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, func

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    brand = Column(String(50), nullable=False)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    tag = Column(String(20), nullable=True)
    description = Column(String(500), nullable=True)
    stock = Column(Integer, default=100)
    is_active = Column(Boolean, default=True)  # 上架/下架状态
    created_at = Column(DateTime, server_default=func.now())