from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import init_db_pool, close_db_pool
from app.routers import orders, fleet, breakdown

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Lifespan Event
    await init_db_pool()
    yield
    # Shutdown Lifespan Event
    await close_db_pool()

app = FastAPI(
    title="Dispatcher & OMS Backend API",
    description="FastAPI Backend Service untuk Manajemen Dispatcher, Fleet, dan Logistik OMS",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS Middleware for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Di produksi sesuaikan dengan domain Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(orders.router)
app.include_router(fleet.router)
app.include_router(breakdown.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Dispatcher OMS FastAPI Backend",
        "docs": "/docs"
    }
