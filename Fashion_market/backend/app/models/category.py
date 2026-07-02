from sqlalchemy import Column, Integer, String, SmallInteger

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    icon = Column(String(20), nullable=False)
    sort_order = Column(SmallInteger, default=0)