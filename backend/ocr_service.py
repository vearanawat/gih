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
from fastapi.responses import JSONResponse
import easyocr
import logging
from typing import List, Dict, Any

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

# Initialize Groq client with API key
groq_api_key = os.getenv('GROQ_API_KEY')
if not groq_api_key:
    raise ValueError("GROQ_API_KEY environment variable is not set")

# Initialize Groq client
groq_client = Groq(api_key=groq_api_key)

# Initialize OCR
ocr = None

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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



##################### Multilingual OCR #####################

# Initialize EasyOCR reader
def get_easyocr_reader(lang_pair=['en']):
    try:
        return easyocr.Reader(lang_pair)
    except Exception as e:
        logger.error(f"Error initializing EasyOCR: {e}")
        return None

def calculate_iou(box1, box2):
    # Convert boxes to format [x1, y1, x2, y2]
    def get_box_coords(box):
        return [
            min(p[0] for p in box),
            min(p[1] for p in box),
            max(p[0] for p in box),
            max(p[1] for p in box)
        ]
    
    box1_coords = get_box_coords(box1)
    box2_coords = get_box_coords(box2)
    
    # Calculate intersection
    x1 = max(box1_coords[0], box2_coords[0])
    y1 = max(box1_coords[1], box2_coords[1])
    x2 = min(box1_coords[2], box2_coords[2])
    y2 = min(box1_coords[3], box2_coords[3])
    
    intersection = max(0, x2 - x1) * max(0, y2 - y1)
    
    # Calculate areas
    box1_area = (box1_coords[2] - box1_coords[0]) * (box1_coords[3] - box1_coords[1])
    box2_area = (box2_coords[2] - box2_coords[0]) * (box2_coords[3] - box2_coords[1])
    
    # Calculate IoU
    union = box1_area + box2_area - intersection
    return intersection / union if union > 0 else 0

def remove_duplicates(results, iou_threshold=0.5):
    filtered_results = []
    used = set()
    
    for i, res1 in enumerate(results):
        if i in used:
            continue
            
        current_group = [res1]
        used.add(i)
        
        for j, res2 in enumerate(results[i+1:], i+1):
            if j in used:
                continue
                
            # Calculate IoU between boxes
            box1 = np.array(res1[0])
            box2 = np.array(res2[0])
            iou = calculate_iou(box1, box2)
            
            if iou > iou_threshold:
                current_group.append(res2)
                used.add(j)
        
        # From the current group, select the one with highest confidence
        best_result = max(current_group, key=lambda x: x[2] if len(x) > 2 else 0)
        filtered_results.append(best_result)
    
    return filtered_results

