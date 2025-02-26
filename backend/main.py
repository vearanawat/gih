from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

# Create FastAPI app
app = FastAPI(
    title="MediFlow API",
    description="Medical imaging and diagnostics API for MediFlow",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and add medical imaging routes
from medical_imaging import add_medical_imaging_routes
add_medical_imaging_routes(app)

# Root endpoint
@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "MediFlow API is running",
        "docs_url": "/docs",
        "openapi_url": "/openapi.json"
    }

if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.getenv("PORT", 8000))
    
    # Run the FastAPI application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True  # Enable auto-reload during development
    ) 