from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=False)

# Session factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

# Base class for models
Base = declarative_base()

# Dependency for routes
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Connect/disconnect for lifespan
async def connect_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def disconnect_db():
    await engine.dispose()
