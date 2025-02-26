from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import the route adding functions from both services
from medical_imaging import add_medical_imaging_routes
from ocr_service import add_ocr_routes

# Create the main FastAPI app
app = FastAPI(
    title="MediFlow Combined API",
    description="Combined API for medical imaging and OCR services",
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

# Add routes from both services
add_medical_imaging_routes(app)
add_ocr_routes(app)  # We'll need to modify ocr_service.py to expose this function

# Root endpoint
@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "MediFlow Combined API is running",
        "services": ["Medical Imaging", "OCR"],
        "docs_url": "/docs",
        "openapi_url": "/openapi.json"
    } 