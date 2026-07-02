import jwt
from fastapi import Header, HTTPException
from passlib.context import CryptContext

from app.config import JWT_SECRET
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(user: User) -> str:
    payload = {"sub": user.id, "username": user.username, "role": user.role}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None


def get_current_user_id(authorization: str = Header(None)) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "未登录")
    token = authorization.removeprefix("Bearer ")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "token 无效")
    return payload["sub"]


def get_current_user_role(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "未登录")
    token = authorization.removeprefix("Bearer ")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "token 无效")
    return payload.get("role", "user")


def require_role(allowed_roles: list[str]):
    def checker(authorization: str = Header(None)):
        role = get_current_user_role(authorization)
        if role not in allowed_roles:
            raise HTTPException(403, f"权限不足，需要角色：{allowed_roles}")
        # Return both user_id and role for convenience
        token = authorization.removeprefix("Bearer ")
        payload = decode_token(token)
        return {"user_id": payload["sub"], "role": role}
    return checker