"""
FastAPI application entry point.

Evolution of Todo - Phase II Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes import auth, tasks

# Create FastAPI app
app = FastAPI(
    title="Evolution of Todo API",
    description="AI-Native Task Management System",
    version="2.0.0",  # Phase II
)

# CORS middleware (allow all origins for development)
# TODO: Restrict origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Will be restricted to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "version": "2.0.0"}


@app.get("/api/v1/")
async def root():
    """API root endpoint."""
    return {
        "message": "Evolution of Todo API v1",
        "version": "2.0.0",
        "phase": "II - Full-Stack Web Application"
    }


# Register routers
app.include_router(auth.router)
app.include_router(tasks.router)
