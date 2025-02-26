from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from typing import Optional, List
import numpy as np
import torch
from transformers import AutoModelForImageClassification, AutoProcessor, pipeline
from PIL import Image
from huggingface_hub import login
import logging
import io
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dictionary of fallback models for each type
MODEL_OPTIONS = {
    "xray": [
        "nateraw/xray-diagnosis",  # Original model (not found)
        "medicalai/clinical-xray-diagnosis",  # Alternative medical X-ray model
        "microsoft/resnet-50"  # General purpose fallback
    ],
    "ct": [
        "nateraw/ct-scan-diagnosis",  # Original model (not found)
        "microsoft/swin-tiny-patch4-window7-224",  # General purpose alternative
        "google/vit-base-patch16-224"  # Another general purpose fallback
    ]
}

# Global variables to store models
xray_model = None
xray_processor = None
ct_model = None
ct_processor = None
disease_model = None

def init_models(token=None):
    """Initialize models with Hugging Face token."""
    global xray_model, xray_processor, ct_model, ct_processor, disease_model
    
    if token:
        login(token=token)
    
    try:
        xray_model, xray_processor = load_model_with_fallback("xray")
        ct_model, ct_processor = load_model_with_fallback("ct")
        disease_model = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
        logger.info("All models loaded successfully!")
        return True
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        return False

# Load models with fallback options
def load_model_with_fallback(model_type):
    model_options = MODEL_OPTIONS.get(model_type, [])
    last_exception = None
    
    for model_name in model_options:
        try:
            logger.info(f"Attempting to load {model_type} model: {model_name}")
            model = AutoModelForImageClassification.from_pretrained(model_name)
            processor = AutoProcessor.from_pretrained(model_name)
            logger.info(f"Successfully loaded {model_name}")
            return model, processor
        except Exception as e:
            logger.warning(f"Failed to load {model_name}: {e}")
            last_exception = e
    
    # If we've exhausted all options
    raise RuntimeError(f"Failed to load any {model_type} model. Last error: {last_exception}")

# Function to predict X-ray result
def predict_xray(image_data):
    """
    Process X-ray image for prediction
    
    Args:
        image_data: PIL Image or path to image
    
    Returns:
        dict: Prediction results
    """
    global xray_model, xray_processor
    
    try:
        # Convert to PIL Image if it's a path
        if isinstance(image_data, str):
            image = Image.open(image_data).convert("RGB")
        else:
            image = image_data.convert("RGB")
            
        inputs = xray_processor(images=image, return_tensors="pt")
        
        with torch.no_grad():
            outputs = xray_model(**inputs)
        
        logits = outputs.logits[0]
        predicted_class = torch.argmax(logits).item()
        
        # Get top 3 predictions
        softmax_scores = torch.softmax(logits, dim=0)
        top_scores, top_indices = torch.topk(softmax_scores, 3)
        
        top_predictions = []
        for i, (score, idx) in enumerate(zip(top_scores.tolist(), top_indices.tolist())):
            top_predictions.append({
                "prediction": xray_model.config.id2label[idx],
                "rank": i+1
            })
        
        return {
            "prediction": xray_model.config.id2label[predicted_class], 
            "top_predictions": top_predictions
        }
    except Exception as e:
        logger.error(f"Error predicting X-ray: {e}")
        return {"error": str(e)}

