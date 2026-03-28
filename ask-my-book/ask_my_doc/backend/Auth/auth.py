"""
backend/auth.py
────────────────
Password hashing, JWT creation/verification, and user DB operations.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES
from DataBase.database import get_conn, release_conn

# ── Password hashing (bcrypt) ─────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT ───────────────────────────────────────────────────────────────────────
def create_access_token(user_id: int, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """
    Returns the decoded payload dict, or None if the token is invalid/expired.
    """
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None


# ── User DB operations ────────────────────────────────────────────────────────
def db_create_user(email: str, username: str, hashed_pw: str) -> dict:
    """
    Insert a new user. Raises ValueError if email/username already taken.
    Returns the created user row as a dict.
    """
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (email, username, hashed_pw)
                VALUES (%s, %s, %s)
                RETURNING id, email, username, created_at
                """,
                (email.lower().strip(), username.strip(), hashed_pw),
            )
            row = cur.fetchone()
        conn.commit()
        return {
            "id":         row[0],
            "email":      row[1],
            "username":   row[2],
            "created_at": row[3].isoformat(),
        }
    except Exception as e:
        conn.rollback()
        msg = str(e)
        if "users_email_key" in msg:
            raise ValueError("This email is already registered.")
        if "users_username_key" in msg:
            raise ValueError("This username is already taken.")
        raise
    finally:
        release_conn(conn)


def db_get_user_by_email(email: str) -> Optional[dict]:
    """Fetch a user row by email. Returns None if not found."""
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, email, username, hashed_pw, created_at FROM users WHERE email = %s",
                (email.lower().strip(),),
            )
            row = cur.fetchone()
        if not row:
            return None
        return {
            "id":        row[0],
            "email":     row[1],
            "username":  row[2],
            "hashed_pw": row[3],
            "created_at": row[4].isoformat(),
        }
    finally:
        release_conn(conn)


def db_get_user_by_id(user_id: int) -> Optional[dict]:
    """Fetch a user row by id. Returns None if not found."""
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, email, username, created_at FROM users WHERE id = %s",
                (user_id,),
            )
            row = cur.fetchone()
        if not row:
            return None
        return {
            "id":         row[0],
            "email":      row[1],
            "username":   row[2],
            "created_at": row[3].isoformat(),
        }
    finally:
        release_conn(conn)