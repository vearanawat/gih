from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR, draw_ocr
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import io
import re
from datetime import datetime
import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set environment variable to avoid library conflicts
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'

# Initialize PaddleOCR and Groq
ocr = PaddleOCR(use_angle_cls=True, lang='en')

# Get Groq API key from environment variable
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise ValueError("GROQ_API_KEY environment variable is not set")

groq_client = Groq(api_key=groq_api_key)

def get_ocr():
    global ocr
    if ocr is None:
        ocr = PaddleOCR(
            use_angle_cls=True,
            lang='en',
            use_gpu=False,
            show_log=False
        )
    return ocr

def extract_score(value):
    """Extracts the first float number from a string or tuple."""
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        match = re.search(r"\d+(\.\d+)?", value)
        return float(match.group()) if match else 0.0
    if isinstance(value, tuple):
        return extract_score(value[0])
    return 0.0

def extract_text_and_confidence(result):
    """Extract text and confidence scores from OCR result."""
    extracted_data = []
    combined_text = ""
    
    for line in result:
        for item in line:
            text = item[1][0]
            confidence = float(item[1][1])
            box_data = item[0]
            
            # Add to combined text for summarization
            combined_text += text + " "
            
            extracted_data.append({
                "text": text,
                "confidence": confidence,
                "box": box_data
            })
    
    # Get summary using Groq if text is available
    summary = ""
    if combined_text.strip():
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[{
                    "role": "user",
                    "content": f"Summarize this medical prescription text concisely: {combined_text}"
                }],
                model="llama-3.3-70b-versatile",
            )
            summary = chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Error getting summary: {e}")
            summary = "Error generating summary"
    
    return {
        "extracted_data": extracted_data,
        "summary": summary,
        "full_text": combined_text.strip()
    }

def extract_date(text):
    """Extract date from text using various formats."""
    date_patterns = [
        r'\d{2}[-/]\d{2}[-/]\d{4}',
        r'\d{4}[-/]\d{2}[-/]\d{2}',
        r'\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}'
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group()
    return ""

def extract_names(text):
    """Extract potential patient and doctor names."""
    name_patterns = [
        r'Dr\.\s[A-Z][a-z]+\s[A-Z][a-z]+',
        r'Patient:\s[A-Z][a-z]+\s[A-Z][a-z]+',
        r'Name:\s[A-Z][a-z]+\s[A-Z][a-z]+'
    ]
    
    doctor_name = ""
    patient_name = ""
    
    for line in text.split('\n'):
        if 'Dr.' in line:
            doctor_name = line.strip()
        elif 'Patient:' in line or 'Name:' in line:
            patient_name = line.split(':')[-1].strip()
            
    return patient_name, doctor_name

def extract_medicines(text):
    """Extract medicine information from text."""
    medicines = []
    medicine_patterns = [
        r'(?P<name>\b[A-Za-z]+)\s+(?P<dosage>\d+\s*(?:mg|ml|g))',
        r'Tab\.\s*(?P<name>[A-Za-z]+)\s*(?P<dosage>\d+\s*(?:mg|ml|g))?',
        r'Cap\.\s*(?P<name>[A-Za-z]+)\s*(?P<dosage>\d+\s*(?:mg|ml|g))?'
    ]
    
    lines = text.split('\n')
    for line in lines:
        for pattern in medicine_patterns:
            matches = re.finditer(pattern, line, re.IGNORECASE)
            for match in matches:
                medicine = {
                    'name': match.group('name'),
                    'dosage': match.group('dosage') if 'dosage' in match.groupdict() else '',
                    'quantity': 0,
                    'confidence': 0.9
                }
                medicines.append(medicine)
    
    return medicines

@app.get("/")
async def root():
    return {"status": "healthy", "message": "OCR Service is running"}

@app.post("/process-prescription")
async def process_prescription(file: UploadFile = File(...)):
    try:
        # Initialize OCR if not already done
        ocr_instance = get_ocr()
        
        # Read image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert PIL Image to numpy array
        img_array = np.array(image)
        
        # Perform OCR
        result = ocr_instance.ocr(img_array, cls=True)
        
        if not result or len(result) == 0:
            return {
                "results": [],
                "message": "No text detected in image"
            }
        
        # Extract text and confidence scores
        extracted_data = extract_text_and_confidence(result)
        
        # Combine all text for processing
        full_text = extracted_data["full_text"]
        
        # Extract structured information
        patient_name, doctor_name = extract_names(full_text)
        date = extract_date(full_text)
        medicines = extract_medicines(full_text)
        
        # Calculate average confidence
        confidences = [item["confidence"] for item in extracted_data["extracted_data"]]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        # Generate annotated image
        boxes = [item["box"] for item in extracted_data["extracted_data"]]
        texts = [item["text"] for item in extracted_data["extracted_data"]]
        scores = [item["confidence"] for item in extracted_data["extracted_data"]]
        
        try:
            font = ImageFont.load_default()
            annotated_image = draw_ocr(image, boxes, texts, scores)
            annotated_image = Image.fromarray(annotated_image)
            
            # Save annotated image to bytes
            img_byte_arr = io.BytesIO()
            annotated_image.save(img_byte_arr, format='PNG')
            annotated_image_bytes = img_byte_arr.getvalue()
            
        except Exception as e:
            print(f"Error generating annotated image: {str(e)}")
            annotated_image_bytes = None
        
        return {
            "results": extracted_data["extracted_data"],
            "structured_data": {
                "patient_name": patient_name,
                "doctor_name": doctor_name,
                "date": date,
                "medicines": medicines,
                "confidence": avg_confidence,
                "raw_text": full_text
            },
            "annotated_image": annotated_image_bytes
        }
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 