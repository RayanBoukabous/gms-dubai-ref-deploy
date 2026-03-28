"""
backend/database.py
────────────────────
PostgreSQL connection pool + table bootstrap.
Uses psycopg2 (sync) — simple and compatible with FastAPI via run_in_executor.
"""

import psycopg2
from psycopg2 import pool
from config import DATABASE_URL

# ── Connection pool (min 1, max 10 connections) ───────────────────────────────
_pool: pool.SimpleConnectionPool | None = None


def get_pool() -> pool.SimpleConnectionPool:
    global _pool
    if _pool is None:
        _pool = pool.SimpleConnectionPool(1, 10, dsn=DATABASE_URL)
    return _pool


def get_conn():
    """Borrow a connection from the pool."""
    return get_pool().getconn()


def release_conn(conn):
    """Return a connection to the pool."""
    get_pool().putconn(conn)


# ── Bootstrap: create tables if they don't exist ─────────────────────────────
CREATE_USERS_TABLE = """
CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    email      TEXT   NOT NULL UNIQUE,
    username   TEXT   NOT NULL UNIQUE,
    hashed_pw  TEXT   NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""


def init_db():
    """
    Called once at startup to ensure all tables exist.
    Safe to call repeatedly (uses IF NOT EXISTS).
    """
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(CREATE_USERS_TABLE)
        conn.commit()
        print("[DB] Tables OK")
    except Exception as e:
        conn.rollback()
        print(f"[DB] Init error: {e}")
        raise
    finally:
        release_conn(conn)