def extract_text_and_confidence_easyocr(results):
    """Extract text and confidence scores from EasyOCR result."""
    extracted_data = []
    combined_text = ""
    
    for bbox, text, prob in results:
        # Add to combined text for summarization
        combined_text += text + " "
        
        extracted_data.append({
            "text": text,
            "confidence": float(prob),
            "box": bbox
        })
    
    # Get summary using Groq if text is available
    summary = ""
    if combined_text.strip():
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[{
                    "role": "user",
                    "content": f"""
You are a highly specialized AI trained in medical terminology, prescriptions, and pharmaceutical guidelines. 
Your task is to summarize the given medical prescription text while prioritizing **medicine names, dosages, 
frequencies, duration, medical conditions, and important instructions.**  

### **Instructions:**  
- **Extract and emphasize medicine names** mentioned in the text.  
- **Highlight dosages, intake frequency, and duration** (e.g., "500mg, twice a day for 5 days").  
- **Identify any diseases or medical conditions** mentioned in the prescription.  
- **Retain important doctor instructions** (e.g., "Take before meals", "Avoid alcohol", "Complete full course").  
- **Ignore irrelevant details** like hospital branding, unnecessary general text, or non-medical content.  

### **Prescription Text:**  
{combined_text}  

### **Expected Output:**  
A concise summary focusing only on **medical aspects**, ensuring that key prescription details (medicines, 
dosages, diseases, and instructions) are retained accurately.
"""
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

def create_annotated_image(image, results):
    # Convert PIL Image to numpy array if needed
    if isinstance(image, Image.Image):
        image = np.array(image)
    
    annotated = image.copy()
    
    for result in results:
        box = result[0]
        text = result[1]
        
        # Convert box points to numpy array
        box = np.array(box, dtype=np.int32)
        
        # Draw the bounding box
        cv2.polylines(annotated, [box], True, (0, 255, 0), 2)
        
        # Add text above the box
        x = min(p[0] for p in box)
        y = min(p[1] for p in box) - 10
        cv2.putText(annotated, text, (x, y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
    
    return Image.fromarray(annotated)

# Add this new route to your FastAPI app
@app.post("/process-multilingual")
async def process_multilingual(file: UploadFile = File(...)):
    try:
        # Define language pairs (each with English)
        language_pairs = [
            ['en', 'hi'],  # English + Hindi
            ['en', 'bn'],  # English + Bengali
            ['en', 'ta'],  # English + Tamil
            ['en', 'te'],  # English + Telugu
            ['en', 'kn'],  # English + Kannada
        ]
        
        # Read image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert PIL Image to numpy array
        img_array = np.array(image)
        
        all_results = []
        processing_times = {}
        
        # Process with each language pair
        for lang_pair in language_pairs:
            try:
                start_time = time.time()
                reader = get_easyocr_reader(lang_pair)
                if not reader:
                    continue
                
                # Perform OCR
                results = reader.readtext(img_array)
                processing_time = time.time() - start_time
                processing_times["-".join(lang_pair)] = processing_time
                
                all_results.extend(results)
                
            except Exception as e:
                print(f"Error processing {lang_pair}: {str(e)}")
        
        if not all_results:
            return {
                "results": [],
                "message": "No text detected in image"
            }
        
        # Remove duplicates based on bounding box overlap
        final_results = remove_duplicates(all_results)
        
        # Extract text and confidence scores
        extracted_data = extract_text_and_confidence_easyocr(final_results)
        
        # Generate annotated image
        try:
            annotated_image = create_annotated_image(image, final_results)
            
            # Save annotated image to bytes
            img_byte_arr = io.BytesIO()
            annotated_image.save(img_byte_arr, format='PNG')
            annotated_image_bytes = img_byte_arr.getvalue()
            
        except Exception as e:
            print(f"Error generating annotated image: {str(e)}")
            annotated_image_bytes = None
        
        # Calculate average confidence
        confidences = [item["confidence"] for item in extracted_data["extracted_data"]]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        # Extract text by language (basic approach)
        language_texts = {}
        for lang_pair in language_pairs:
            lang_code = lang_pair[1]  # Non-English language code
            language_texts[lang_code] = []
        
        # Just collecting all texts (a smarter approach would use language detection)
        full_text = extracted_data["full_text"]
        
        return {
            "results": extracted_data["extracted_data"],
            "structured_data": {
                "raw_text": full_text,
                "confidence": avg_confidence,
                "processing_times": processing_times,
                "languages_detected": list(language_pairs)
            },
            "annotated_image": annotated_image_bytes
        }
        
    except Exception as e:
        print(f"Error processing multilingual image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing multilingual image: {str(e)}")

def add_ocr_routes(app: FastAPI):
    reader = get_easyocr_reader()
    
    @app.post("/ocr/process-prescription")
    async def process_prescription(file: UploadFile = File(...)):
        """Process a prescription image using OCR."""
        try:
            # Read and validate the image
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            
            # Convert image to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Perform OCR
            results = reader.readtext(np.array(image))
            
            # Remove duplicate detections
            filtered_results = remove_duplicates(results)
            
            # Extract text and confidence
            text, confidence = extract_text_and_confidence(filtered_results)
            
            # Create annotated image
            annotated_image = create_annotated_image(image, filtered_results)
            
            # Convert annotated image to bytes
            annotated_bytes = io.BytesIO()
            annotated_image.save(annotated_bytes, format='PNG')
            
            return {
                "text": text,
                "confidence": confidence,
                "word_count": len(text.split()),
                "details": [
                    {
                        "text": r[1],
                        "confidence": r[2] if len(r) > 2 else 0,
                        "box": r[0]
                    } for r in filtered_results
                ]
            }
            
        except Exception as e:
            logger.error(f"Error processing prescription: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/ocr/process-multilingual")
    async def process_multilingual(
        file: UploadFile = File(...),
        languages: List[str] = ['en']  # Default to English
    ):
        """Process an image with multilingual OCR support."""
        try:
            # Initialize reader with specified languages
            multi_reader = get_easyocr_reader(languages)
            if not multi_reader:
                raise HTTPException(status_code=500, detail="Failed to initialize OCR reader")
            
            # Read and validate the image
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            
            # Convert image to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Perform OCR
            results = multi_reader.readtext(np.array(image))
            
            # Remove duplicate detections
            filtered_results = remove_duplicates(results)
            
            # Extract text and confidence
            text, confidence = extract_text_and_confidence(filtered_results)
            
            return {
                "text": text,
                "confidence": confidence,
                "languages": languages,
                "word_count": len(text.split()),
                "details": [
                    {
                        "text": r[1],
                        "confidence": r[2] if len(r) > 2 else 0,
                        "box": r[0]
                    } for r in filtered_results
                ]
            }
            
        except Exception as e:
            logger.error(f"Error processing multilingual text: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/ocr/health")
    async def health_check():
        """Check if OCR service is healthy."""
        return {
            "status": "ok",
            "message": "OCR service is running",
            "reader_initialized": reader is not None
        }
    
    logger.info("OCR routes added to FastAPI app")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 