from app.database import SessionLocal, Base, engine, create_tables
from app.models.category import Category
from app.models.product import Product
from app.models.user import User
from app.models.cart import CartItem
from app.services.auth import hash_password

SEED_CATEGORIES = [
    {"name": "连衣裙", "icon": "\U0001F457", "sort_order": 1},
    {"name": "上装", "icon": "\U0001F454", "sort_order": 2},
    {"name": "下装", "icon": "\U0001F456", "sort_order": 3},
    {"name": "外套", "icon": "\U0001F458", "sort_order": 4},
    {"name": "配饰", "icon": "\U0001F484", "sort_order": 5},
]

SEED_PRODUCTS = [
    {"name": "法式碎花浪漫连衣裙", "brand": "MISSME", "price": 599, "original_price": 899, "category_id": 1, "tag": "new", "description": "法式优雅碎花设计，轻盈飘逸，春夏约会必备"},
    {"name": "优雅针织短款上衣", "brand": "ATELIER", "price": 329, "original_price": 459, "category_id": 2, "tag": "hot", "description": "精致针织面料，短款设计显高显瘦"},
    {"name": "高腰显瘦阔腿裤", "brand": "MISSME", "price": 269, "original_price": 399, "category_id": 3, "tag": None, "description": "高腰设计拉长腿部比例，阔腿版型舒适遮肉"},
    {"name": "小香风粗花呢外套", "brand": "COCO", "price": 899, "original_price": 1299, "category_id": 4, "tag": "new", "description": "经典小香风设计，粗花呢面料质感高级"},
    {"name": "珍珠链条优雅手提包", "brand": "LUNA", "price": 459, "original_price": 599, "category_id": 5, "tag": None, "description": "珍珠链条设计，优雅精致，百搭单品"},
    {"name": "丝缎光泽吊带裙", "brand": "MISSME", "price": 449, "original_price": 699, "category_id": 1, "tag": "sale", "description": "丝缎面料光泽感十足，吊带设计性感优雅"},
    {"name": "泡泡袖复古衬衫", "brand": "ATELIER", "price": 289, "original_price": 399, "category_id": 2, "tag": "new", "description": "泡泡袖设计复古甜美，百搭日常通勤"},
    {"name": "莫兰迪色半身裙", "brand": "MISSME", "price": 239, "original_price": 359, "category_id": 3, "tag": "hot", "description": "莫兰迪配色低调高级，半身裙百搭优雅"},
    {"name": "羊绒双面大衣", "brand": "COCO", "price": 1299, "original_price": 1899, "category_id": 4, "tag": "sale", "description": "羊绒面料双面穿设计，高端大气保暖舒适"},
    {"name": "蝴蝶结丝巾领饰", "brand": "LUNA", "price": 129, "original_price": 199, "category_id": 5, "tag": "new", "description": "蝴蝶结设计精致可爱，丝巾领饰百搭单品"},
    {"name": "清新格纹A字连衣裙", "brand": "MISSME", "price": 399, "original_price": 599, "category_id": 1, "tag": None, "description": "清新格纹设计，A字版型显瘦遮肉"},
    {"name": "镂空蕾丝修身针织衫", "brand": "ATELIER", "price": 359, "original_price": 499, "category_id": 2, "tag": "hot", "description": "镂空蕾丝设计精致性感，修身版型显瘦"},
]

SUPER_ADMIN = {
    "username": "superadmin",
    "email": "superadmin@missme.com",
    "password": "admin123",
}


def seed():
    # Drop all tables and recreate (model structure changed)
    Base.metadata.drop_all(bind=engine)
    create_tables()

    db = SessionLocal()

    # Create super admin
    super_admin = User(
        username=SUPER_ADMIN["username"],
        email=SUPER_ADMIN["email"],
        password_hash=hash_password(SUPER_ADMIN["password"]),
        role="super_admin",
    )
    db.add(super_admin)
    db.commit()

    # Seed categories
    for cat in SEED_CATEGORIES:
        db.add(Category(**cat))
    db.commit()

    # Seed products
    for prod in SEED_PRODUCTS:
        db.add(Product(**prod))
    db.commit()

    print(f"初始化完成：1个超级管理员，{len(SEED_CATEGORIES)} 个分类，{len(SEED_PRODUCTS)} 个商品")
    print(f"超级管理员账号：{SUPER_ADMIN['username']} / {SUPER_ADMIN['password']}")
    db.close()


if __name__ == "__main__":
    seed()