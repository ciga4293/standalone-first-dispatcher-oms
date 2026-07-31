import asyncpg
from app.core.config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

pool: asyncpg.Pool = None

async def init_db_pool():
    global pool
    try:
        pool = await asyncpg.create_pool(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            min_size=2,
            max_size=10
        )
        print("[DB] Connection pool to PostgreSQL established.")
    except Exception as e:
        print(f"[DB Warning] Could not connect to PostgreSQL database: {e}")

async def close_db_pool():
    global pool
    if pool:
        await pool.close()
        print("[DB] Connection pool to PostgreSQL closed.")

async def get_db_connection():
    if not pool:
        raise RuntimeError("Database connection pool is not initialized.")
    async with pool.acquire() as connection:
        yield connection
