from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.database import create_tables
from app.routers import auth, product, cart, admin

app = FastAPI(title="MISSME 女装商城 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(product.router)
app.include_router(cart.router)
app.include_router(admin.router)


@app.on_event("startup")
def startup():
    create_tables()


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "MISSME API is running"}