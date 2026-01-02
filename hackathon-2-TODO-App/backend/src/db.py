"""
Database connection and session management.

References: specs/database/schema.md
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")

# Convert postgresql:// to postgresql+asyncpg:// for async support
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
elif not DATABASE_URL.startswith("postgresql+asyncpg://"):
    raise ValueError("DATABASE_URL must start with postgresql:// or postgresql+asyncpg://")

# Create async engine with connection pooling (per CONSTITUTION.md Section XIII)
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_size=20,  # Number of connections to maintain
    max_overflow=40,  # Additional connections under load
    pool_timeout=30,  # Wait time for available connection (seconds)
    pool_recycle=3600,  # Recycle connections after 1 hour
    pool_pre_ping=True,  # Test connections before use (important for Neon)
)

# Create async session factory
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Don't expire objects after commit
)


async def get_session() -> AsyncSession:
    """
    FastAPI dependency for database sessions.

    Yields:
        AsyncSession: Database session

    Usage:
        @app.get("/items")
        async def get_items(db: AsyncSession = Depends(get_session)):
            result = await db.execute(select(Item))
            return result.scalars().all()
    """
    async with async_session() as session:
        yield session


async def init_db():
    """
    Initialize database tables.

    Only use in development. Production uses Alembic migrations.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