# Function to predict CT scan result
def predict_ct(image_data):
    """
    Process CT image for prediction
    
    Args:
        image_data: PIL Image or path to image
    
    Returns:
        dict: Prediction results
    """
    global ct_model, ct_processor
    
    try:
        # Convert to PIL Image if it's a path
        if isinstance(image_data, str):
            image = Image.open(image_data).convert("RGB")
        else:
            image = image_data.convert("RGB")
            
        inputs = ct_processor(images=image, return_tensors="pt")
        
        with torch.no_grad():
            outputs = ct_model(**inputs)
        
        logits = outputs.logits[0]
        predicted_class = torch.argmax(logits).item()
        
        # Get top 3 predictions
        softmax_scores = torch.softmax(logits, dim=0)
        top_scores, top_indices = torch.topk(softmax_scores, 3)
        
        top_predictions = []
        for i, (score, idx) in enumerate(zip(top_scores.tolist(), top_indices.tolist())):
            top_predictions.append({
                "prediction": ct_model.config.id2label[idx],
                "rank": i+1
            })
        
        return {
            "prediction": ct_model.config.id2label[predicted_class], 
            "top_predictions": top_predictions
        }
    except Exception as e:
        logger.error(f"Error predicting CT scan: {e}")
        return {"error": str(e)}

# Function to predict disease based on symptoms
def predict_disease(symptoms):
    global disease_model
    
    try:
        candidate_labels = ["COVID-19", "Flu", "Common Cold", "Pneumonia", "Bronchitis", 
                           "Asthma", "Tuberculosis", "Lung Cancer", "Heart Disease", "Diabetes"]
        result = disease_model(symptoms, candidate_labels)
        
        # Format results as a list of predictions with confidence
        predictions = []
        for label, score in zip(result['labels'], result['scores']):
            predictions.append({
                "disease": label,
                "confidence": score
            })
        
        return {
            "disease_prediction": result['labels'][0], 
            "all_predictions": predictions
        }
    except Exception as e:
        logger.error(f"Error predicting disease: {e}")
        return {"error": str(e)}

# Function to add routes to an existing FastAPI app
def add_medical_imaging_routes(app):
    # Initialize models endpoint
    @app.post("/medical/init-models")
    async def initialize_models(token: Optional[str] = Form(None)):
        """Initialize all medical imaging models."""
        success = init_models(token)
        if success:
            return {"status": "success", "message": "Models initialized successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to initialize models")
    
    # X-ray prediction endpoint
    @app.post("/medical/predict-xray")
    async def process_xray(file: UploadFile = File(...)):
        """Process X-ray image and return prediction."""
        global xray_model, xray_processor
        
        if xray_model is None or xray_processor is None:
            # Try to initialize models without token
            success = init_models()
            if not success:
                return JSONResponse(
                    status_code=400,
                    content={"error": "Models not initialized. Call /medical/init-models first."}
                )
        
        try:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            result = predict_xray(image)
            
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing X-ray: {str(e)}")
    
    # CT scan prediction endpoint
    @app.post("/medical/predict-ct")
    async def process_ct(file: UploadFile = File(...)):
        """Process CT scan image and return prediction."""
        global ct_model, ct_processor
        
        if ct_model is None or ct_processor is None:
            # Try to initialize models without token
            success = init_models()
            if not success:
                return JSONResponse(
                    status_code=400,
                    content={"error": "Models not initialized. Call /medical/init-models first."}
                )
        
        try:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            result = predict_ct(image)
            
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing CT scan: {str(e)}")
    
    # Disease prediction endpoint
    @app.post("/medical/predict-disease")
    async def process_disease(symptoms: str = Form(...)):
        """Process symptoms text and return disease prediction."""
        global disease_model
        
        if disease_model is None:
            # Try to initialize models without token
            success = init_models()
            if not success:
                return JSONResponse(
                    status_code=400,
                    content={"error": "Models not initialized. Call /medical/init-models first."}
                )
        
        try:
            result = predict_disease(symptoms)
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing symptoms: {str(e)}")
    
    # Health check endpoint
    @app.get("/medical/health")
    async def health_check():
        """Check if medical imaging services are loaded and ready."""
        global xray_model, ct_model, disease_model
        
        status = {
            "xray_model": xray_model is not None,
            "ct_model": ct_model is not None,
            "disease_model": disease_model is not None,
            "all_ready": all([xray_model is not None, ct_model is not None, disease_model is not None])
        }
        
        return status
    
    logger.info("Medical imaging routes added to FastAPI app") 