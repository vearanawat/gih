from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR
import cv2
import numpy as np
from PIL import Image
import io

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en')

# Add root route
@app.get("/")
async def root():
    return {"message": "OCR Service is running"}

@app.post("/api/analyze-prescription")
async def analyze_prescription(prescription_image: UploadFile = File(...)):
    try:
        # Read image file
        contents = await prescription_image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Perform OCR
        result = ocr.ocr(img, cls=True)
        
        # Extract text and process results
        extracted_text = []
        medicines = []
        confidence = 0
        
        for line in result:
            for word_info in line:
                if isinstance(word_info, list) and len(word_info) > 1:
                    text_data = word_info[1]
                    if isinstance(text_data, tuple) and len(text_data) > 0:
                        text = text_data[0]
                        conf = float(text_data[1])
                        extracted_text.append(text)
                        confidence += conf
                        
                        # Basic medicine detection (you'll need to enhance this)
                        if any(keyword in text.lower() for keyword in ['tab', 'cap', 'mg', 'ml']):
                            medicines.append({
                                'name': text,
                                'confidence': conf,
                                'dosage': '',
                                'quantity': 0
                            })
        
        # Calculate average confidence
        confidence = confidence / len(extracted_text) if extracted_text else 0
        
        return {
            "extracted_text": "\n".join(extracted_text),
            "medicines": medicines,
            "confidence": confidence,
            "patient_name": "",  # You'll need to implement name extraction logic
            "doctor_name": "",   # You'll need to implement name extraction logic
            "date": ""          # You'll need to implement date extraction logic
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 